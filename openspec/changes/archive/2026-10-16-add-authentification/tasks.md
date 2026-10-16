# Tasks

## 1. Socle de l'application et design system

- [x] 1.1 Définir dans `src/styles.css` les variables CSS de la palette (`#FFF7E6`, `#F7C8D3`, `#B46A72`, `#A8B58A`, `#A9B7C6`, `#2D3A47`), les styles de base (typographie, fond, focus visible) — vérifier visuellement que la page d'accueil utilise la palette crème/ardoise
- [x] 1.2 Créer le composant coquille de layout dans `src/app/features/layout/` (en-tête avec nom de l'utilisateur, badge de rôle, bouton « Déconnexion », zone de contenu `router-outlet`) et vérifier qu'il se compile (`npm run build`)
- [x] 1.3 Nettoyer les fichiers de démarrage par défaut (`app.html`, `app.css`) pour n'y laisser que le conteneur applicatif — vérifier que `npm start` sert une page sans contenu du template de démonstration

## 2. Modèles et couche de stockage

- [x] 2.1 Créer le modèle `Role` (`'ADMIN' | 'TRESORIER' | 'MEMBRE'`) et l'interface `User` (`id`, `nomComplet`, `email`, `role`, `salt`, `passwordHash`, `dateCreation`) dans `src/app/core/models/` — vérifier la compilation TypeScript stricte
- [x] 2.2 Implémenter `StorageService` (API typée `read`/`write`/`remove` avec préfixe de clés, repli sûr si données illisibles) — vérifier avec un test unitaire couvrant lecture, écriture et donnée corrompue
- [x] 2.3 Implémenter `UserService` (liste, recherche par e-mail normalisé en minuscules, création, nombre de comptes) reposant sur `StorageService` — vérifier par tests unitaires d'ajout/recherche et d'unicité de l'e-mail

## 3. Sécurité des mots de passe

- [x] 3.1 Implémenter le service de hachage (`deriveBits` PBKDF2-SHA-256, 100 000 itérations, sel aléatoire de 16 octets via `crypto.getRandomValues`, encodage base64) dans `src/app/core/services/` — vérifier par tests : un même mot de passe produit deux condensats différents (sel distinct) et la vérification réussit avec le bon mot de passe
- [x] 3.2 Vérifier qu'aucune donnée persistée ne contient le mot de passe en clair — test unitaire qui crée un compte et inspecte le contenu stocké pour confirmer l'absence du mot de passe et la présence d'un sel par compte

## 4. Service d'authentification

- [x] 4.1 Implémenter `AuthService` avec les signals `currentUser` et `isAuthenticated`, et `register()` (validation nom/e-mail/mot de passe ≥ 8 caractères, refus e-mail déjà utilisé, attribution `ADMIN` au premier compte puis `MEMBRE`) — vérifier par tests unitaires des cas nominal, doublon et données invalides
- [x] 4.2 Implémenter `login()` (recherche par e-mail, recalcul du condensat, message d'erreur générique en cas d'échec) et l'ouverture de session (stockage `userId` + expiration 12 h) — vérifier par tests des cas succès et identifiants invalides
- [x] 4.3 Implémenter la restauration de session au démarrage et `logout()` (effacement de la session) avec rejet d'une session expirée ou d'un `userId` introuvable — vérifier par tests : session valide restaurée, session expirée ignorée, `logout()` vide `isAuthenticated`

## 5. Gardes de route

- [x] 5.1 Implémenter `authGuard`, `guestGuard` et la fabrique `roleGuard(...roles)` dans `src/app/core/guards/` — vérifier par tests que `authGuard` redirige un visiteur vers `/connexion`, que `guestGuard` redirige un connecté vers l'espace applicatif et que `roleGuard` refuse un rôle non autorisé
- [x] 5.2 Vérifier la mémorisation de l'URL demandée par `authGuard` — test qui confirme la redirection post-connexion vers l'URL initialement demandée

## 6. Écrans d'authentification et routage

- [x] 6.1 Créer l'écran de connexion (`src/app/features/auth/connexion/`) avec formulaire réactif, affichage des erreurs de validation et du message d'échec générique — vérifier que la soumission appelle `login()` et redirige en cas de succès
- [x] 6.2 Créer l'écran d'inscription (`src/app/features/auth/inscription/`) avec formulaire réactif, messages d'erreur par champ et gestion du doublon d'e-mail — vérifier que la soumission appelle `register()` et ouvre l'espace applicatif en cas de succès
- [x] 6.3 Déclarer les routes dans `src/app/app.routes.ts` (`/connexion` et `/inscription` sous `guestGuard`, espace applicatif sous `authGuard` + layout) avec redirection par défaut — vérifier en naviguant : visiteur redirigé vers `/connexion`, connecté vers l'espace applicatif
- [x] 6.4 Ajouter un écran « Accès refusé » pour les routes soumises à `roleGuard` — vérifier qu'un rôle non autorisé l'affiche au lieu du contenu protégé
- [x] 6.5 Relier le bouton de déconnexion de l'en-tête à `logout()` — vérifier manuellement l'effacement de la session et le retour à `/connexion`
- [x] 6.6 Ajouter une bascule « afficher/masquer » (icône œil) sur les champs mot de passe de la connexion et de l'inscription — vérifier par tests que le champ change de type `password`/`text` et que le bouton porte l'état `aria-pressed`

## 7. Vérification d'intégration

- [x] 7.1 Parcours complet bout en bout : inscription du premier compte (rôle `ADMIN`), déconnexion, reconnexion, accès à l'espace protégé, puis seconde inscription (rôle `MEMBRE`) — confirmer le comportement attendu
- [x] 7.2 Exécuter la suite de tests du projet et le build de production (`npm test`, `npm run build`) — vérifier qu'ils réussissent sans erreur

## Workflow follow-up

- Archive le change après validation par le projet (commande `openspec archive "add-authentification"`).
- Vérifie le résultat archivé et confirme que les specs `identity/auth` sont bien créées.
