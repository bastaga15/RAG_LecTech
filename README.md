# RAG_LecTech

Un chatbot qui répond aux questions sur les articles de [lectech.fr](https://lectech.fr) et cite les articles dont vient chaque réponse.

## Le problème

Un modèle de langage ne connaît pas vos documents. Lui donner tout le corpus à chaque question coûte cher et dilue l'information utile. Le RAG (Retrieval-Augmented Generation) ne lui fournit que les passages qui concernent la question.

Ce dépôt en est une implémentation volontairement courte, sans base vectorielle ni framework : environ 600 lignes, lisibles en une demi-heure.

## Fonctionnement

1. `scripts/build-embeddings.py` découpe les 23 articles en 50 passages et calcule leur embedding avec Gemini.
2. À chaque question, l'API calcule l'embedding de la question et retient les 5 passages les plus proches par similarité cosinus.
3. Ces passages sont fournis à Llama 3.3 (via Groq), qui rédige la réponse en streaming.
4. L'interface affiche la réponse et les articles consultés, avec un lien vers chacun.

```
question ──> embedding ──> similarité cosinus ──> 5 passages ──> LLM ──> réponse + sources
                                  ▲
                 data/embeddings.json (calculé une fois)
```

| Rôle | Choix | Raison |
|---|---|---|
| Embeddings | Gemini `gemini-embedding-001`, 3 072 dimensions | Palier gratuit suffisant |
| Recherche | Similarité cosinus sur un fichier JSON | 50 passages : une base vectorielle serait superflue |
| Génération | Llama 3.3 70B via Groq | Rapide, palier gratuit |
| Limitation de débit | Upstash Redis, 20 requêtes par heure et par IP | Protège les quotas |
| Interface et API | Next.js, Tailwind CSS | Un seul déploiement |

La page `/viz` affiche la projection en deux dimensions des 50 passages.

## Installation

Prérequis : Node.js 20 ou plus. Python 3.10 ou plus seulement pour recalculer l'index.

```bash
git clone https://github.com/bastaga15/RAG_LecTech.git
cd RAG_LecTech
npm install
cp .env.example .env   # puis renseigner les clés
npm run dev
```

Clés à créer, toutes disponibles en palier gratuit : [Groq](https://console.groq.com), [Google AI Studio](https://aistudio.google.com), [Upstash](https://console.upstash.com). Sans les deux variables Upstash, la limitation de débit est simplement désactivée.

L'index est versionné, il n'y a donc rien à calculer pour lancer le projet. Pour l'adapter à un autre corpus, remplacez les fichiers de `content/articles/` puis :

```bash
pip install -r scripts/requirements.txt
python scripts/build-embeddings.py
```

## Structure

```
content/articles/        Les 23 articles, en Markdown
data/embeddings.json     Passages et embeddings, lus par l'API
public/embeddings-map.json  Projection 2D pour la carte
scripts/build-embeddings.py
src/app/api/chat/route.ts   Recherche, appel au LLM, streaming
src/app/page.tsx            Interface de chat
src/app/viz/page.tsx        Carte des passages
src/components/EmbeddingMap.tsx
src/lib/embeddings.ts       Similarité cosinus
```

## Limites connues

- La recherche parcourt tous les passages à chaque question. C'est adapté à quelques centaines de passages, pas à des dizaines de milliers.
- Le découpage suit les paragraphes sans tenir compte du sens. Un passage peut couper un raisonnement en deux.
- Aucune évaluation automatique de la qualité des réponses.
- Le chatbot n'a pas de mémoire : chaque question est traitée seule.

## Licence

Le code est sous licence MIT (voir `LICENSE`). Les articles de `content/articles/` restent la propriété de leur auteur et ne sont pas couverts par cette licence.

Bastien Lechat, [LecTech](https://lectech.fr)
