# ✦ Novel Studio

Site non officiel pour générer des images avec l'API NovelAI, prêt pour Vercel.

## Fonctionnalités

- Prompts positif et négatif (tags Danbooru / NovelAI)
- Modèles V4.5 Full/Curated et V5 Full/Curated (V5 expérimental)
- Formats 832×1216, 1216×832, 1024×1024
- Sampler, steps, CFG, CFG rescale et seed
- Aperçu, téléchargement PNG et historique en mémoire dans l'onglet
- API Vercel côté serveur pour éviter les erreurs CORS
- Jeton demandé à chaque session, jamais stocké par le site

## Déploiement Vercel

1. Aller sur https://vercel.com/new et importer `Jfdedit3/novel-studio`.
2. Choisir **Other** comme Framework Preset si nécessaire.
3. Garder Root Directory `./` et aucune commande de build.
4. Cliquer sur **Deploy**.
5. Après le déploiement, ouvrir le site et saisir son **Persistent API Token** NovelAI.

La fonction `api/generate.js` appelle `https://image.novelai.net/ai/generate-image` avec `Accept: application/json` et renvoie les images générées en base64.

## Exécution locale

Installer Vercel CLI avec `npm install -g vercel` puis lancer `vercel dev`.

## Sécurité et limitations

Le jeton est transmis à la fonction Vercel pour chaque génération, puis à NovelAI, sans stockage dans localStorage ou une base de données. Ne jamais committer de jeton dans GitHub. Pour un site public, chaque visiteur doit utiliser son propre jeton. Si vous décidez d'utiliser une clé partagée serveur, ajoutez au préalable une authentification, des quotas et une protection anti-abus.

Vercel impose des limites sur la taille des réponses et la durée des fonctions : les générations très longues ou volumineuses peuvent échouer. Les modèles V5 sont expérimentaux. Les appels réels nécessitent un jeton NovelAI valide et peuvent consommer des Anlas.

Documentation officielle : https://image.novelai.net/docs/index.html
