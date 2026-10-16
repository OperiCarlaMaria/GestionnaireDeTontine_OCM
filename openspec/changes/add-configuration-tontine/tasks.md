# Tasks

## 1. Modèle et service de configuration

- [ ] 1.1 Créer `src/app/core/models/configuration.ts` : interface `ConfigurationTontine`, unions de fréquence et d'ordre, `CONFIGURATION_PAR_DEFAUT` — vérifier la compilation TypeScript stricte (`npm run build`)
- [ ] 1.2 Implémenter `ConfigurationService` (lecture avec repli défaut, `modifier()` contrôlant le rôle `ADMIN` puis validant nom non vide, montant > 0, fréquence/ordre connus, échéance 1-31 mensuelle / 1-7 hebdomadaire, persistance `localStorage`) — vérifier par tests : défauts au premier accès, édition admin enregistrée, refus trésorier et membre avec message exact, chaque validation refusée sans persistance, restauration après rechargement de la session

## 2. Écran de paramètres et intégration

- [ ] 2.1 Créer `src/app/features/espace/administration/parametres/` (formulaire réactif pré-rempli, bornes du jour d'échéance adaptées à la fréquence, messages d'erreur par champ, réaffichage après enregistrement) — vérifier par test d'écran : valeurs courantes affichées, soumission invalide affiche les messages et ne modifie pas le service, soumission valide enregistre
- [ ] 2.2 Déclarer la route `/espace/administration/parametres` sous `roleGuard('ADMIN')` et ajouter le lien « Paramètres de la tontine » depuis l'écran Administration — vérifier par parcours d'intégration : l'admin atteint l'écran, un trésorier ou un membre est redirigé vers l'accès refusé
- [ ] 2.3 Afficher le nom configuré dans l'en-tête du layout (repli sur le défaut) — vérifier par test : après modification du nom, l'en-tête de l'espace affiche le nouveau nom

## 3. Vérification d'intégration

- [ ] 3.1 Parcours complet : admin ouvre les paramètres, modifie montant/fréquence/échéance/nom, recharge l'application, tout est restauré et l'en-tête affiche le nom — confirmer le comportement attendu
- [ ] 3.2 Exécuter la suite de tests et le build de production (`npm test`, `npm run build`) — vérifier qu'ils réussissent sans erreur

## Workflow follow-up

- Archive le change après validation visuelle (commande `openspec archive "add-configuration-tontine" --yes`) et vérifie que la spec `tontine/configuration` est créée.
