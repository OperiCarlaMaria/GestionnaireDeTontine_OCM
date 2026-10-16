# Spec Delta

## MODIFIED Requirements

### Requirement: Inscription d'un utilisateur

Le système SHALL permettre à un visiteur de créer un compte en fournissant un nom complet, une adresse e-mail et un mot de passe, uniquement tant qu'aucun compte n'existe. Cette inscription initiale crée le premier administrateur ; une fois qu'un compte existe, l'inscription publique est fermée.

#### Scenario: Inscription réussie

- **WHEN** un visiteur soumet le formulaire d'inscription alors qu'aucun compte n'existe, avec un nom, un e-mail unique et un mot de passe valide
- **THEN** le système crée le premier compte avec le rôle `ADMIN`, ouvre une session et redirige l'utilisateur vers l'espace applicatif

#### Scenario: Inscription publique fermée

- **WHEN** un visiteur tente de s'inscrire alors qu'au moins un compte existe déjà
- **THEN** le système refuse l'inscription et indique que l'inscription publique est fermée

#### Scenario: E-mail déjà utilisé

- **WHEN** un visiteur soumet une adresse e-mail déjà associée à un compte existant
- **THEN** le système refuse l'inscription et affiche un message indiquant que l'e-mail est déjà utilisé

### Requirement: Connexion

Le système SHALL authentifier un utilisateur à partir de son adresse e-mail et de son mot de passe, et SHALL ouvrir une session lorsque les identifiants correspondent à un compte existant et actif.

#### Scenario: Connexion réussie

- **WHEN** un utilisateur saisit une adresse e-mail et un mot de passe correspondant à un compte actif
- **THEN** le système ouvre une session et redirige vers l'espace applicatif

#### Scenario: Identifiants invalides

- **WHEN** un utilisateur saisit une adresse e-mail inconnue ou un mot de passe incorrect
- **THEN** le système refuse la connexion et affiche un message d'erreur générique sans indiquer lequel des deux champs est incorrect

#### Scenario: Compte désactivé

- **WHEN** un utilisateur saisit les identifiants exacts d'un compte désactivé
- **THEN** le système refuse la connexion et indique que le compte est désactivé

### Requirement: Attribution des rôles

Le système SHALL associer à chaque compte un rôle parmi `ADMIN`, `TRESORIER` et `MEMBRE`. Le premier compte créé via l'inscription initiale SHALL recevoir le rôle `ADMIN`. Les comptes créés ensuite SHALL être créés par un administrateur et recevoir un rôle parmi `TRESORIER` et `MEMBRE`.

#### Scenario: Premier compte administrateur

- **WHEN** le tout premier compte de l'application est créé
- **THEN** ce compte reçoit le rôle `ADMIN`

#### Scenario: Comptes suivants

- **WHEN** un administrateur crée un compte en choisissant un rôle
- **THEN** ce compte reçoit le rôle choisi par l'administrateur

## ADDED Requirements

### Requirement: Navigation et espaces par rôle

Le système SHALL présenter une navigation adaptée au rôle de l'utilisateur connecté et SHALL orienter chaque rôle vers son espace : l'`ADMIN` vers l'administration, le `TRESORIER` vers la trésorerie, et tout utilisateur authentifié vers son espace personnel.

#### Scenario: Espace de l'administrateur

- **WHEN** un utilisateur de rôle `ADMIN` ouvre son espace
- **THEN** le système lui présente la navigation vers l'administration et la trésorerie

#### Scenario: Espace du trésorier

- **WHEN** un utilisateur de rôle `TRESORIER` ouvre son espace
- **THEN** le système lui présente la navigation vers la trésorerie, sans accès à l'administration

#### Scenario: Espace du membre

- **WHEN** un utilisateur de rôle `MEMBRE` ouvre son espace
- **THEN** le système lui présente son espace personnel, sans accès à l'administration ni à la trésorerie
