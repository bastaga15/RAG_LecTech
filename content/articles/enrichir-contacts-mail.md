---
title: "Extraire et enrichir tous les contacts d'une boîte mail"
excerpt: "Pour une de mes missions, j'ai dû me connecter à une boîte mail Outlook, pour extraire tous les mails (Envoyés, Reçus, Copie…), afin de déterminer le nom, prénom, entreprise et fonction de la personne dans l'entreprise pour chaque mail, ce qui peut servir pour commencer à alimenter un nouveau CRM ou avoir une vision d'ensemble des entreprises/personnes contactées sur un trimestre."
date: "2026-04-15"
readTime: "4 min"
linkedinUrl: "https://www.linkedin.com/posts/bastien-lechat_mission-extraire-et-enrichir-tous-les-contacts-activity-7450090613275987969-_D4M?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEp_IXwBjC35hUQQx09PU_WBBu4bFsQPvgc"

---

Mission : Extraire et enrichir tous les contacts d'une boîte mail. 

Une des parties que je trouve le plus satisfaisante dans les missions que je fais, c'est de connecter des applications entre elles pour faire un processus complet.
Mais la première étape, c'est déjà la connexion pour avoir accès aux ressources, et c'est parfois là que je bloque.

Pour une de mes missions, j'ai dû me connecter à une boîte mail Outlook, pour extraire tous les mails (Envoyés, Reçus, Copie…), afin de déterminer le nom, prénom, entreprise et fonction de la personne dans l'entreprise pour chaque mail, ce qui peut servir pour commencer à alimenter un nouveau CRM ou avoir une vision d'ensemble des entreprises/personnes contactées sur un trimestre.

Pour me connecter à la boîte mail, je voulais utiliser le protocole IMAP, qui permet de se connecter à la boîte mail d'une personne pour récupérer l'historique, mais celui-ci était bloqué par l'IT de l'entreprise. Apparemment, c'est classique pour les PME industrielles, mais c'est un bon rappel que le plus compliqué dans les missions, ce sont parfois les contraintes/flexibilités/process de l'entreprise avec laquelle je travaille, qui peuvent être longs voire bloqués.

Heureusement, on a réussi à accéder à l'historique des mails avec un fichier .pst, à partir duquel on a pu extraire les mails et leurs signatures, dont je me suis servi pour déterminer le nom/prénom/entreprise des personnes, mais aussi le nombre d'échanges, la date du dernier contact et l'historique des messages.
Après cela, j'ai fait un appel API via Claude (en batch ;p) pour récupérer les postes des interlocuteurs dans les entreprises, et le tableau récapitulatif des contacts était complet.

Résultat :
+1000 contacts dédupliqués
74% avec nom/prénom fiabilisés
128 fonctions vérifiées avec URL source
Coût API total : ~8 €
Livré en 2 jours

