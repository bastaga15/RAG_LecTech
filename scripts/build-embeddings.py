"""
Parse the PDF, chunk it, embed with Gemini Embedding, and save to JSON.

Usage:
  pip install pymupdf google-genai
  export GOOGLE_AI_API_KEY=your_key
  python scripts/build-embeddings.py
"""

import json
import os
import sys
import time
import re
import fitz  # PyMuPDF
from google import genai

PDF_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "How-to-Hire-an-AI.pdf")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "embeddings.json")

CHUNK_SIZE = 1500  # chars (~375 tokens)
CHUNK_OVERLAP = 200  # chars overlap
EMBEDDING_MODEL = "gemini-embedding-001"


def extract_text_by_page(pdf_path: str) -> list[dict]:
    """Extract text from each page with chapter detection."""
    doc = fitz.open(pdf_path)
    pages = []
    current_chapter = "Introduction"

    for i, page in enumerate(doc):
        text = page.get_text().strip()
        if not text or len(text) < 10:
            continue

        # Detect chapter headings
        chapter_match = re.search(r"Chapter\s+\d+[:\s].+", text)
        if chapter_match:
            current_chapter = chapter_match.group(0).strip()

        pages.append({
            "text": text,
            "page": i + 1,
            "chapter": current_chapter,
        })

    doc.close()
    return pages


def chunk_pages(pages: list[dict]) -> list[dict]:
    """Split pages into overlapping chunks."""
    chunks = []

    for page_data in pages:
        text = page_data["text"]
        page = page_data["page"]
        chapter = page_data["chapter"]

        # Split on paragraph boundaries first
        paragraphs = re.split(r"\n\s*\n", text)
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) < CHUNK_SIZE:
                current_chunk += ("\n\n" if current_chunk else "") + para
            else:
                if current_chunk:
                    chunks.append({
                        "text": current_chunk,
                        "page": page,
                        "chapter": chapter,
                    })
                # Start new chunk with overlap from previous
                if len(current_chunk) > CHUNK_OVERLAP:
                    overlap = current_chunk[-CHUNK_OVERLAP:]
                    current_chunk = overlap + "\n\n" + para
                else:
                    current_chunk = para

        if current_chunk and len(current_chunk) > 50:
            chunks.append({
                "text": current_chunk,
                "page": page,
                "chapter": chapter,
            })

    return chunks


def embed_chunks(chunks: list[dict], batch_size: int = 20) -> list[dict]:
    """Embed all chunks using Gemini Embedding API."""
    api_key = os.environ.get("GOOGLE_AI_API_KEY")
    if not api_key:
        print("ERROR: Set GOOGLE_AI_API_KEY environment variable")
        sys.exit(1)

    client = genai.Client(api_key=api_key)

    results = []
    total = len(chunks)

    for i in range(0, total, batch_size):
        batch = chunks[i : i + batch_size]
        texts = [c["text"] for c in batch]

        print(f"  Embedding batch {i // batch_size + 1}/{(total + batch_size - 1) // batch_size} ({len(texts)} chunks)...")

        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=texts,
        )

        for j, emb in enumerate(response.embeddings):
            results.append({
                "text": batch[j]["text"],
                "embedding": emb.values,
                "page": batch[j]["page"],
                "chapter": batch[j]["chapter"],
            })

        # Respect rate limits
        if i + batch_size < total:
            time.sleep(0.5)

    return results


def main():
    print(f"[1/4] Reading PDF: {PDF_PATH}")
    pages = extract_text_by_page(PDF_PATH)
    print(f"       Found {len(pages)} pages with text")

    print(f"[2/4] Chunking text (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")
    chunks = chunk_pages(pages)
    print(f"       Created {len(chunks)} chunks")

    print(f"[3/4] Embedding with Gemini {EMBEDDING_MODEL}")
    embedded = embed_chunks(chunks)
    print(f"       Embedded {len(embedded)} chunks")

    print(f"[4/4] Saving to {OUTPUT_PATH}")
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(embedded, f, ensure_ascii=False)

    file_size = os.path.getsize(OUTPUT_PATH) / 1024 / 1024
    print(f"       Done! File size: {file_size:.1f} MB")


if __name__ == "__main__":
    main()
