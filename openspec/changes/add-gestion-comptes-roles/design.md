# Design

## Context

Voir `proposal.md` pour la motivation. État actuel : l'authentification de base (change `add-authentification`, archivé) est en place — `AuthService` (`register`/`login`/`logout`, session 12 h), `UserService` (lecture/ajout uniquement), gardes `authGuard`/`guestGuard`/`roleGuard`, écrans connexion/inscription, coquille `layout` avec navigation « Tableau de bord » + « Administration » (ADMIN), écran `administration` réduit à une coquille vide. Le change `add-gestion-comptes-roles` ne contient pour l'instant que le proposal et les deltas de specs.

Contraintes :
- Persistance `localStorage` inchangée, aucune dépendance externe, interface en français.
- `User` ne contient pas encore d'indicateur d'activation ; `register()` accepte toujours tout visiteur et attribue `MEMBRE` après le premier compte — comportement à fermer selon le delta `specs/identity/auth/spec.md` et à compléter selon `specs/identity/accounts/spec.md`.
- Tests Vitest via `ng test` ; les specs existantes (`auth.service.spec.ts`, `parcours-auth.spec.ts`, `guards.spec.ts`) codent l'ancien comportement d'inscription ouverte et devront être adaptées.

## Goals / Non-Goals

**Goals:**
- Fournir une couche de gestion des comptes (création, modification, activation, mots de passe, bascule) isolée dans les services, testable sans l'interface.
- Garantir les invariants métier critiques côté service : inscription fermée après le premier compte, trésorier unique, protections du compte propre.
- Livrer les espaces et la navigation par rôle, avec des coquilles prêtes à recevoir les modules métier suivants.

**Non-Goals:**
- Gestion des membres cotisants, cotisations, tours, historique (changes suivants).
- Réinitialisation de mot de passe par e-mail, verrouillage de compte après tentatives, journal d'audit.
- Synchronisation multi-appareils ou enforcement serveur (l'application reste locale).

## Decisions

### 1. Activation portée par un champ `actif` sur `User`, normalisé à la lecture
Ajout de `actif: boolean` à `User` (créé à `true`). `UserService.lister()` normalise les comptes hérités de l'ancien format (`actif !== false` → `true`).
- *Pourquoi* : l'état vit avec le compte, une seule source de vérité ; la normalisation à la lecture rend la migration des comptes existants transparente.
- *Alternative écartée* : une liste `comptesDesactives: string[]` séparée — indirection sujette aux incohérences.

### 2. Fermeture de l'inscription dans `register()`
`register()` refuse désormais toute inscription quand `users.nombre() > 0` (message « L'inscription publique est fermée. ») ; le premier compte reçoit toujours `ADMIN`. La validation (nom, e-mail, longueur MDP, doublon) reste inchangée.
- *Pourquoi* : le point de contrôle unique est le service ; l'écran d'inscription reste fonctionnel pour le bootstrap sans routing supplémentaire.
- *Alternative écartée* : routage conditionnel `/inscription` qui n'existe que sans compte — plus complexe, même sécurité (tout reste côté client).

### 3. Opérations de gestion centralisées dans `AuthService`, persistance dans `UserService`
`AuthService` expose : `creerCompte()` (ADMIN uniquement, trésorier unique), `modifierCompte()` (nom/rôle, rôle propre protégé, trésorier unique), `activerCompte()`/`desactiverCompte()` (jamais son propre compte), `reinitialiserMotDePasse()` (ADMIN), `changerMotDePasse()` (actuel + nouveau, utilisateur courant), `seConnecterEnTantQue()`/`revenirASonCompte()` (ADMIN). `UserService` gagne `mettreAJour()`. Le hachage réutilise `PasswordHasherService`.
- *Pourquoi* : `AuthService` détient déjà le hasher, la session et le validation ; le proposal impose cette répartition. Une seule porte d'entrée pour les règles métier = un seul endroit à tester.
- *Alternative écartée* : un `CompteService` distinct — dissiperait les validations entre deux services sans gain (même couche, mêmes dépendances).

### 4. Invariant « trésorier unique » vérifié par un helper privé
Une méthode privée `possedeTresorier(saufId?)` compte les comptes `TRESORIER` en excluant un id ; appelée avant création et avant promotion en `TRESORIER`. Rétrograder le trésorier existant reste libre (il n'y en a qu'un : le rétrograder libère le poste).
- *Pourquoi* : la règle est une contrainte métier, pas de stockage ; regrouper la vérification évite les oublis entre création et promotion.
- *Alternative écartée* : imposer l'unicité dans `UserService` — mélangerait règle métier et persistance.

### 5. Bascule mémorisée dans la session (`compteOrigineId`)
`Session` devient `{ userId, expiresAt, compteOrigineId? }`. `seConnecterEnTantQue(cible)` ouvre la session de la cible en conservant l'admin d'origine ; `revenirASonCompte()` rouvre l'origine après vérification (existe, actif, rôle `ADMIN`), sinon déconnexion. Un signal dérivé `enBascule` alimente le bandeau du layout.
- *Pourquoi* : la session est déjà effacée par `logout()` — la bascule meurt avec la déconnexion, sans clé parallèle ; le rechargement conserve la bascule.
- *Alternative écartée* : clé `localStorage` dédiée « compte d'origine » — survivrait à la déconnexion et fausserait la restauration de session.

### 6. Changement de mot de passe personnel : écran dédié dans l'espace
Route `/espace/changer-mot-de-passe` sous le layout (authentifié, sans garde de rôle), formulaire « mot de passe actuel + nouveau », lien dans l'en-tête.
- *Pourquoi* : accessible à tous les rôles, testable via garde simple, cohérent avec les autres écrans à route.
- *Alternative écartée* : modale dans le layout — état UI dispersé, non routable, plus difficile à tester.

### 7. Espace de l'administration : une seule page à signaux, actions par ligne
`administration` affiche : formulaire de création, tableau des comptes (nom, e-mail, rôle, état, date) et, par ligne, les actions (modifier nom/rôle, activer/désactiver, réinitialiser le mot de passe, « Se connecter en tant que »). État local en signals ; aucun composant enfant ni librairie de table.
- *Pourquoi* : volume de code maîtrisé, suit le style des écrans existants (signals + ReactiveForms), évite l'abstraction prématurée.

### 8. Routes et navigation par rôle
Ajouts dans `app.routes.ts` (enfants de `/espace`) : `tresorerie` (`roleGuard('ADMIN','TRESORIER')`), `mon-espace` (tous authentifiés), `changer-mot-de-passe` (tous authentifiés) ; `administration` existant (`roleGuard('ADMIN')`). Navigation du layout : Tableau de bord (commun), Administration (ADMIN), Trésorerie (ADMIN + TRESORIER), Mon espace (commun). `tresorerie` et `mon-espace` sont des coquilles avec message « module à venir ».
- *Pourquoi* : satisfait les scénarios « Navigation et espaces par rôle » du delta `identity/auth` tout en gardant le tableau de bord commun du proposal ; les gardes existants suffisent.

## Risks / Trade-offs

- [Toute la sécurité reste côté client] Un utilisateur peut éditer `localStorage` pour se dire ADMIN → acceptable pour une application locale ; un backend reste la cible si déploiement partagé. Atténué : toutes les règles passent par les services (un seul point à verrouiller plus tard).
- [Comptes existants sans champ `actif`] Normalisation à la lecture dans `UserService.lister()` → migration transparente, testée.
- [Compte d'origine désactivé ou supprimé pendant la bascule] `revenirASonCompte()` vérifie existence, activation et rôle `ADMIN`, sinon déconnexion → pas de session orpheline.
- [Les specs existantes codent l'inscription ouverte] `auth.service.spec.ts`, `parcours-auth.spec.ts` et `guards.spec.ts` seront adaptés au nouveau contrat → intégré aux tâches, `npm test` doit repasser au vert.
- [Concurrence sur `localStorage` (plusieurs onglets)] Dernière écriture gagnante → hors périmètre, comme pour le reste de l'application.

## Migration Plan

Aucune action requise : les comptes déjà stockés restent valides (`actif` rétrogradé à `true` par normalisation), la session existante (sans `compteOrigineId`) se restaure telle quelle. Déploiement : livraison du code. Retour arrière : rétablir la version précédente du code ; les comptes créés en plus restent lisibles par l'ancienne version.

## Open Questions

- Libellé exact du bandeau de bascule : formulation libre (« Vous consultez le compte de … »), sans impact sur les specs.
