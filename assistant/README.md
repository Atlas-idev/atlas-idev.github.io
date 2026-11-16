# Assistant du portfolio

La bulle en bas à droite du portfolio répond aux questions sur Juan : parcours, compétences, projets, disponibilité, contact.

- **Sans configuration**, elle répond instantanément à partir des réponses préparées dans `js/assistant.js`.
- **Avec Gemini**, elle passe par le Worker Cloudflare de ce dossier, qui garde la clé secrète. Si Gemini ne répond pas (quota, panne), la bulle revient aux réponses préparées.

La clé Gemini ne doit jamais être écrite dans le site : il est public sur GitHub Pages, n'importe qui pourrait la lire et épuiser son quota.

## Mettre en ligne l'assistant IA

Prérequis : Node.js et un compte Cloudflare gratuit.

```bash
cd assistant
npx wrangler login                      # ouvre le navigateur pour se connecter à Cloudflare
npx wrangler secret put GEMINI_API_KEY  # collez la clé Gemini (https://aistudio.google.com/apikey)
npx wrangler deploy                     # affiche l'adresse du Worker, ex. https://portfolio-assistant.<compte>.workers.dev
```

Puis, dans `index.html`, renseignez cette adresse sur la bulle :

```html
<div class="ai" data-assistant data-endpoint="https://portfolio-assistant.<compte>.workers.dev">
```

## Réglages

- `wrangler.toml` : sites autorisés (`ALLOWED_ORIGINS`), modèle principal et modèle de secours.
- `worker.js` : `PROFILE` contient tout ce que l'IA sait de Juan, `RULES` sa façon de répondre. Après une modification : `npx wrangler deploy`.
- Limites : 8 questions par minute et 80 par jour pour une même adresse IP, 600 caractères par message.

Conseil : utilisez une clé Gemini sans facturation activée. Au pire, le quota gratuit s'épuise et la bulle continue avec ses réponses préparées.
