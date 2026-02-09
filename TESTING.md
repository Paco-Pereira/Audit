# Checklist de Validation - M2 GIP Optimisé

## Tests Fonctionnels

### Navigation de Base
- [ ] Page d'accueil (home) se charge correctement
- [ ] Page audit se charge correctement
- [ ] Cliquer sur "Cas SNOW" charge le contenu
- [ ] Cliquer sur "Cas STARK" charge le contenu
- [ ] Cliquer sur "Cours Financement" charge le contenu
- [ ] Cliquer sur "Outils" charge le contenu
- [ ] Spinner de chargement s'affiche pendant le téléchargement
- [ ] Le contenu s'affiche après le chargement

### Navigation Avancée
- [ ] Les tabs fonctionnent (changement de page)
- [ ] La sidebar s'affiche pour les cas d'audit
- [ ] Les liens de la sidebar fonctionnent (scroll vers section)
- [ ] Le bouton retour fonctionne
- [ ] L'URL hash se met à jour (#snow, #stark, etc.)
- [ ] Recharger la page avec un hash charge le bon contenu
- [ ] Navigation rapide entre plusieurs cas fonctionne

### Recherche
- [ ] Ouvrir la recherche (Ctrl+K ou bouton)
- [ ] Taper "IFI" affiche des résultats
- [ ] Taper "succession" affiche des résultats
- [ ] Cliquer sur un résultat navigue vers le cas
- [ ] Fermer la recherche (ESC)

### Mode Examen
- [ ] Activer le mode examen cache les réponses
- [ ] Cliquer sur "Afficher la réponse" révèle le contenu
- [ ] Désactiver le mode examen réaffiche tout
- [ ] Mode examen persiste après rechargement

### Flashcards
- [ ] Ouvrir une flashcard
- [ ] Retourner la carte fonctionne
- [ ] Marquer comme "connue" fonctionne
- [ ] Les états persistent après rechargement

### Progression
- [ ] Cocher une checkbox de progression
- [ ] L'état persiste après rechargement
- [ ] Le compteur de progression se met à jour

### Historique
- [ ] Visiter plusieurs pages
- [ ] L'historique s'affiche dans la sidebar
- [ ] Cliquer sur l'historique navigue vers la page
- [ ] L'historique se limite à 8 entrées

### Streak de Révision
- [ ] Consulter le dashboard
- [ ] Le streak s'affiche correctement
- [ ] Visiter le site un autre jour met à jour le streak

### Thème
- [ ] Basculer en mode clair
- [ ] Le thème persiste après rechargement
- [ ] Basculer en mode sombre
- [ ] Tous les éléments sont lisibles dans les deux modes

### Responsive Mobile
- [ ] Ouvrir sur mobile (ou redimensionner à <768px)
- [ ] La sidebar se replie automatiquement
- [ ] Le bouton hamburger ouvre/ferme la sidebar
- [ ] Les tabs sont scrollables horizontalement
- [ ] Le contenu est lisible sur petit écran

### Export PDF
- [ ] Exporter un cas en PDF fonctionne
- [ ] Le PDF contient le bon contenu
- [ ] Export du cas HOUETTE (complet)
- [ ] Export du cas HOUETTE (énoncé seulement)

### localStorage
- [ ] `gip-lastPage` se sauvegarde
- [ ] `gip-history` se sauvegarde
- [ ] `gip-studyDays` se sauvegarde
- [ ] `gip-flashcards` se sauvegarde
- [ ] `gip-progress-v2` se sauvegarde
- [ ] `gip-sidebarCollapsed` se sauvegarde
- [ ] `lightMode` se sauvegarde

## Tests Performance

### Chargement Initial
- [ ] Ouvrir DevTools → Network
- [ ] Recharger la page (Cmd+R)
- [ ] Vérifier : index.html ≈ 23 Ko
- [ ] Vérifier : styles.css ≈ 55 Ko
- [ ] Vérifier : app.js ≈ 42 Ko
- [ ] Vérifier : content-loader.js ≈ 6 Ko
- [ ] Total initial < 150 Ko
- [ ] Time to Interactive < 1,5s sur Fast 3G

### Lazy Loading
- [ ] Cliquer sur un cas (ex: SNOW)
- [ ] Vérifier dans Network : audit/snow.json se télécharge
- [ ] Taille du JSON : 30-100 Ko
- [ ] Temps de chargement < 300ms
- [ ] Cliquer à nouveau sur SNOW : pas de requête réseau (cache)

### Cache
- [ ] Ouvrir la console
- [ ] Taper `contentLoader.getStats()`
- [ ] Vérifier que cached > 0 après navigation
- [ ] Taper `contentLoader.clearCache()`
- [ ] Naviguer à nouveau : nouvelles requêtes réseau

## Tests Cross-Browser

### Desktop
- [ ] Chrome (dernière version)
- [ ] Firefox (dernière version)
- [ ] Safari (dernière version)
- [ ] Edge (dernière version)

### Mobile
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] iPad Safari

## Tests Edge Cases

### Erreurs
- [ ] Désactiver le réseau, cliquer sur un cas non chargé
- [ ] Message d'erreur s'affiche
- [ ] Réactiver le réseau, réessayer fonctionne

### Navigation Rapide
- [ ] Cliquer rapidement sur plusieurs cas
- [ ] Pas de race condition
- [ ] Le bon contenu s'affiche

### Hash au Chargement
- [ ] Accéder à l'URL avec #snow directement
- [ ] Le cas SNOW se charge automatiquement
- [ ] Essayer avec #financement
- [ ] Essayer avec un hash invalide (#invalid)

### Cas Spéciaux
- [ ] Cas HOUETTE (format complexe)
- [ ] Cas GENEREUX (le plus gros)
- [ ] Marchés Financiers (le plus petit)

## Métriques à Vérifier

| Métrique | Cible | Actuel | Statut |
|----------|-------|--------|--------|
| Initial load | <150 Ko | _____ Ko | ⬜ |
| Time to Interactive | <1,5s | _____ s | ⬜ |
| Lazy load time | <300ms | _____ ms | ⬜ |
| Nombre de cas | 18 | _____ | ⬜ |
| Cache hit rate | >80% | _____ % | ⬜ |

## Validation Finale

- [ ] Tous les tests fonctionnels passent
- [ ] Tous les tests performance passent
- [ ] Testé sur au moins 2 navigateurs desktop
- [ ] Testé sur au moins 1 navigateur mobile
- [ ] Aucune erreur dans la console
- [ ] Aucune fonctionnalité manquante vs version originale

## Notes

Ajouter ici les bugs trouvés ou remarques :

```
[Date] [Navigateur] [Description du bug]
-
```
