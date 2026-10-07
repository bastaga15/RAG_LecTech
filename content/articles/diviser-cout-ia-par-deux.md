---
title: "Diviser son coût d'utilisation de l'IA par deux, sans rien faire ! "
excerpt: "Anthropic propose un mode Batch : on envoie toutes ses requêtes d'un coup, l'API les traite quand elle a de la capacité, et on récupère les résultats quelques heures plus tard. Même modèle, même qualité de réponse. -50% sur le prix."
date: "2026-04-09"
readTime: "3 min"
linkedinUrl: "https://www.linkedin.com/posts/bastien-lechat_jai-d%C3%A9couvert-un-truc-qui-ma-fait-diviser-activity-7447927537856368640-o0Al?utm_source=share&utm_medium=member_desktop&rcm=ACoAAEp_IXwBjC35hUQQx09PU_WBBu4bFsQPvgc"
image: "/images/posts/diminuercoutia.png"
---

J'ai découvert un truc qui m'a fait diviser par deux ma facture d'API IA.

Quand on utilise des APIs d'IA (Claude, GPT, etc.), par défaut chaque requête est envoyée et traitée en temps réel. C'est utile quand on a besoin d'une réponse immédiate — un chatbot, une suggestion en live.
Mais la plupart de mes usages n'ont pas besoin de ça, que le résultat arrive dans 2 secondes ou dans 2 heures, ça ne change rien.
Anthropic propose un mode Batch : on envoie toutes ses requêtes d'un coup, l'API les traite quand elle a de la capacité, et on récupère les résultats quelques heures plus tard. Même modèle, même qualité de réponse. -50% sur le prix.

En creusant pourquoi c'était moins cher, j'ai compris que c'est lié au fonctionnement du GPU : en temps réel, le serveur charge les paramètres du modèle en mémoire pour chaque requête. En batch, il les charge une seule fois pour des centaines de requêtes. Mécaniquement, ça consomme beaucoup moins d'énergie — donc moins cher, et accessoirement moins polluant.
Si vous utilisez des APIs d'IA et que tous vos traitements tournent en temps réel, ça peut valoir le coup de se demander si on a vraiment besoin d'une réponse instantanée : https://lnkd.in/d2YaUXpq



Et une réflexion que j'ai eue en creusant le sujet :
En France, EDF propose des tarifs heures creuses pour inciter à consommer l'électricité la nuit, quand la demande est faible. Le but : lisser la charge sur le réseau et éviter d'allumer des centrales à gaz aux heures de pointe.
En allant sur éCO2mix (l'outil de RTE qui publie l'intensité carbone du réseau en temps réel), on voit que ça a un impact direct : le 31 mars 2026, l'intensité carbone de l'électricité française variait de 18g CO2eq/kWh la nuit à 36g CO2eq/kWh en journée. Du simple au double, selon l'heure.
Le batch, c'est le même principe appliqué à l'IA. Le fournisseur traite les requêtes quand il a de la capacité — donc probablement aux heures creuses de ses datacenters. Moins de tension sur l'infrastructure, meilleure utilisation des GPU, et potentiellement une électricité plus propre au moment du traitement.
Aujourd'hui c'est une conséquence indirecte. Mais on pourrait imaginer que demain, les fournisseurs d'IA aillent plus loin : un "tarif heures creuses" explicite, où les requêtes envoyées la nuit seraient encore moins chères, avec une garantie de traitement sur du renouvelable ou du nucléaire.
L'IA consomme de plus en plus d'énergie. Mais on peut se poser la question de quand on l'utilise — et le batch est peut-être le premier levier concret pour ça.