---
title: "Un skill Claude pour ranger son bureau d'ordinateur automatiquement. Pour quand la version pour nettoyer son bureau dans la vraie vie ?"
excerpt: "Il y a deux semaines, j'ai vu passer un post sur le lauréat du 'Best Use of Claude Managed Agents' à un hackathon organisé par Anthropic. Pas mal. "
date: "2026-05-11"
readTime: "4 min"
linkedinUrl: "https://www.linkedin.com/posts/bastien-lechat"
---

Il y a deux semaines, j'ai vu passer un post sur le lauréat du "Best Use of Claude Managed Agents" à un hackathon organisé par Anthropic. Pas mal.
J'ai noté le repo GitHub de son projet dans mes notes, pour y revenir plus tard et comprendre ce qu'il faisait de bien, pas dans le code, mais dans la structure : https://lnkd.in/ev9esgjd

Ce que j'ai observé :
→ Un CLAUDE.md à la racine qui donne la carte mentale du projet à chaque session
→ Un decisions.md qui documente les choix non-évidents avec leur date et leur contexte pour son projet
→ Des dossiers séparés core / utils / oneshot — pas 36 scripts à plat
→ Zéro ambiguïté sur "qu'est-ce qui est actif vs archivé"

J'ai ensuite demandé à Claude Code d'analyser mon propre repo après avoir vu ça.

Le diagnostic était sans appel :
→ des packages mélangés à des modules, donc des centaines de fichiers parasites qui ne demandent qu'à piéger Claude pour inonder son contexte.
→ 18 fichiers en vrac à la racine (des patches, des vieux documents, des scripts one-shot pour des tests)
→ Pas de CLAUDE.md → à chaque session il relit tout pour tâtonner
→ Résultat estimé : 30 à 50% de tokens dépensés en re-contexte inutile

En une session, il a tout réglé : CLAUDE.md créé, 15 scripts archivés dans scripts/oneshot/, 14 décisions techniques centralisées dans decisions.md, un skill /hygiene pour relancer l'audit régulièrement.

Et tout ça, malgré les dizaines de posts LinkedIn que je vois passer pour dire comment bien s'organiser. Mais si je laisse mon bureau en bazar, moi aussi je perdrais du temps à chercher ce que je veux, donc finalement on se ressemble sur certains points. 😅