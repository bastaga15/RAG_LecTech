"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Image from "next/image";
import EmbeddingMap from "@/components/EmbeddingMap";

interface Source {
  slug: string;
  title: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const SUGGESTIONS = [
  "Comment extraire les contacts d'une boîte mail ?",
  "Qu'est-ce que Bastien a refusé d'automatiser, et pourquoi ?",
  "Où chercher des signaux faibles pour trouver des prospects ?",
  "Que fait le prévisionnel de trésorerie pour PME ?",
  "C'est quoi le RAG, comment ça marche ?",
];

const ARTICLE_URL = "https://lectech.fr/actualites/";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erreur de requête");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      const answer: Message = { role: "assistant", content: "" };
      let buffer = "";

      setMessages((prev) => [...prev, { ...answer }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Un événement peut être coupé entre deux lectures : on garde le reste pour la suivante
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";

        for (const event of events) {
          if (!event.startsWith("data: ")) continue;
          const data = event.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.sources) answer.sources = parsed.sources;
            if (parsed.text) answer.content += parsed.text;
          } catch {
            // événement mal formé : ignoré
          }
        }

        setMessages((prev) => [...prev.slice(0, -1), { ...answer }]);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Une erreur est survenue";
      setMessages((prev) => [...prev, { role: "assistant", content: `Erreur : ${errMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-gray-800 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Image src="/logo.png" alt="LecTech" width={40} height={40} className="rounded-lg" />
          <div>
            <h1 className="text-xl font-bold text-white">Interroger les articles LecTech</h1>
            <p className="text-sm text-gray-400">
              Les réponses s&apos;appuient sur 23 articles de lectech.fr et citent leurs sources.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <>
              <div className="py-8 text-center">
                <p className="mb-6 text-gray-400">
                  Posez une question sur les articles ou sur le fonctionnement du RAG.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <button
                  onClick={() => setIsMapOpen(!isMapOpen)}
                  aria-expanded={isMapOpen}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-300 transition hover:border-gray-500"
                >
                  <span>Carte des passages indexés</span>
                  <span className="text-gray-500">{isMapOpen ? "Masquer" : "Afficher"}</span>
                </button>
                {isMapOpen && (
                  <div className="mt-2 rounded-xl border border-gray-700 bg-gray-900 p-4">
                    <p className="mb-3 text-xs text-gray-400">
                      Chaque point est un passage d&apos;article, projeté de 3 072 dimensions vers
                      2. Une couleur par article.
                    </p>
                    <EmbeddingMap width={500} height={300} radius={5} />
                  </div>
                )}
              </div>
            </>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                  {isLoading && i === messages.length - 1 && !msg.content && (
                    <span className="inline-block animate-pulse">▊</span>
                  )}
                </p>
                {msg.sources && msg.sources.length > 0 && msg.content && (
                  <div className="mt-3 border-t border-gray-700 pt-2 text-xs text-gray-400">
                    <p className="mb-1">Articles consultés :</p>
                    <ul className="space-y-0.5">
                      {msg.sources.map((source) => (
                        <li key={source.slug}>
                          <a
                            href={`${ARTICLE_URL}${source.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-gray-200"
                          >
                            {source.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-gray-800 px-4 py-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-3xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question sur les articles..."
            aria-label="Votre question"
            className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
            maxLength={1000}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {isLoading ? "..." : "Envoyer"}
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-gray-500">
          Une démo{" "}
          <a
            href="https://lectech.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-300"
          >
            LecTech
          </a>
          . Les réponses reposent uniquement sur le contenu des articles.
        </p>
      </footer>
    </div>
  );
}
