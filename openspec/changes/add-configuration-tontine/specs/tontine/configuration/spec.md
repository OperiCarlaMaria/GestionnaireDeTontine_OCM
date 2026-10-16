# Spec Delta

## Purpose

Définit les règles de base de la tontine (montant et fréquence de la cotisation, jour d'échéance, mode d'ordre des tours), qui alimentent les modules de cotisations, de tours de bénéficiaires et de rappels de retard.

## ADDED Requirements

### Requirement: Configuration de base de la tontine

Le système SHALL conserver une configuration de la tontine comprenant un nom, un montant de cotisation, une fréquence (`MENSUELLE` ou `HEBDOMADAIRE`), un jour d'échéance et un mode d'ordre des tours (`ALEATOIRE` ou `MANUEL`), modifiables par l'administrateur.

#### Scenario: Configuration initiale disponible

- **WHEN** l'application est utilisée pour la première fois sans configuration enregistrée
- **THEN** le système propose une configuration par défaut exploitable (nom, montant, fréquence, échéance, ordre des tours)

#### Scenario: Édition réussie par l'administrateur

- **WHEN** un administrateur enregistre une configuration valide avec des valeurs modifiées
- **THEN** le système persiste les nouvelles valeurs et les applique immédiatement

### Requirement: Validation de la configuration

Le système SHALL refuser l'enregistrement d'une configuration invalide : nom non vide, montant strictement positif, fréquence et mode d'ordre connus, jour d'échéance entre 1 et 31 pour la fréquence mensuelle et entre 1 et 7 pour la fréquence hebdomadaire.

#### Scenario: Valeurs invalides refusées

- **WHEN** l'administrateur soumet un nom vide, un montant nul ou négatif, ou une fréquence inconnue
- **THEN** le système n'enregistre rien et affiche un message d'erreur français associé au champ concerné

#### Scenario: Jour d'échéance hors bornes

- **WHEN** l'administrateur saisit un jour d'échéance de 8 en fréquence hebdomadaire ou de 32 en fréquence mensuelle
- **THEN** le système refuse l'enregistrement et indique les valeurs acceptées

### Requirement: Édition réservée à l'administrateur

Seul un utilisateur de rôle `ADMIN` SHALL pouvoir modifier la configuration ; toute tentative d'un autre rôle SHALL être refusée par le service, indépendamment de l'interface.

#### Scenario: Trésorier refusé

- **WHEN** un utilisateur de rôle `TRESORIER` tente de modifier la configuration
- **THEN** le système refuse l'opération et indique qu'elle est réservée à l'administrateur

#### Scenario: Membre refusé

- **WHEN** un utilisateur de rôle `MEMBRE` tente de modifier la configuration
- **THEN** le système refuse l'opération

### Requirement: Persistance de la configuration

Le système SHALL conserver la configuration enregistrée après un rechargement ou une nouvelle ouverture de l'application.

#### Scenario: Restauration après rechargement

- **WHEN** un administrateur modifie la configuration puis recharge l'application
- **THEN** le système restaure les valeurs enregistrées

### Requirement: Affichage du nom de la tontine

Le système SHALL afficher le nom configuré de la tontine dans l'en-tête de l'espace applicatif.

#### Scenario: Nom configuré affiché

- **WHEN** un utilisateur authentifié ouvre un écran de l'espace applicatif après que le nom a été modifié
- **THEN** l'en-tête affiche le nom configuré de la tontine

#### Scenario: Nom par défaut affiché

- **WHEN** aucune configuration n'a encore été enregistrée
- **THEN** l'en-tête affiche le nom par défaut de la tontine
