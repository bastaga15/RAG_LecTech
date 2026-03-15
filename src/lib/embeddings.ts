export interface Chunk {
  text: string;
  embedding: number[];
  page: number;
  chapter: string;
}

let cachedChunks: Chunk[] | null = null;

export async function loadChunks(): Promise<Chunk[]> {
  if (cachedChunks) return cachedChunks;
  const res = await fetch(
    new URL("../../public/embeddings.json", import.meta.url)
  );
  cachedChunks = (await res.json()) as Chunk[];
  return cachedChunks;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function findTopChunks(
  queryEmbedding: number[],
  chunks: Chunk[],
  topK = 5
): Chunk[] {
  const scored = chunks.map((chunk) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((s) => s.chunk);
}
