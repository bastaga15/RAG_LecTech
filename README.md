<p align="center">
  <img src="https://img.icons8.com/3d-fluency/94/book-and-pencil.png" alt="Book Icon" width="94"/>
</p>

<h1 align="center">How to Hire an AI — RAG Chatbot</h1>

<p align="center">
  <em>Chatbot interactif alimenté par RAG (Retrieval-Augmented Generation) pour explorer le livre <br/>"How to Hire an AI" de Felix Craft & Nat Eliason.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Groq-F55036?style=for-the-badge&logo=groq&logoColor=white" alt="Groq" />
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## Comment ca marche ?

L'utilisateur pose une question sur le livre. Le système recherche les passages les plus pertinents via similarity vectorielle, puis un LLM genere une reponse contextualisee en streaming.

```
Question utilisateur
       |
       v
  Embedding (Gemini)  --->  Cosine Similarity  --->  Top 5 chunks
                                                          |
                                                          v
                                                  LLM (Llama 3.3 via Groq)
                                                          |
                                                          v
                                                   Reponse streamee
```

## Stack technique

| Composant | Technologie | Role |
|-----------|------------|------|
| **Frontend** | Next.js + Tailwind CSS | Interface chat responsive |
| **Embeddings** | Gemini Embedding (text-embedding-001) | Vectorisation des chunks et des questions |
| **LLM** | Llama 3.3 70B via Groq | Generation des reponses en streaming |
| **Vector Store** | JSON statique + cosine similarity | Recherche des passages pertinents |
| **Rate Limiting** | Upstash Redis | Protection contre l'abus (20 req/h par IP) |
| **Hosting** | Vercel | Deploiement serverless |

## Architecture du projet

```
RAG_LecTech/
  scripts/
    build-embeddings.py    # Parse le PDF, chunk, embed, sauve en JSON
  src/
    app/
      api/chat/route.ts    # API : embed question + similarity + Groq streaming
      page.tsx              # Interface chat
      layout.tsx            # Layout + meta OG pour LinkedIn
    lib/
      embeddings.ts         # Cosine similarity + chargement des chunks
  public/
    embeddings.json         # Chunks pre-calcules (gitignored)
```

## Lancement local

### 1. Prerequis

- Node.js 18+
- Python 3.10+ (pour generer les embeddings)
- Cles API gratuites : [Groq](https://console.groq.com), [Google AI Studio](https://aistudio.google.com), [Upstash](https://console.upstash.com)

### 2. Installation

```bash
git clone https://github.com/bastaga15/RAG_LecTech.git
cd RAG_LecTech
npm install
cp .env.example .env
# Remplir les cles API dans .env
```

### 3. Generer les embeddings

```bash
pip install pymupdf google-genai
# Placer le PDF "How-to-Hire-an-AI.pdf" a la racine du projet parent
python scripts/build-embeddings.py
```

### 4. Lancer

```bash
npm run dev
# Ouvrir http://localhost:3000
```

## Securite

- **Rate limiting** : 20 requetes/heure par IP via Upstash Redis
- **Anti prompt injection** : System prompt renforce avec regles strictes
- **Security headers** : X-Content-Type-Options, X-Frame-Options, Referrer-Policy
- **Timeouts** : 10s sur les appels API externes
- **Aucune cle API exposee** : `.env` gitignored, aucun secret dans l'historique Git
- **Contenu du livre protege** : `embeddings.json` gitignored (non distribue)

## Cout

**$0** — Entierement gratuit grace aux free tiers :
- Groq : 30 req/min (Llama 3.3 70B)
- Google AI Studio : 1500 req/min (Gemini Embedding)
- Upstash Redis : 10K req/jour
- Vercel : 100K req/mois

---

<p align="center">
  <strong>Projet realise par <a href="https://lectech.fr">Bastien LECHAT — LecTech</a></strong>
</p>
