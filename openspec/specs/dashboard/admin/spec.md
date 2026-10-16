# Dashboard Admin Specification

## Purpose

Espace de contrôle de l'administrateur : statistiques globales, configuration de la tontine, gestion des rapports et suivi des comptes. Lausanne accessible au rôle `ADMIN`.

## Requirements

### Requirement: Statistiques globales
L'administrateur SHALL voir les statistiques suivantes sur le tableau de bord :
- Nombre total de membres
- Nombre de membres actifs
- Nombre de membres inactifs
- Montant total des cotisations collectées en fcfa
- Nombre de versements effectués en fcfa

#### Scenario: Affichage des statistiques
- **WHEN** l'administrateur ouvre le tableau de bord
- **THEN** il voit les 5 statistiques ci-dessus avec les valeurs actuelles

### Requirement: Graphiques d'évolution
L'administrateur SHALL voir une représentation graphique (boucle) des entrées sur les 6 derniers mois.

#### Scenario: Boucle mensuelle
- **WHEN** l'administrateur regarde la section statistiques
- **THEN** il voit une boucle avec 6 points, chaque point représentant un mois avec sa valeur en fcfa

### Requirement: Configuration de la tontine
L'administrateur SHALL modifier la configuration principale via le tableau de bord :
- Nom de la tontine
- Montant de la cotisation
- Fréquence (mensuelle / hebdomadaire)
- Jour d'échéance
- Ordre des tours (aléatoire / manuel)

#### Scenario: Modification réussie
- **WHEN** l'administrateur modifie les champs de configuration et sauvegarde
- **THEN** les nouvelles valeurs sont enregistrées et affichées partout dans l'application

#### Scenario: Validation de saisie
- **WHEN** l'administrateur saisit un montant négatif ou nul
- **THEN** la sauvegarde est refusée avec un message d'erreur

### Requirement: Gestion des comptes
L'administrateur SHALL pouvoir accéder à la gestion complète des comptes depuis le tableau de bord.

### Requirement: Export de rapports
L'administrateur SHALL pouvoir exporter les statistiques en format CSV.

#### Scenario: Export CSV
- **WHEN** l'administrateur clique sur "Exporter CSV"
- **THEN** un fichier CSV téléchargeable est généré avec les statistiques actuelles
