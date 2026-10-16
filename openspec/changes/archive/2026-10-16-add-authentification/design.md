# Design

## Context

Voir `proposal.md` pour la motivation. État actuel : projet Angular 22 standalone (composants `standalone`, signals, `provideRouter`) généré avec le CLI, sans aucune fonctionnalité métier. `src/app/app.routes.ts` est vide et `src/app/app.config.ts` ne fournit que le routeur et les listeners d'erreurs. Aucune librairie UI ni backend n'est installé, et le projet doit rester sans dépendance externe pour cette étape.

Contraintes :
- Authentification et persistance entièrement côté client (pas de serveur).
- Mots de passe stockés de façon sécurisée selon les exigences de `specs/identity/auth/spec.md`.
- Trois rôles : `ADMIN`, `TRESORIER`, `MEMBRE`.
- Interface en français, palette imposée (`#FFF7E6`, `#F7C8D3`, `#B46A72`, `#A8B58A`, `#A9B7C6`, `#2D3A47`).
- Tests unitaires exécutés par le runner du projet (`vitest`, configuré via Angular).

## Goals / Non-Goals

**Goals:**
- Fournir une couche d'authentification isolée et testable, indépendante de l'interface.
- Préparer un socle (layout, design system, garde de rôle) réutilisable par les modules membres / cotisations / tours / historique.
- Garder la possibilité de remplacer plus tard le stockage local par un appel à une API HTTP sans réécrire les écrans.

**Non-Goals:**
- Gestion multi-appareils, synchronisation ou serveur d'authentification.
- Réinitialisation de mot de passe par e-mail.
- Gestion fine des permissions au-delà des trois rôles.
- Conception détaillée des modules métier suivants.

## Decisions

### 1. Persistance locale via un service de stockage dédié
Un `StorageService` encapsule l'accès à `localStorage` derrière une petite API typée (`read`, `write`, `remove`). Les services métier ne touchent jamais directement à `localStorage`.
- *Pourquoi* : centralise la sérialisation et le préfixage des clés, facilite les tests (remplacement par une implémentation mémoire) et une future migration vers un backend.
- *Alternative écartée* : appels directs à `localStorage` dans `AuthService` — couplage et tests plus fragiles.

### 2. Hachage des mots de passe avec PBKDF2 via l'API Web Crypto
À l'inscription, un sel aléatoire de 16 octets est généré par `crypto.getRandomValues()`. Le condensat est calculé par `crypto.subtle.deriveBits` avec PBKDF2-SHA-256, 100 000 itérations, sur des octets encodés en base64. La comparaison à la connexion se fait en recalculant le condensat avec le sel stocké.
- *Pourquoi* : API native du navigateur, aucun code cryptographique écrit à la main, coût de force brute élevé grâce au sel et au nombre d'itérations.
- *Alternative écartée* : SHA-256 simple sans sel/étirement — trop rapide, vulnérable aux tables précalculées.

### 3. Modèle utilisateur et rôles
`User` : `id`, `nomComplet`, `email`, `role`, `salt`, `passwordHash`, `dateCreation`. `Role` est une union de type `'ADMIN' | 'TRESORIER' | 'MEMBRE'`. Le premier compte enregistré reçoit `ADMIN`, les suivants `MEMBRE`.
- *Pourquoi* : un type union évite les valeurs de rôle invalides ; l'attribution du premier administrateur garantit qu'au moins un compte peut administrer la tontine.

### 4. Authentification par signals et service unique
`AuthService` expose un signal `currentUser` (et un signal dérivé `isAuthenticated`) ainsi que `register()`, `login()`, `logout()`. La session stocke `userId` et un horodatage d'expiration. Un `UserService` regroupe les opérations sur la collection d'utilisateurs.
- *Pourquoi* : les signals s'intègrent naturellement aux composants Angular modernes et rendent la réactivité de l'en-tête triviale.
- *Alternative écartée* : `BehaviorSubject`/RxJS — fonctionne mais ajoute de la complexité sans bénéfice ici.

### 5. Gardes fonctionnels
- `authGuard` : laisse passer un utilisateur authentifié, sinon redirige vers `/connexion` en mémorisant l'URL demandée.
- `guestGuard` : redirige un utilisateur déjà connecté depuis `/connexion` et `/inscription` vers l'espace applicatif.
- `roleGuard(...roles)` : refuse l'accès si le rôle courant n'est pas autorisé.
- *Pourquoi* : garde de rôle prête pour les modules suivants ; la mémorisation de l'URL améliore l'expérience après connexion.

### 6. Organisation des dossiers
`core/` (modèles, services, gardes) ne dépend jamais de `features/`. `features/auth/` contient les écrans connexion et inscription ; `features/layout/` la coquille applicative (en-tête avec nom, rôle et bouton de déconnexion).
- *Pourquoi* : séparation claire entre le socle transverse et les fonctionnalités, cohérente avec la croissance prévue du projet.

### 7. Design system en CSS natif
Variables CSS dans `src/styles.css` pour la palette et les espacements ; composants stylés en CSS encapsulé. Aucune librairie UI.
- *Pourquoi* : respecte la contrainte « sans dépendance » et la palette imposée, tout en gardant un style cohérent et élégant.

### 8. Messages d'erreur génériques à la connexion
En cas d'échec de connexion, le message ne distingue pas e-mail inconnu et mot de passe incorrect.
- *Pourquoi* : évite l'énumération des comptes existants.

## Risks / Trade-offs

- [Sécurité limitée côté client] Un utilisateur ayant accès au navigateur peut lire les condensats → acceptable pour une application locale/démonstrative ; un backend avec bcrypt/Argon2 est la cible si l'application devient multi-utilisateurs en réseau.
- [Données perdues au nettoyage du navigateur] Le stockage local peut être effacé → risque documenté ; export/import de données pourra être ajouté ultérieurement.
- [Coût de PBKDF2 à 100 000 itérations sur mobile] Léger ralentissement au calcul → valeur ajustable centralisée dans une constante.
- [Fuite de la session] Un `localStorage` accessible en XSS expose le jeton de session → application sans entrée utilisateur riche pour l'instant ; à réévaluer avec un backend.

## Migration Plan

Aucune migration de données nécessaire (projet neuf). Déploiement : livraison du code, aucune configuration serveur. Retour arrière : suppression des routes et services ajoutés, sans impact sur des données existantes.

## Open Questions

- Durée d'expiration de la session : valeur provisoire de 12 heures, à confirmer avec l'usage réel.
