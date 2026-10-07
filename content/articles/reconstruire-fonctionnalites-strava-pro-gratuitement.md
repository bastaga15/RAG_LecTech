---
title: "Reconstruire une partie des fonctionnalités de Strava Pro gratuitement"
excerpt: "L'un des moments que je préfère sur Strava, c'est quand je vois mes statistiques après une sortie. J'ai décidé de recréer certaines fonctionnalités de Strava Pro en utilisant l'IA..."
date: "2025-10-25"
readTime: "3 min"
linkedinUrl: "https://www.linkedin.com/posts/bastien-lechat_lun-des-moments-que-je-pr%C3%A9f%C3%A8re-sur-strava-activity-7386412220102008832-STn-?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEp_IXwBjC35hUQQx09PU_WBBu4bFsQPvgc"
images:
  - "/images/posts/stravareconstruit.jpg"
---

L'un des moments que je préfère sur Strava, c'est le récap de fin d'année : toutes les sorties de l'année se condensent sur un tableau de données et des graphiques et nous disent (ou pas) si les résolutions du début d'année ont été tenues.

Le souci, c'est que sur le plan gratuit, on ne peut avoir le récap des sorties que sur les 3 derniers mois au maximum. Impossible (avant fin décembre) d'avoir les infos globales sur son année, et savoir où l'on en était sur ses objectifs sportifs.

J'ai donc pour la première fois fait un projet pour moi  : recréer une partie des fonctionnaités de Strava Pro gratuitement. J'ai utilisé l'API de Strava et n8n pour que chaque semaine, mes données sportives s'exportent automatiquement dans un tableau Excel.

J'ai créé un autre feuillet 'Tableau de bord', qui résume les infos sportives sur le mois en cours, compare à celles du mois précédent, et surtout donne l'avance/le retard par rapport à à un objectif annuel (Si je dois faire 1000km en courant dans l'année, soit 19,2km/semaine, je peux savoir à tout moment de l'année si je suis en avance/retard sur mes résolutions, et surtout quel rythme je dois tenir jusqu'à la fin de l'année).

Enfin, j'ai refait le graphique style Strava qui donne le résumé sur les distances parcourues pas seulement sur les 3 derniers mois, mais sur toute l'année en cours et aussi depuis le début de mon compte Strava.

J'aurais bien aimé pouvoir ajouter un tableau avec un historique des PR, pour savoir depuis quand date un record et comment il a évolué au fil du temps, mais il faut souscrire à l'abonnement Pro, alors que toutes ces infos/graphiques sont accessibles gratuitement.
