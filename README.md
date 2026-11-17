# ✦ Novel Studio

Site non officiel pour générer des images avec l'API NovelAI, prêt pour Vercel.

## Fonctionnalités

- Prompts positif et négatif (tags Danbooru / NovelAI)
- Modèles V4.5 Full/Curated et V5 Full/Curated (V5 expérimental)
- Formats 832×1216, 1216×832, 1024×1024
- Sampler, steps, CFG, CFG rescale et seed
- Aperçu, téléchargement PNG et historique en mémoire dans l'onglet
- API Vercel côté serveur pour éviter les erreurs CORS
- Jeton stocké côté serveur dans la variable d'environnement Vercel \`NOVELAI_API_KEY\`

## Déploiement Vercel

1. Aller sur https://vercel.com/new et importer `Jfdedit3/novel-studio`.
2. Choisir **Other** comme Framework Preset si nécessaire.
3. Garder Root Directory `./` et aucune commande de build.
4. Cliquer sur **Deploy**.
5. Dans **Settings → Environment Variables**, créer \`NOVELAI_API_KEY\` avec son **Persistent API Token** NovelAI (Production, de préférence type Secret).\n6. Redéployer pour que la variable prenne effet.

La fonction `api/generate.js` appelle `https://image.novelai.net/ai/generate-image` avec `Accept: application/json` et renvoie les images générées en base64.

## Exécution locale

Installer Vercel CLI avec `npm install -g vercel` puis lancer `vercel dev`.

## Sécurité et limitations

Le jeton est lu par la fonction Vercel via \`process.env.NOVELAI_API_KEY\` et envoyé uniquement à NovelAI. Il n'est pas transmis au navigateur. Ne jamais committer de jeton dans GitHub. **Attention :** cette version utilise une clé partagée côté serveur. Même si vous êtes seul à connaître l'adresse du site, son endpoint peut être appelé par d'autres. Activez une protection d'accès au déploiement avant de l'utiliser avec votre jeton personnel.

Vercel impose des limites sur la taille des réponses et la durée des fonctions : les générations très longues ou volumineuses peuvent échouer. Les modèles V5 sont expérimentaux. Les appels réels nécessitent un jeton NovelAI valide et peuvent consommer des Anlas.

Documentation officielle : https://image.novelai.net/docs/index.html
