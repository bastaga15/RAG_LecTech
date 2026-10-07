import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // L'index des embeddings est lu sur le disque par la route /api/chat
  outputFileTracingIncludes: {
    "/api/chat": ["./data/embeddings.json"],
  },
};

export default nextConfig;
