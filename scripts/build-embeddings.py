"""
Découpe les articles Markdown, calcule leurs embeddings avec Gemini et écrit
data/embeddings.json (utilisé par l'API) et public/embeddings-map.json (carte).

Usage :
  pip install -r scripts/requirements.txt
  export GOOGLE_AI_API_KEY=...
  python scripts/build-embeddings.py
"""

import json
import os
import re
import sys
import time
from pathlib import Path

import numpy as np
from google import genai
from sklearn.decomposition import PCA

ROOT = Path(__file__).resolve().parent.parent
ARTICLES_DIR = ROOT / "content" / "articles"
OUTPUT = ROOT / "data" / "embeddings.json"
OUTPUT_2D = ROOT / "public" / "embeddings-map.json"

CHUNK_SIZE = 1200  # caractères, soit environ 300 tokens
EMBEDDING_MODEL = "gemini-embedding-001"
BATCH_SIZE = 20


def parse_article(path: Path) -> dict:
    """Sépare l'en-tête YAML (titre, date) du corps de l'article."""
    raw = path.read_text(encoding="utf-8").replace("\r\n", "\n")
    match = re.match(r"^---\n(.*?)\n---\n(.*)$", raw, re.DOTALL)
    if not match:
        raise ValueError(f"En-tête manquant dans {path.name}")
    header, body = match.groups()

    def field(name: str) -> str:
        found = re.search(rf'^{name}:\s*"(.*?)"\s*$', header, re.MULTILINE | re.DOTALL)
        return found.group(1).strip() if found else ""

    return {
        "slug": path.stem,
        "title": field("title"),
        "date": field("date"),
        "body": body.strip(),
    }


def chunk_article(article: dict) -> list[dict]:
    """Regroupe les paragraphes en passages d'au plus CHUNK_SIZE caractères."""
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", article["body"]) if p.strip()]
    passages: list[str] = []
    current = ""
    for paragraph in paragraphs:
        if current and len(current) + len(paragraph) > CHUNK_SIZE:
            passages.append(current)
            current = paragraph
        else:
            current = f"{current}\n\n{paragraph}" if current else paragraph
    if current:
        passages.append(current)

    # Le titre est répété dans chaque passage : il porte souvent le sujet de l'article.
    return [
        {
            "slug": article["slug"],
            "title": article["title"],
            "date": article["date"],
            "text": f"{article['title']}\n\n{passage}",
        }
        for passage in passages
    ]


def embed(chunks: list[dict]) -> list[dict]:
    api_key = os.environ.get("GOOGLE_AI_API_KEY")
    if not api_key:
        sys.exit("GOOGLE_AI_API_KEY n'est pas défini.")
    client = genai.Client(api_key=api_key)

    for start in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[start : start + BATCH_SIZE]
        response = client.models.embed_content(
            model=EMBEDDING_MODEL,
            contents=[chunk["text"] for chunk in batch],
        )
        for chunk, embedding in zip(batch, response.embeddings):
            chunk["embedding"] = embedding.values
        print(f"  {min(start + BATCH_SIZE, len(chunks))}/{len(chunks)} passages")
        time.sleep(0.5)  # reste sous la limite du palier gratuit
    return chunks


def project_2d(chunks: list[dict]) -> list[dict]:
    """Projection PCA des embeddings, pour la carte affichée dans l'interface."""
    matrix = np.array([chunk["embedding"] for chunk in chunks])
    points = PCA(n_components=2).fit_transform(matrix)
    return [
        {
            "x": round(float(x), 6),
            "y": round(float(y), 6),
            "slug": chunk["slug"],
            "title": chunk["title"],
        }
        for chunk, (x, y) in zip(chunks, points)
    ]


def main() -> None:
    articles = [parse_article(path) for path in sorted(ARTICLES_DIR.glob("*.md"))]
    chunks = [chunk for article in articles for chunk in chunk_article(article)]
    print(f"{len(articles)} articles, {len(chunks)} passages")

    chunks = embed(chunks)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(chunks, ensure_ascii=False), encoding="utf-8")
    OUTPUT_2D.write_text(
        json.dumps(project_2d(chunks), ensure_ascii=False), encoding="utf-8"
    )
    print(f"Écrit : {OUTPUT.relative_to(ROOT)}, {OUTPUT_2D.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
