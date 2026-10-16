# Proposal

## Why

L'authentification existe, mais l'inscription publique est ouverte à tous et n'importe quel visiteur peut créer un compte `MEMBRE`. Une tontine est un groupe fermé : c'est un gestionnaire (administrateur) qui doit créer les comptes des membres et du trésorier. Il manque donc la gestion des comptes et la séparation nette des droits et des espaces par rôle, socle indispensable avant de construire les modules métier (membres, cotisations, tours, historique).

## What Changes

- **Inscription publique restreinte au premier administrateur** : seul le tout premier compte peut être créé librement (rôle `ADMIN`) ; ensuite l'inscription publique est fermée.
- **Gestion des comptes par l'administrateur** : créer un compte (membre ou trésorier) avec mot de passe, modifier les informations, activer/désactiver un compte, changer le rôle.
- **Trésorier unique** : l'application n'accepte qu'un seul compte de rôle `TRESORIER` à la fois.
- **Mots de passe** : l'administrateur définit le mot de passe à la création et peut le réinitialiser ; chaque utilisateur peut changer son propre mot de passe.
- **Bascule « se connecter en tant que »** (administrateur) : ouvrir une session au nom d'un autre compte pour vérifier son point de vue, avec possibilité de revenir à son compte.
- **Connexion refusée pour un compte désactivé**.
- **Espaces et navigation par rôle** : chaque rôle dispose de son espace (`/espace/administration` pour `ADMIN`, `/espace/tresorerie` pour `TRESORIER` et `ADMIN`, `/espace/mon-espace` pour tous), avec un tableau de bord commun et une navigation adaptée au rôle. Les espaces trésorerie et membre sont créés en tant que coquilles, remplies par les changes suivants.

## Capabilities

### New Capabilities
- `identity/accounts`: gestion des comptes par l'administrateur (création, modification, activation/désactivation, changement de rôle, trésorier unique), définition et réinitialisation des mots de passe, changement de son propre mot de passe, et bascule administrateur « se connecter en tant que ».

### Modified Capabilities
- `identity/auth`: l'inscription publique est limitée à la création du premier administrateur ; la connexion est refusée pour un compte désactivé ; ajout de la navigation et des espaces par rôle.

## Impact

- **Modèles** : `src/app/core/models/user.ts` (ajout d'un indicateur d'activation du compte, identifiants de création de compte, mémorisation du compte d'origine dans la session lors d'une bascule).
- **Services** : `src/app/core/services/auth.service.ts` (inscription bootstrap, création/gestion de comptes, changement et réinitialisation de mots de passe, bascule), `src/app/core/services/user.service.ts` (mise à jour d'un compte).
- **Interface** : `src/app/features/espace/administration/` (écran de gestion des comptes), nouvel écran « changer mon mot de passe », `src/app/features/layout/` (navigation et bandeau par rôle), nouvelles coquilles `src/app/features/espace/tresorerie/` et `src/app/features/espace/mon-espace/`, mise à jour de `src/app/app.routes.ts`.
- **Styles** : réutilisation du design system existant (`src/styles.css`), ajouts mineurs (tableau, bandeau de bascule).
- **Stockage** : toujours `localStorage` du navigateur ; chaque navigateur conserve ses propres comptes.
- **Hors périmètre** : gestion détaillée des membres cotisants (change `add-gestion-membres`), cotisations, tours de bénéficiaires, historique des versements, jeu de données de démonstration et configuration de déploiement Vercel.
