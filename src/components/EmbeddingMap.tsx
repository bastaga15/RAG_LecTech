"use client";

import { useEffect, useState } from "react";

interface EmbeddingPoint {
  x: number;
  y: number;
  slug: string;
  title: string;
}

interface EmbeddingMapProps {
  width: number;
  height: number;
  radius: number;
}

// Une teinte par article, répartie sur le cercle chromatique
function articleColor(index: number, total: number): string {
  return `hsl(${Math.round((index / total) * 360)} 70% 60%)`;
}

export default function EmbeddingMap({ width, height, radius }: EmbeddingMapProps) {
  const [points, setPoints] = useState<EmbeddingPoint[]>([]);
  const [hovered, setHovered] = useState<EmbeddingPoint | null>(null);

  useEffect(() => {
    fetch("/embeddings-map.json")
      .then((r) => r.json())
      .then(setPoints)
      .catch(() => {});
  }, []);

  if (points.length === 0) return null;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const rangeX = Math.max(...xs) - minX || 1;
  const rangeY = Math.max(...ys) - minY || 1;
  const margin = radius * 4;

  const slugs = [...new Set(points.map((p) => p.slug))];
  const colorOf = (slug: string) => articleColor(slugs.indexOf(slug), slugs.length);

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full rounded-lg bg-gray-950"
        role="img"
        aria-label={`Carte de ${points.length} passages issus de ${slugs.length} articles`}
        onMouseLeave={() => setHovered(null)}
      >
        {points.map((p, i) => {
          // Un survol met en avant tous les passages du même article
          const sameArticle = hovered?.slug === p.slug;
          return (
            <circle
              key={i}
              cx={margin + ((p.x - minX) / rangeX) * (width - 2 * margin)}
              cy={margin + ((p.y - minY) / rangeY) * (height - 2 * margin)}
              r={sameArticle ? radius * 1.4 : radius}
              fill={colorOf(p.slug)}
              opacity={hovered && !sameArticle ? 0.2 : 0.9}
              className="cursor-pointer"
              onMouseEnter={() => setHovered(p)}
            />
          );
        })}
      </svg>

      <p className="mt-3 min-h-10 text-sm text-gray-400">
        {hovered ? (
          <>
            <span
              className="mr-2 inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: colorOf(hovered.slug) }}
            />
            {hovered.title}
          </>
        ) : (
          "Survolez un point pour voir de quel article vient le passage."
        )}
      </p>
    </div>
  );
}
