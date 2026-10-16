# identity/accounts Specification

## Purpose
Permet à l'administrateur de créer et de gérer les comptes des membres et du trésorier, d'attribuer les rôles, de gérer les mots de passe, et d'ouvrir une session au nom d'un autre compte pour vérifier son point de vue.

## Requirements

### Requirement: Création de compte par l'administrateur

Un administrateur authentifié SHALL pouvoir créer un compte en fournissant un nom complet, une adresse e-mail unique, un rôle choisi parmi `TRESORIER` et `MEMBRE`, et un mot de passe respectant la longueur minimale. Le compte créé est actif.

#### Scenario: Création réussie

- **WHEN** un administrateur soumet le formulaire de création avec un nom, un e-mail unique, un rôle et un mot de passe valide
- **THEN** le système crée le compte actif avec le rôle choisi et l'ajoute à la liste des comptes

#### Scenario: E-mail déjà utilisé

- **WHEN** un administrateur tente de créer un compte avec une adresse e-mail déjà associée à un compte existant
- **THEN** le système refuse la création et affiche un message indiquant que l'e-mail est déjà utilisé

#### Scenario: Mot de passe trop court

- **WHEN** un administrateur soumet un mot de passe de longueur insuffisante
- **THEN** le système refuse la création et indique la longueur minimale requise

#### Scenario: Réservé à l'administrateur

- **WHEN** un utilisateur qui n'est pas administrateur tente de créer un compte
- **THEN** le système refuse l'opération

### Requirement: Trésorier unique

Le système SHALL n'autoriser qu'un seul compte de rôle `TRESORIER` à la fois.

#### Scenario: Second trésorier refusé

- **WHEN** un administrateur tente de créer ou de promouvoir un compte avec le rôle `TRESORIER` alors qu'un trésorier existe déjà
- **THEN** le système refuse l'opération et indique qu'un trésorier existe déjà

### Requirement: Modification d'un compte

Un administrateur SHALL pouvoir modifier le nom complet et le rôle d'un compte, sans pouvoir modifier le rôle de son propre compte.

#### Scenario: Modification réussie

- **WHEN** un administrateur modifie le nom complet ou le rôle d'un autre compte
- **THEN** le système enregistre les modifications

#### Scenario: Rôle de son propre compte protégé

- **WHEN** un administrateur tente de modifier le rôle de son propre compte
- **THEN** le système refuse l'opération

### Requirement: Activation et désactivation d'un compte

Un administrateur SHALL pouvoir désactiver puis réactiver un compte autre que le sien. Un compte désactivé ne peut pas ouvrir de session.

#### Scenario: Désactivation

- **WHEN** un administrateur désactive un autre compte
- **THEN** le compte passe à l'état désactivé

#### Scenario: Connexion bloquée pour un compte désactivé

- **WHEN** un utilisateur dont le compte est désactivé tente de se connecter
- **THEN** le système refuse la connexion

#### Scenario: Réactivation

- **WHEN** un administrateur réactive un compte désactivé
- **THEN** le compte redevient actif et peut se connecter

#### Scenario: Désactivation de son propre compte refusée

- **WHEN** un administrateur tente de désactiver son propre compte
- **THEN** le système refuse l'opération

### Requirement: Réinitialisation du mot de passe par l'administrateur

Un administrateur SHALL pouvoir définir un nouveau mot de passe pour un compte, qui respecte la longueur minimale et reste stocké de façon sécurisée.

#### Scenario: Réinitialisation réussie

- **WHEN** un administrateur saisit un nouveau mot de passe valide pour un compte
- **THEN** le système enregistre le nouveau condensat et l'utilisateur peut se connecter avec ce mot de passe

#### Scenario: Nouveau mot de passe trop court

- **WHEN** un administrateur saisit un nouveau mot de passe de longueur insuffisante
- **THEN** le système refuse la réinitialisation et indique la longueur minimale requise

### Requirement: Changement de son propre mot de passe

Un utilisateur authentifié SHALL pouvoir changer son mot de passe en fournissant son mot de passe actuel et un nouveau mot de passe valide.

#### Scenario: Changement réussi

- **WHEN** un utilisateur authentifié saisit son mot de passe actuel correct et un nouveau mot de passe valide
- **THEN** le système enregistre le nouveau mot de passe et l'ancien n'est plus accepté

#### Scenario: Mot de passe actuel incorrect

- **WHEN** un utilisateur authentifié saisit un mot de passe actuel incorrect
- **THEN** le système refuse le changement et affiche un message d'erreur

### Requirement: Bascule « se connecter en tant que »

Un administrateur authentifié SHALL pouvoir ouvrir une session au nom d'un autre compte sans saisir son mot de passe, puis revenir à son propre compte.

#### Scenario: Bascule vers un autre compte

- **WHEN** un administrateur déclenche « se connecter en tant que » pour un autre compte
- **THEN** le système ouvre une session au nom de ce compte et affiche un bandeau indiquant la bascule

#### Scenario: Retour à son compte

- **WHEN** un administrateur en bascule déclenche le retour
- **THEN** le système rouvre sa session d'administrateur d'origine

#### Scenario: Bascule réservée à l'administrateur

- **WHEN** un utilisateur qui n'est pas administrateur tente de basculer vers un autre compte
- **THEN** le système refuse l'opération
