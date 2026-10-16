# Spec Delta

## Purpose

Permet d'inscrire, connecter et déconnecter les utilisateurs de l'application de tontine, de sécuriser leurs mots de passe, de leur attribuer un rôle et de protéger l'accès aux fonctionnalités réservées aux utilisateurs authentifiés.

## ADDED Requirements

### Requirement: Inscription d'un utilisateur

Le système SHALL permettre à un visiteur de créer un compte en fournissant un nom complet, une adresse e-mail et un mot de passe.

#### Scenario: Inscription réussie

- **WHEN** un visiteur soumet le formulaire d'inscription avec un nom, un e-mail unique et un mot de passe valide
- **THEN** le système crée le compte, ouvre une session et redirige l'utilisateur vers l'espace applicatif

#### Scenario: E-mail déjà utilisé

- **WHEN** un visiteur soumet une adresse e-mail déjà associée à un compte existant
- **THEN** le système refuse l'inscription et affiche un message indiquant que l'e-mail est déjà utilisé

### Requirement: Validation des données d'inscription

Le système SHALL valider les données saisies avant de créer un compte : nom complet non vide, adresse e-mail au format valide et mot de passe respectant une longueur minimale de 8 caractères.

#### Scenario: Données invalides

- **WHEN** un visiteur soumet le formulaire avec un champ manquant, un e-mail mal formé ou un mot de passe trop court
- **THEN** le système n'enregistre rien et affiche un message d'erreur associé à chaque champ concerné

### Requirement: Stockage sécurisé des mots de passe

Le système SHALL stocker les mots de passe uniquement sous forme de condensat protégé par un sel aléatoire unique par compte, calculé avec un algorithme de dérivation de clé résistant aux attaques par force brute. Le mot de passe en clair ne doit jamais être enregistré ni affiché.

#### Scenario: Mot de passe jamais persisté en clair

- **WHEN** un compte est créé ou lu depuis le stockage local
- **THEN** aucune donnée persistée ne contient le mot de passe en clair et chaque compte possède un sel distinct

### Requirement: Connexion

Le système SHALL authentifier un utilisateur à partir de son adresse e-mail et de son mot de passe, et SHALL ouvrir une session lorsque les identifiants correspondent à un compte existant.

#### Scenario: Connexion réussie

- **WHEN** un utilisateur saisit une adresse e-mail et un mot de passe correspondant à un compte
- **THEN** le système ouvre une session et redirige vers l'espace applicatif

#### Scenario: Identifiants invalides

- **WHEN** un utilisateur saisit une adresse e-mail inconnue ou un mot de passe incorrect
- **THEN** le système refuse la connexion et affiche un message d'erreur générique sans indiquer lequel des deux champs est incorrect

### Requirement: Persistance de la session

Le système SHALL conserver la session de l'utilisateur authentifié après un rechargement ou une nouvelle ouverture de l'application, jusqu'à la déconnexion ou l'expiration de la session.

#### Scenario: Restauration après rechargement

- **WHEN** un utilisateur authentifié recharge l'application
- **THEN** le système le reconnaît comme connecté sans lui redemander ses identifiants

#### Scenario: Session expirée

- **WHEN** un utilisateur présente une session dont la durée de validité est dépassée
- **THEN** le système considère l'utilisateur comme déconnecté et le redirige vers l'écran de connexion

### Requirement: Déconnexion

Le système SHALL permettre à un utilisateur authentifié de mettre fin à sa session.

#### Scenario: Déconnexion

- **WHEN** un utilisateur authentifié déclenche la déconnexion
- **THEN** le système efface la session et redirige vers l'écran de connexion

### Requirement: Attribution des rôles

Le système SHALL associer à chaque compte un rôle parmi `ADMIN`, `TRESORIER` et `MEMBRE`. Le premier compte créé SHALL recevoir le rôle `ADMIN`. Les comptes créés lors d'une inscription ultérieure SHALL recevoir le rôle `MEMBRE` par défaut.

#### Scenario: Premier compte administrateur

- **WHEN** le tout premier compte de l'application est créé
- **THEN** ce compte reçoit le rôle `ADMIN`

#### Scenario: Comptes suivants

- **WHEN** un compte est créé alors qu'au moins un compte existe déjà
- **THEN** ce compte reçoit le rôle `MEMBRE`

### Requirement: Protection des routes

Le système SHALL restreindre l'accès aux écrans applicatifs aux utilisateurs authentifiés et SHALL permettre de restreindre un écran à certains rôles.

#### Scenario: Accès non authentifié

- **WHEN** un visiteur non connecté tente d'accéder à un écran applicatif protégé
- **THEN** le système le redirige vers l'écran de connexion

#### Scenario: Rôle insuffisant

- **WHEN** un utilisateur connecté dont le rôle ne fait pas partie des rôles autorisés tente d'accéder à un écran réservé
- **THEN** le système lui refuse l'accès et affiche un écran d'accès refusé

#### Scenario: Utilisateur authentifié redirigé depuis l'authentification

- **WHEN** un utilisateur déjà connecté accède à l'écran de connexion ou d'inscription
- **THEN** le système le redirige vers l'espace applicatif
