# Tableau de bord Trésorier Specification


## Purpose

Espace de contrôle financier du trésorier : suivi des cotisations, versements, soldes et alertes. Accessible au rôle `TRESORIER` et `ADMIN`.

## Requirements

### Requirement: Suivi des cotisations
Le trésorier SHALL voir l'état des cotisations par membre :
- Cotisation collectée et totalisée
- Cotisation en attente
- Cotisation en retard (dépassé le jour d'échéance)

#### Scenario: Affichage des cotisations
- **WHEN** le trésorier ouvre son tableau de bord
- **THEN** il voit le nombre de cotisations collectées, en attente et en retard

### Requirement: Suivi des versements
Le trésorier SHALL pouvoir voir la liste des versements effectués ou en attente.

#### Scenario: Liste des versements
- **WHEN** le trésorier consulte la section versements
- **THEN** il voit la liste des versements avec le statut (effectué / en attente)

### Requirement: Soldes et prévisions
Le trésorier SHALL voir le solde disponible de la tontine.

#### Scenario: Affichage du solde
- **WHEN** le trésorier regarde le tableau de bord
- **THEN** il voit le solde disponible calculé (cotisations collectées - versements effectués)

### Requirement: Alertes
Le système SHALL afficher des alertes pour :
- Cotisations en retard (dépassé le jour d'échéance)
- Soldes disponibles inférieurs à 0 ou à un seuil faible

#### Scenario: Alertes cotisations en retard
- **WHEN** un ou plusieurs membres ont des cotisations en retard
- **THEN** le trésorier voit une alerte listant les membres concernés

### Requirement: Gestion des versements
Le trésorier SHALL pouvoir valider ou refuser un versement en attente.

#### Scenario: Validation de versement
- **WHEN** le trésorier valide un versement en attente
- **THEN** le versement est marqué comme effectué et le solde est mis à jour

### Requirement: Gestion des alertes
Le trésorier SHALL pouvoir ignorer ou marquer comme lue une alerte.

#### Scenario: Marquer lue
- **WHEN** le trésorier ouvre une alerte
- **THEN** l'alerte est marquée comme lue et n'apparaît plus dans la liste
