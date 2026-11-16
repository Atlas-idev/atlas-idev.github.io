# Assistant du portfolio

La bulle en bas à droite du portfolio répond aux questions sur Juan : parcours, compétences, projets, disponibilité, contact.

- **Sans configuration**, elle répond instantanément à partir des réponses préparées dans `js/assistant.js`.
- **Avec Gemini**, elle passe par le Worker Cloudflare de ce dossier, qui garde la clé secrète. Si Gemini ne répond pas (quota, panne), la bulle revient aux réponses préparées.

La clé Gemini ne doit jamais être écrite dans le site : il est public sur GitHub Pages, n'importe qui pourrait la lire et épuiser son quota.

## Mettre en ligne l'assistant IA

Le relais est déployé sur `https://portfolio-assistant.atlas-idev.workers.dev` et cette adresse est déjà configurée dans `index.html`.

Pour le mettre à jour, avec Node.js et le compte Cloudflare connecté :

```bash
cd assistant
npx wrangler login                                      # seulement si la session a expiré
npx wrangler deploy --secrets-file .dev.vars --strict    # publie le relais et son secret
```

La clé locale se trouve dans `assistant/.dev.vars`, exclu de Git. Pour changer de clé, mettez à jour `GEMINI_API_KEY` dans ce fichier puis relancez le déploiement. La clé est envoyée au stockage des secrets Cloudflare, jamais au site public.

Si l'adresse du relais change, mettez à jour la bulle dans `index.html` :

```html
<div class="ai" data-assistant data-endpoint="https://portfolio-assistant.atlas-idev.workers.dev">
```

## Réglages

- `wrangler.toml` : sites autorisés (`ALLOWED_ORIGINS`), modèle principal et modèle de secours.
- `worker.js` : `PROFILE` contient tout ce que l'IA sait de Juan, `RULES` sa façon de répondre. Après une modification : `npx wrangler deploy`.
- Limites : 8 questions par minute et 80 par jour pour une même adresse IP, 600 caractères par message.

Conseil : utilisez une clé Gemini sans facturation activée. Au pire, le quota gratuit s'épuise et la bulle continue avec ses réponses préparées.
