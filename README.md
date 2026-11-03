# Portfolio — Ny Mandresy Juan Davids HAMINARIVO

Portfolio de développeur web full-stack (Antananarivo, Madagascar).
Site statique en HTML, CSS et JavaScript : aucune dépendance, aucune compilation.

- **Site** : `index.html`
- **CV en ligne** : `cv.html` (format A4, imprimable)
- **CV PDF** : `assets/CV-HAMINARIVO.pdf`

## Structure

```
index.html          Page principale du portfolio
cv.html             CV au format A4 (source du PDF)
404.html            Page d'erreur
css/style.css       Styles (thèmes, mise en page, animations)
css/fonts.css       Polices hébergées en local
js/main.js          Animations et interactions
assets/
  img/              Photos (versions desktop et mobile)
  logos/            Logos des sites réalisés
  logo/             Logo personnel (SVG et PNG)
  icons/            Icônes des technos et icônes de l'application
  fonts/            Archivo, Instrument Serif, JetBrains Mono
```

## Mise en ligne sur GitHub Pages

1. Créer un dépôt nommé **`atlas-idev.github.io`** sur le compte GitHub `Atlas-idev`.
2. Envoyer le code :

   ```bash
   git remote add origin https://github.com/Atlas-idev/atlas-idev.github.io.git
   git branch -M main
   git push -u origin main
   ```

3. Dans le dépôt : **Settings → Pages → Source : Deploy from a branch → `main` / `root`**.
4. Le site est en ligne sous quelques minutes sur `https://atlas-idev.github.io/`.

> Si le dépôt porte un autre nom (par ex. `portfolio`), l'adresse devient
> `https://atlas-idev.github.io/portfolio/` : mettre à jour les URL dans
> `index.html` (balises `canonical` et `og:`), `sitemap.xml`, `robots.txt` et `cv.html`.

## Personnaliser

**Couleurs** : trois thèmes sont prêts. Changer l'attribut sur la balise `<html>` de `index.html` :

| Thème | Attribut | Accent |
|---|---|---|
| Indigo (par défaut) | `data-theme="indigo"` | pervenche `#8c9bff` |
| Glacier | `data-theme="glacier"` | bleu glacier `#9cc7ff` |
| Signal | `data-theme="signal"` | orange `#ff6a3d` sur noir chaud |

**Logo Yavoloko** : déposer le fichier dans `assets/logos/yavoloko.png` (logo blanc sur fond transparent).
Tant qu'il est absent, le nom s'affiche en texte à la place.

**CV PDF** : après une modification de `cv.html`, régénérer le PDF avec Chrome :

```bash
chrome --headless --no-pdf-header-footer --print-to-pdf=assets/CV-HAMINARIVO.pdf cv.html
```

Ou ouvrir `cv.html` dans le navigateur → Imprimer → « Enregistrer au format PDF », marges : aucune.

## Accessibilité & performance

- Animations désactivées automatiquement si l'utilisateur préfère réduire les mouvements.
- Le contenu reste visible sans JavaScript.
- Images compressées (~150 Ko), versions mobiles dédiées, polices en local.
