"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface EmbeddingPoint {
  x: number;
  y: number;
  chapter: string;
  page: number;
  preview: string;
}

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

export default function VizPage() {
  const [points, setPoints] = useState<EmbeddingPoint[]>([]);
  const [hovered, setHovered] = useState<EmbeddingPoint | null>(null);

  useEffect(() => {
    fetch("/embeddings-2d.json")
      .then((r) => r.json())
      .then(setPoints)
      .catch(() => {});
  }, []);

  if (points.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        Chargement...
      </div>
    );
  }

  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const chapters = [...new Set(points.map((p) => p.chapter))];

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 px-6 py-8">
      {/* Header */}
      <div className="mx-auto mb-6 w-full max-w-5xl">
        <div className="flex items-center gap-4">
          <Image
            src="/logo.png"
            alt="LecTech"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">
              Carte des embeddings — &quot;How to Hire an AI&quot;
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              64 passages du PDF projetés en 2D (768dim → 2D) — Les passages proches dans l&apos;espace vectoriel traitent de sujets similaires
            </p>
          </div>
        </div>
      </div>

      {/* Visualization */}
      <div className="mx-auto w-full max-w-5xl flex-1">
        <div className="rounded-2xl border border-gray-700 bg-gray-900 p-6">
          <div className="relative" style={{ width: "100%", paddingBottom: "55%" }}>
            <svg
              viewBox="0 0 800 440"
              className="absolute inset-0 h-full w-full"
              onMouseLeave={() => setHovered(null)}
            >
              <rect width="800" height="440" fill="#0a0f1a" rx="12" />

              {/* Grid lines */}
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <line
                  key={`h${i}`}
                  x1="40"
                  y1={i * 55}
                  x2="770"
                  y2={i * 55}
                  stroke="#1f2937"
                  strokeWidth="0.5"
                />
              ))}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => (
                <line
                  key={`v${i}`}
                  x1={40 + i * 56}
                  y1="20"
                  x2={40 + i * 56}
                  y2="420"
                  stroke="#1f2937"
                  strokeWidth="0.5"
                />
              ))}

              {/* Points */}
              {points.map((p, i) => {
                const cx = 50 + ((p.x - minX) / rangeX) * 700;
                const cy = 30 + ((p.y - minY) / rangeY) * 380;
                return (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={hovered === p ? 10 : 7}
                    fill={getChapterColor(p.chapter)}
                    opacity={hovered && hovered !== p ? 0.2 : 0.9}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHovered(p)}
                    stroke={hovered === p ? "#fff" : "none"}
                    strokeWidth={2}
                  />
                );
              })}
            </svg>
          </div>

          {/* Hovered info */}
          <div className="mt-4 h-16">
            {hovered ? (
              <div className="rounded-lg border border-gray-700 bg-gray-800 p-3">
                <p className="text-sm font-medium text-gray-200">
                  <span
                    className="mr-2 inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: getChapterColor(hovered.chapter) }}
                  />
                  {hovered.chapter} — page {hovered.page}
                </p>
                <p className="mt-1 text-xs text-gray-400">{hovered.preview}</p>
              </div>
            ) : (
              <p className="pt-4 text-center text-sm text-gray-600">
                Survolez un point pour voir le contenu du passage
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {chapters.map((ch) => (
              <span
                key={ch}
                className="flex items-center gap-1.5 text-xs text-gray-400"
              >
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: getChapterColor(ch) }}
                />
                {ch}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mx-auto mt-6 w-full max-w-5xl text-center">
        <p className="text-xs text-gray-600">
          Embeddings : Gemini (text-embedding-001) · Projection : PCA · Chatbot RAG :{" "}
          <a
            href="/"
            className="underline hover:text-gray-400"
          >
            rag.lectech.fr
          </a>{" "}
          · Propulsé par{" "}
          <a
            href="https://lectech.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-gray-400"
          >
            LecTech
          </a>
        </p>
      </div>
    </div>
  );
}
