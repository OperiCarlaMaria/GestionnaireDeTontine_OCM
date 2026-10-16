# Design

## Context

Voir `proposal.md` pour la motivation. État actuel : l'authentification, les rôles et la gestion des comptes sont en place (specs `identity/auth` et `identity/accounts` archivées et synchronisées) ; l'espace `administration` et la coquille `layout` existent. Rien ne porte pour l'instant les paramètres de la tontine — le libellé de marque « Tontine » est codé en dur dans `layout.html`.

Contraintes :
- Persistance `localStorage` via `StorageService`, aucune dépendance externe, interface et messages en français.
- Trois rôles : `ADMIN` (seul éditeur de la configuration), `TRESORIER` et `MEMBRE` (lecture seule).
- Les modules suivants (cotisations, tours, rappels) liront cette configuration : son modèle doit être stable.

## Goals / Non-Goals

**Goals:**
- Une source unique de vérité pour les règles de base (montant, fréquence, échéance, ordre des tours), lisible par les futurs modules.
- Un contrôle d'accès appliqué dans le service (pas seulement masqué dans l'interface).
- Un écran de réglage simple, sans perturber l'espace administration existant.

**Non-Goals:**
- Consommer la configuration dans les cotisations/tours (changes suivants `add-cotisations`, `add-tours-beneficiaires`).
- Alertes, notifications ou calculs d'échéance (change `add-rappels-retards`).
- Jeu de données de démonstration et déploiement.

## Decisions

### 1. Un modèle unique `ConfigurationTontine` avec défauts exportés
Interface : `nom`, `montantCotisation`, `frequence: 'MENSUELLE' | 'HEBDOMADAIRE'`, `jourEcheance: number`, `ordreTours: 'ALEATOIRE' | 'MANUEL'`. Une constante `CONFIGURATION_PAR_DEFAUT` est exportée et sert de repli à la lecture.
- *Pourquoi* : un seul objet, une seule clé `tontine.configuration` — les modules futurs lisent sans logique de reconstruction ; les unions de types interdisent les valeurs exotiques.
- *Alternative écartée* : un réglage par module (comptes, cotisations, tours…) — dispersion et risque d'incohérence.

### 2. Un champ `jourEcheance` unique, interprété selon la fréquence
`1..31` en mensuel (jour du mois), `1..7` en hebdomadaire (jour de la semaine, lundi = 1) ; la validation dépend de la fréquence choisie.
- *Pourquoi* : un seul champ à persister et à afficher, l'interprétation est portée par `frequence` déjà présente.
- *Alternative écartée* : deux champs (`jourMois`, `jourSemaine`) — doublon, valeurs parasites hors usage.

### 3. `ConfigurationService` : lecture publique, écriture contrôlée dans le service
Le service injecte `StorageService` et `AuthService` ; `modifier()` refuse si le rôle courant n'est pas `ADMIN` (spécification « indépendamment de l'interface »), valide les bornes et persiste. Aucun cycle d'injection (`AuthService` ne dépend pas de ce service).
- *Pourquoi* : la règle métier vit au même niveau que les autres (services `core/`), testable sans interface.
- *Alternative écartée* : contrôle uniquement par `roleGuard` sur la route — contournable par un appel direct du service, insuffisant face à la spec.

### 4. Écran séparé `/espace/administration/parametres`, lien depuis Administration
Route protégée par `roleGuard('ADMIN')`, composant autonome avec formulaire réactif ; l'écran Administration gagne un lien « Paramètres de la tontine ».
- *Pourquoi* : l'écran Administration (comptes) reste lisible ; la navigation globale par rôle ne change pas — aucun delta sur `identity/auth`.
- *Alternative écartée* : tout intégrer à la page Administration — page surchargée ; nouvelle entrée de navigation — encombrement pour un accès rare.

### 5. Nom de la tontine lu par le layout
`Layout` lit la configuration (signal du service) et affiche `nom` à la place de la marque codée en dur, avec repli sur le défaut.
- *Pourquoi* : répond au scénario d'affichage sans dupliquer la logique ; un seul lecteur de plus.

### 6. Validation en deux couches
Le composant affiche les erreurs par champ (retour immédiat) ; le service ré-applique les mêmes règles avant persistance (source de vérité). Messages constants en français dans le service.
- *Pourquoi* : l'interface peut être court-circuitée ; la spec impose le refus côté service.

## Risks / Trade-offs

- [Configuration locale par navigateur] Chaque navigateur a sa configuration — même limite que les comptes, déjà documentée ; la sauvegarde/restauration (change `add-sauvegarde-export`) y remédiera.
- [Champ `jourEcheance` à interprétation variable] Peut induire en erreur l'utilisateur — atténué par des bornes et des libellés adaptés à la fréquence dans le formulaire.
- [Valeurs par défaut arbitraires] Le montant par défaut (1000) est neutre et immédiatement modifiable — consigne : l'administrateur règle la configuration avant toute saisie de cotisation (vérifié par les changes suivants).

## Migration Plan

Aucune migration : la configuration par défaut est créée à la première lecture. Déploiement : livraison du code. Retour arrière : suppression du service, de l'écran et de la route, sans impact sur les données existantes (la clé de stockage devient orpheline, inoffensive).

## Open Questions

- Montant de cotisation par défaut : valeur neutre proposée `1000`, à ajuster selon votre tontine — sans impact sur les specs (l'administrateur le remplace au premier réglage).
