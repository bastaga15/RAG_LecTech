import Groq from "groq-sdk";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { type Chunk, findTopChunks } from "@/lib/embeddings";
import { readFile } from "fs/promises";
import { join } from "path";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    analytics: false,
  });
}

let cachedChunks: Chunk[] | null = null;

async function getChunks(): Promise<Chunk[]> {
  if (cachedChunks) return cachedChunks;
  const filePath = join(process.cwd(), "public", "embeddings.json");
  const raw = await readFile(filePath, "utf-8");
  cachedChunks = JSON.parse(raw) as Chunk[];
  return cachedChunks;
}

async function embedQuery(text: string): Promise<number[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GOOGLE_AI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text }] },
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Embedding API error: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.embedding.values;
}

const SYSTEM_PROMPT = `You are an expert assistant on the book "How to Hire an AI: A Practical Playbook for Giving an AI a Real Job" by Felix Craft (an AI) and Nat Eliason.

Your role:
- Answer questions based ONLY on the provided book excerpts
- Be precise and cite specific concepts from the book
- If the question is outside the book's scope, say so politely
- Respond in the same language as the user's question
- Be concise but thorough

Book excerpts will be provided as context for each question.`;

export async function POST(request: Request) {
  try {
    // Rate limiting
    if (ratelimit) {
      const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again later." }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const { message } = await request.json();
    if (!message || typeof message !== "string" || message.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Invalid message" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Embed the question
    const queryEmbedding = await embedQuery(message);

    // Find relevant chunks
    const chunks = await getChunks();
    const topChunks = findTopChunks(queryEmbedding, chunks, 5);

    const context = topChunks
      .map((c, i) => `[Excerpt ${i + 1} — ${c.chapter}, p.${c.page}]\n${c.text}`)
      .join("\n\n");

    // Stream from Groq (Llama 3.3)
    const stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Context from the book:\n\n${context}\n\n---\nQuestion: ${message}`,
        },
      ],
      stream: true,
      temperature: 0.3,
      max_tokens: 1024,
    });

    // Return as SSE stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
