"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "What's the difference between using an AI and hiring one?",
  "How does the memory architecture work?",
  "What is SOUL.md and why does it matter?",
  "What safety rails should you put in place?",
];

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
        throw new Error(err.error || "Request failed");
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
        error instanceof Error ? error.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errMsg}` },
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
        <div className="mx-auto max-w-3xl">
          <h1 className="text-xl font-bold text-white">
            📖 How to Hire an AI
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Ask anything about the book by Felix Craft & Nat Eliason — powered
            by RAG
          </p>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="py-12 text-center">
              <p className="mb-6 text-gray-500">
                Ask a question about the book to get started
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
            placeholder="Ask about the book..."
            className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500"
            maxLength={1000}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-gray-600">
          Built by{" "}
          <a
            href="https://lectech.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-400"
          >
            LecTech
          </a>{" "}
          — Answers based on book content only
        </p>
      </footer>
    </div>
  );
}
