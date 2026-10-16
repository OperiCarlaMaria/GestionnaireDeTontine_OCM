# Proposal

## Why

Le projet va passer à la gestion des cotisations, des tours de bénéficiaires et des rappels de retard : tous ces modules dépendent de règles de base qui n'existent pas encore — le montant de la cotisation, sa fréquence, son jour d'échéance (pour calculer les retards), et la façon dont l'ordre des bénéficiaires est établi. Sans une configuration centralisée, chaque module devrait inventer ses propres valeurs et le réglage de la tontine serait impossible à modifier une seule fois.

## What Changes

- **Configuration de la tontine** : nom, montant de la cotisation, fréquence (`MENSUELLE` ou `HEBDOMADAIRE`), jour d'échéance (jour du mois, ou jour de la semaine pour la fréquence hebdomadaire) et mode d'ordre des tours (`ALEATOIRE` ou `MANUEL`).
- **Édition réservée à l'administrateur** : seul l'`ADMIN` peut modifier la configuration ; `TRESORIER` et `MEMBRE` sont refusés (règle appliquée dans le service, pas seulement dans l'interface).
- **Écran « Paramètres »** : formulaire dans l'espace administration (lien depuis l'écran Administration), validation à la saisie, messages d'erreur français.
- **Nom affiché dans l'en-tête** : la marque de l'application (en-tête de l'espace) affiche le nom configuré à la place du libellé générique « Tontine ».
- **Persistance** : la configuration reste stockée dans `localStorage` et survit au rechargement ; une configuration par défaut existe dès le premier lancement.

## Capabilities

### New Capabilities
- `tontine/configuration`: règles de base de la tontine (montant, fréquence, échéance, mode d'ordre des tours), leur validation, l'accès en édition réservé à l'administrateur, la persistance et l'affichage du nom.

### Modified Capabilities
_(aucune — ni la navigation par rôle ni la gestion des comptes ne changent de comportement)_

## Impact

- **Modèles** : `src/app/core/models/configuration.ts` (nouveau — interface `ConfigurationTontine`, valeurs par défaut, types de fréquence et d'ordre).
- **Services** : `src/app/core/services/configuration.service.ts` (nouveau — lecture, modification avec contrôle de rôle et validation) ; `src/app/features/layout/layout.ts` / `layout.html` (affichage du nom configuré).
- **Interface** : `src/app/features/espace/administration/parametres/` (nouveau — écran de paramètres), `src/app/app.routes.ts` (nouvelle route protégée `roleGuard('ADMIN')`), lien depuis l'écran `administration`.
- **Tests** : spec du service (défauts, refus non-admin, validations, persistance) et spec de l'écran (formulaire, messages, enregistrement).
- **Stockage** : `localStorage` du navigateur, clé `tontine.configuration`.
- **Hors périmètre** : consommation de la configuration par les modules cotisations/tours (changes suivants), jeu de données de démonstration, déclenchement d'alertes.
