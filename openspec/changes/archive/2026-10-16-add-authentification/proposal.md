# Proposal

## Why

L'application de gestion de tontine n'a aujourd'hui ni page, ni service ni contrôle d'accès : le squelette Angular est vide. Avant de pouvoir gérer les membres, les cotisations, les tours de bénéficiaires et l'historique des versements, il faut identifier chaque utilisateur de confiance et lui associer un rôle. L'authentification est donc le premier socle fonctionnel du projet.

## What Changes

- Ajout de l'inscription, de la connexion et de la déconnexion des utilisateurs.
- Stockage des mots de passe de façon sécurisée : hachage PBKDF2-SHA256 avec sel aléatoire via l'API Web Crypto, jamais de mot de passe en clair.
- Introduction de trois rôles : `ADMIN`, `TRESORIER`, `MEMBRE`. Le premier utilisateur inscrit devient automatiquement `ADMIN`.
- Gestion d'une session persistante (restauration après rechargement de la page) et déconnexion explicite.
- Protection des routes applicatives par des gardes d'authentification et de rôle.
- Mise en place d'un socle d'interface (design system et layout applicatif) qui servira à tous les modules suivants.
- Interface entièrement en français.

## Capabilities

### New Capabilities
- `identity/auth`: inscription, connexion, déconnexion, gestion de session, sécurité des mots de passe, attribution et contrôle des rôles, protection des routes.

### Modified Capabilities
- Aucune (le projet ne contient encore aucune spécification existante).

## Impact

- **Nouveau code** : `src/app/core/` (modèles, services `auth`/`storage`/`users`, gardes), `src/app/features/auth/` (écrans connexion et inscription), `src/app/features/layout/` (coquille applicative), mise à jour de `src/app/app.routes.ts` et `src/app/app.config.ts`.
- **Styles** : `src/styles.css` reçoit les variables du design system et la palette demandée (`#FFF7E6`, `#F7C8D3`, `#B46A72`, `#A8B58A`, `#A9B7C6`, `#2D3A47`).
- **Stockage** : persistance locale du navigateur (`localStorage`) pour les utilisateurs et la session ; aucune dépendance externe ajoutée.
- **Hors périmètre** : gestion des membres, cotisations, tours de bénéficiaires et historique des versements (changes OpenSpec ultérieurs).
