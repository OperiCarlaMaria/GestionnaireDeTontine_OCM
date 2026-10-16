# Module de Statistiques Specification

## Purpose

Fournir des statistiques structurées pour les tableaux de bord administrateur et trésorier.

## Requirements

### Requirement: Données par devise
Toutes les statistiques monétaires SHALL être exprimées en francs CFA (fcfa).

#### Scenario: Montant en fcfa
- **WHEN** une statistique monétaire est affichée
- **THEN** la valeur est affichée avec le symbole "FCFA" ou "F CFA"

### Requirement: Données membres
L'interface statistique SHALL fournir :
- Nombre total de membres
- Nombre de membres actifs
- Nombre de membres inactifs

#### Scenario: Comptage des membres
- **WHEN** les statistiques sont calculées
- **THEN** le nombre total = membres actifs + membres inactifs

### Requirement: Données cotisations
L'interface statistique SHALL fournir :
- Nombre de cotisations collectées
- Nombre de cotisations en attente
- Nombre de cotisations en retard

#### Scenario: Identification des cotisations en retard
- **WHEN** une cotisation est dépasse le jour d'échéance et qu'elle n'est pas marquée comme payée
- **THEN** elle est classée comme cotisation en retard

### Requirement: Données versements
L'interface statistique SHALL fournir :
- Nombre de versements effectués
- Montant total des versements effectués

### Requirement: Évolution mensuelle
L'interface SHALL fournir les valeurs mensuelles sur les 6 derniers mois (ou moins si des données insuffisantes).

#### Scenario: Série mensuelle
- **WHEN** les données existent pour 4 mois
- **THEN** l'interface affiche 4 points (moins que 6, mais aucune erreur)
