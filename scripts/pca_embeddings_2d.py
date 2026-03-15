"""Project embeddings to 2D using PCA and save as embeddings-2d.json."""

import json
import numpy as np
from sklearn.decomposition import PCA
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INPUT = ROOT / "public" / "embeddings.json"
OUTPUT = ROOT / "public" / "embeddings-2d.json"

# Load
with open(INPUT, encoding="utf-8") as f:
    data = json.load(f)

print(f"Loaded {len(data)} chunks, embedding dim = {len(data[0]['embedding'])}")

# Build matrix and run PCA
X = np.array([d["embedding"] for d in data])
pca = PCA(n_components=2)
X2 = pca.fit_transform(X)

print(f"PCA explained variance ratio: {pca.explained_variance_ratio_}")

# Build output
result = []
for i, d in enumerate(data):
    preview = d["text"][:80] + "..."
    result.append({
        "x": round(float(X2[i, 0]), 6),
        "y": round(float(X2[i, 1]), 6),
        "chapter": d["chapter"],
        "page": d["page"],
        "preview": preview,
    })

with open(OUTPUT, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"Saved {len(result)} entries to {OUTPUT}")
