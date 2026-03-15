"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface EmbeddingPoint {
  x: number;
  y: number;
  chapter: string;
  page: number;
  preview: string;
}

const SUGGESTIONS = [
  "Quelle différence entre utiliser une IA et en embaucher une ?",
  "Comment fonctionne l'architecture mémoire ?",
  "C'est quoi SOUL.md et pourquoi c'est important ?",
  "Quelles protections mettre en place ?",
  "C'est quoi le RAG, comment ça marche ?",
];

const CHAPTER_COLORS: Record<string, string> = {
  "Introduction": "#ffffff",
  "Ch.1": "#facc15",
  "Ch.2": "#f97316",
  "Ch.3": "#ef4444",
  "Ch.4": "#22c55e",
  "Ch.5": "#166534",
  "Ch.6": "#3b82f6",
  "Ch.7": "#1e3a8a",
  "Ch.8": "#a855f7",
  "Ch.9": "#92400e",
  "Ch.10": "#9ca3af",
  "Ch.11": "#06b6d4",
  "Ch.12": "#f472b6",
};

function getChapterColor(chapter: string): string {
  for (const [key, color] of Object.entries(CHAPTER_COLORS)) {
    if (chapter.startsWith(key)) return color;
  }
  return "#6b7280";
}

function EmbeddingViz() {
  const [points, setPoints] = useState<EmbeddingPoint[]>([]);
  const [hovered, setHovered] = useState<EmbeddingPoint | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/embeddings-2d.json")
      .then((r) => r.json())
      .then(setPoints)
      .catch(() => {});
  }, []);

  if (points.length === 0) return null;

  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const chapters = [...new Set(points.map((p) => p.chapter))];

  return (
    <div className="mx-auto mt-4 max-w-3xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-gray-300 transition hover:border-gray-500"
      >
        <span>🗺️ Visualisation des embeddings du PDF</span>
        <span className="text-gray-500">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="mt-2 rounded-xl border border-gray-700 bg-gray-900 p-4">
          <p className="mb-3 text-xs text-gray-500">
            Chaque point = un passage du PDF. Les couleurs = les chapitres.
            Projection en 2D des vecteurs d&apos;embeddings (les données) (768dim → 2D).
          </p>

          <div className="relative mx-auto" style={{ width: "100%", paddingBottom: "60%" }}>
            <svg
              viewBox="0 0 500 300"
              className="absolute inset-0 h-full w-full"
              onMouseLeave={() => setHovered(null)}
            >
              <rect width="500" height="300" fill="#111827" rx="8" />
              {points.map((p, i) => {
                const cx = 30 + ((p.x - minX) / rangeX) * 440;
                const cy = 20 + ((p.y - minY) / rangeY) * 260;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={hovered === p ? 7 : 5}
                    fill={getChapterColor(p.chapter)}
                    opacity={hovered && hovered !== p ? 0.3 : 0.85}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHovered(p)}
                  />
                );
              })}
            </svg>
          </div>

          {hovered && (
            <div className="mt-3 rounded-lg border border-gray-700 bg-gray-800 p-3">
              <p className="text-xs font-medium text-gray-300">
                <span
                  className="mr-2 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: getChapterColor(hovered.chapter) }}
                />
                {hovered.chapter} — p.{hovered.page}
              </p>
              <p className="mt-1 text-xs text-gray-500">{hovered.preview}</p>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {chapters.map((ch) => (
              <span key={ch} className="flex items-center gap-1 text-xs text-gray-500">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: getChapterColor(ch) }}
                />
                {ch}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const { text: chunk } = JSON.parse(data);
              assistantContent += chunk;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch (error) {
      const errMsg =
        error instanceof Error ? error.message : "Une erreur est survenue";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Erreur : ${errMsg}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSuggestion(text: string) {
    setInput(text);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-4">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Image
            src="/logo.png"
            alt="LecTech"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-xl font-bold text-white">
              📖 How to Hire an AI
            </h1>
            <p className="text-sm text-gray-400">
              Posez vos questions sur le PDF de Felix Craft & Nat Eliason — propulsé par RAG
            </p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <>
              <div className="py-8 text-center">
                <p className="mb-6 text-gray-500">
                  Posez une question sur le PDF ou sur le fonctionnement du RAG
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="rounded-full border border-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:border-gray-500 hover:text-white"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <EmbeddingViz />
            </>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 text-gray-100"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {msg.content}
                  {isLoading &&
                    i === messages.length - 1 &&
                    msg.role === "assistant" &&
                    !msg.content && (
                      <span className="inline-block animate-pulse">▊</span>
                    )}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <footer className="border-t border-gray-800 px-4 py-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-3xl gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question sur le PDF..."
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
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-gray-600">
          Propulsé par{" "}
          <a
            href="https://lectech.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-400"
          >
            LecTech
          </a>{" "}
          — Réponses basées uniquement sur le contenu du PDF
        </p>
      </footer>
    </div>
  );
}
