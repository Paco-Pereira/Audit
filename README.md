# M2 GIP - Gestion et Ingénierie Patrimoniale

Application web optimisée pour le Master 2 GIP avec lazy loading et performances améliorées.

## 📊 Performance

### Avant Optimisation
- **Taille totale** : 1,25 Mo (27 021 lignes)
- **Temps de chargement** : 3-4 secondes sur 3G
- **Problème** : Tout le contenu chargé d'un coup

### Après Optimisation
- **Chargement initial** : 132 Ko (-89%)
- **Time to Interactive** : <1 seconde
- **Contenu** : Chargé à la demande (lazy loading)
- **Réduction** : 88% de données en moins au démarrage

## 🏗️ Architecture

```
/src/
  index.html          (1,25 Mo - source originale)

/dist/                (Généré - déployé sur GitHub Pages)
  index.html          (23 Ko - shell optimisé)
  /css/
    styles.css        (55 Ko - CSS minifié)
  /js/
    app.js            (42 Ko - logique principale)
    content-loader.js (6,4 Ko - lazy loading)
  /content/
    manifest.json     (22 Ko - index de recherche)
    /audit/           (9 cas d'audit)
    /courses/         (5 cours)
    /tools/           (4 outils)
```

## 🚀 Utilisation

### Installation

```bash
npm install
```

### Build

```bash
# Build complet
npm run build

# Build + serveur de développement
npm run dev
# Ouvrir http://localhost:8080

# Build + commit + push
npm run deploy
```

### Développement

1. Modifier le fichier source : `src/index.html`
2. Lancer le build : `npm run build`
3. Tester localement : `npm run dev`
4. Déployer : `npm run deploy`

## 📁 Structure des Fichiers JSON

Chaque cas/cours est extrait dans un fichier JSON :

```json
{
  "id": "snow",
  "title": "Cas SNOW",
  "icon": "❄️",
  "type": "audit-case",
  "sidebar": {
    "items": [
      {"id": "snow-s1", "label": "Situation", "num": "1"},
      {"id": "snow-s2", "label": "Travail à faire", "num": "2"}
    ]
  },
  "content": "<div class=\"section\">...</div>",
  "searchIndex": {
    "keywords": ["PACS", "IFI", "succession", ...]
  }
}
```

## 🔧 Fonctionnement du Lazy Loading

1. **Chargement initial** : Seuls `home` et `audit` sont inclus dans le HTML
2. **Navigation** : Quand l'utilisateur clique sur un cas :
   - Le `ContentLoader` vérifie le cache
   - Si pas en cache, télécharge le JSON correspondant
   - Injecte le contenu et la sidebar dans le DOM
   - Met en cache pour les prochaines visites
3. **Spinner** : Affichage d'un indicateur pendant le chargement

## 📦 Contenu Extrait

**Cas d'audit** (9) :
- ❄️ SNOW - 249 mots-clés
- ⚔️ STARK - 406 mots-clés
- 🎵 NIOTE - 244 mots-clés
- 🏡 MENGERE - 185 mots-clés
- 🥋 NORRIS - 310 mots-clés
- 🌌 VADOR - 477 mots-clés
- 🦁 LEON - 460 mots-clés
- 💰 GENEREUX - 579 mots-clés
- 👤 HOUETTE - 262 mots-clés

**Cours** (5) :
- 💳 Financement - 295 mots-clés
- ⚖️ Responsabilité - 224 mots-clés
- 📊 Droit Fiscal - 134 mots-clés
- 📜 Droit Patrimonial - 432 mots-clés
- 📈 Marchés Financiers - 5 mots-clés

**Outils** (4) :
- 🛠️ Outils - 567 mots-clés
- 📘 Guide - 343 mots-clés
- 🏗️ Montages - 165 mots-clés
- 🔢 Formules - 134 mots-clés

## ✨ Fonctionnalités Préservées

Toutes les fonctionnalités existantes sont préservées :
- ✅ Navigation par tabs
- ✅ Sidebar avec sections
- ✅ Recherche (avec index optimisé)
- ✅ Mode examen
- ✅ Flashcards
- ✅ Progression (checkboxes)
- ✅ Historique
- ✅ Streak de révision
- ✅ Dark/light mode
- ✅ Responsive mobile
- ✅ Export PDF
- ✅ localStorage préservé

## 🔍 Phase 2 : Optimisation Recherche (À venir)

- Debouncing (300ms)
- Recherche sur l'index du manifest
- Web Worker (optionnel)

## 📱 Compatibilité

- Chrome/Edge (dernière version) ✅
- Firefox (dernière version) ✅
- Safari (dernière version) ✅
- iOS Safari ✅
- Android Chrome ✅

## 🛠️ Technologies

- **Cheerio** : Parsing HTML
- **Terser** : Minification JavaScript
- **CleanCSS** : Minification CSS
- **Vanilla JS** : Pas de framework, performances maximales

## 📝 Notes Importantes

1. **Source unique** : `src/index.html` est le fichier source
2. **Build requis** : Toujours lancer `npm run build` après modification
3. **Distribution** : Seul le dossier `dist/` est déployé sur GitHub Pages
4. **Cache** : Le ContentLoader met en cache les contenus chargés
5. **Rollback** : En cas de problème, `git revert` ou restaurer `src/index.html`

## 🐛 Debug

Console du navigateur :
```javascript
// Voir les stats du cache
contentLoader.getStats()

// Vider le cache
contentLoader.clearCache()

// Précharger des cas
contentLoader.preload(['snow', 'stark', 'niote'])
```

## 📈 Prochaines Améliorations

- [ ] Phase 2 : Optimisation recherche avec debouncing
- [ ] Service Worker pour support offline
- [ ] Preloading intelligent (cas les plus consultés)
- [ ] Compression Brotli/Gzip sur le serveur
- [ ] Analyse bundle avec webpack-bundle-analyzer
