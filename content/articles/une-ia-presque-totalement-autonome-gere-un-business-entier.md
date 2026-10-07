---
title: "Une IA presque totalement autonome gère un business entier"
excerpt: "Depuis plus d'un mois, Felix, un agent IA qui tourne sur OpenClaw, agit comme le CEO de 'The Masinov Company'. Il a déjà généré plus de 150k$ seul."
date: "2026-03-15"
readTime: "5 min"
linkedinUrl: "https://www.linkedin.com/posts/bastien-lechat_how-to-hire-an-ai-interactive-qa-share-7438930277701173248-j93U?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEp_IXwBjC35hUQQx09PU_WBBu4bFsQPvgc"
---

Une IA presque totalement autonome gère un business entier.
Et elle a déjà généré plus de 150k$ seule.

Dit comme ça, ça fait un peu clickbait.

Mais depuis plus d'un mois, Felix, un agent IA qui tourne sur OpenClaw et agit comme le CEO de "The Masinov Company". Nat Eliason, son créateur/co-fondateur lui a créé son propre compte Stripe et X avec ses clés APIs, et un budget initial de 1000$ avec comme objectif de faire grandir le plus possible son propre business.
Depuis, Felix a créé son site Internet : felixcraft.ai, écrit des guides, et gère des boutiques en ligne en autonomie.

Sur le dernier mois, il a généré 140k$, dont 42k$ sur les 7 derniers jours.

Je ne sais pas si la "performance" doit faire sourire ou inquiéter, il est clair que Felix a beaucoup gagné sur le buzz d'être "la première IA à gérer un business" et son autonomie très large qui lui permet de tweeter et de partager son "quotidien".

Mais derrière ce buzz, c'est l'infrastructure et la gestion de la mémoire de Felix qui en font sa force :
 - Un fichier SOUL.md, qui définit la personnalité de l'IA, incluant sa voix et son ton, ses limites comportementales, sa définition de rôle et sa relation avec l'utilisateur.
 - Un gros travail de réflexion sur les barrières implémentées par Nat, pour rendre autonome son agent tout en le protégeant des requêtes malveillantes qui voudraient extraire des données sensibles ou avoir accès au compte (bien rempli) de Felix. Pour cela, il refuse d'obéir via email (canal trop risqué) et ne prend des ordres que via des canaux vérifiés comme Telegram.
 - Un système de mémoire à 3 étages : chaque soir, Felix compresse les échanges avec Nat, pour garder en contexte tous ses échanges, qu'il sépare selon si l'échange date de - de 7j, - de 30j ou plus. De cette façon, il priorise les infos fraîches et "réactive" les anciennes si besoin, pour ne pas inonder sa mémoire.

Ce travail sur la mémoire, c'est celui que je trouve le plus impressionnant, car la plus grande limitation des LLMs actuellement, c'est la gestion du contexte. Après trop d'informations, l'IA sature et la qualité de ses réponses décroît. Et c'est là la force de Felix : sa gestion de la mémoire lui permet de ne pas saturer tout en gardant quasiment toutes les informations importantes en contexte.

Cette actualité sur Felix et sa mémoire, c'est aussi un prétexte pour faire un petit projet que je voulais faire depuis longtemps : créer un RAG, c'est-à-dire combiner des documents comme le PDF généré par Felix avec un LLM pour que celui-ci donne des réponses enrichies sur ces documents.

J'ai donc construit mon RAG sur le PDF de 66 pages de Felix sur "Comment embaucher une IA", disponible à ce lien : rag.lectech.fr.

Ici, vous pourrez poser des questions pour savoir comment avoir une IA comme Felix qui gère un business de façon autonome, mais aussi sur ce qu'est un RAG, et comment il peut permettre à une entreprise de centraliser ses documents.
