# Yeti Factory — Budget PLV

Application française de cadrage commercial pour les concepteurs et fabricants de PLV.

L’IA analyse le brief, les caractéristiques et l’objectif du projet pour proposer une fourchette de prix de vente HT au client. Aucun prix n’est affiché avant une analyse IA réussie. Si le brief manque de précisions, l’application affiche les questions à compléter. Les données économiques confidentielles de la marque ne sont pas demandées et aucun ROI annonceur n’est calculé.

La marge résiduelle souhaitée détermine l’enveloppe maximale de tous les coûts du projet. Elle reste interne, hors données transmises à l’IA et hors synthèse client. Les paramètres sont conservés dans le navigateur. Import de briefs PDF/TXT/Markdown, propositions de corrections soumises à accord, réponses et réanalyse sont disponibles.

## Local

Aucune dépendance applicative. Node.js 22 :

    node scripts/build.mjs
    node scripts/test-all.mjs
    node scripts/test-server.mjs
    node scripts/preview.mjs

L’aperçu reste sur http://localhost:4173 et charge la clé depuis .env.local. Ce fichier est exclu de Git et de Docker.

## Git et Coolify

Déployer le dépôt avec le mode Dockerfile, fichier /Dockerfile, port interne 3000. Le domaine doit être en HTTPS pour l’installation sur ordinateur et téléphone. Configurer le healthcheck sur GET /healthz.

Variables d’environnement à définir à l’exécution, jamais pendant la construction :

- APP_URL : URL HTTPS exacte de l’application (ex. https://plv.example.com).
- APP_USER et APP_PASSWORD : identifiant et mot de passe protégeant l’accès à l’application.
- OPENAI_API_KEY : clé secrète OpenAI, conservée exclusivement côté serveur.
- OPENAI_MODEL : facultatif, gpt-4.1-mini par défaut.
- PORT : 3000 par défaut.

Le serveur exige une authentification pour conserver un accès privé. Le healthcheck est public et ne divulgue aucune configuration. Le contrôle d’origine utilise APP_URL, indépendamment des en-têtes du proxy. Aucun fichier .env n’est embarqué dans l’image.

L’application envoie les données du projet et le brief à OpenAI lors de l’extraction ou de l’analyse, avec store:false. L’estimation IA est indicative et doit être confirmée par des références ou devis comparables ; le modèle ne dispose pas de barèmes sectoriels vérifiés. Les tests utilisent des réponses simulées et ne prouvent pas une connexion réelle depuis Coolify.

Documentation Coolify : https://coolify.io/docs/applications/ et https://coolify.io/docs/applications/configuration/environment-variables

