# Tasks

## 1. Modèles et persistance des comptes

- [x] 1.1 Ajouter `actif: boolean` et l'interface `DonneesCreationCompte` dans `src/app/core/models/user.ts`, et `compteOrigineId?: string` à `Session` — vérifier la compilation TypeScript stricte (`npm run build`)
- [x] 1.2 Étendre `UserService` : normalisation de `actif` à `true` à la lecture des comptes hérités et méthode `mettreAJour()` — vérifier par tests unitaires : un compte stocké sans `actif` est renvoyé actif, `mettreAJour()` persiste les modifications
- [x] 1.3 Adapter `auth.service.spec.ts` et `user.service.spec.ts` aux nouveaux champs — vérifier que `npm test` reste vert pour ces fichiers

## 2. Fermeture de l'inscription et comptes désactivés à la connexion

- [x] 2.1 Modifier `AuthService.register()` : refuser toute inscription dès qu'au moins un compte existe (message « L'inscription publique est fermée. »), le premier compte restant `ADMIN` — vérifier par tests : premier compte `ADMIN` créé, seconde inscription refusée avec le message exact, doublon d'e-mail toujours détecté sur le bootstrap
- [x] 2.2 Modifier `AuthService.login()` : refuser la connexion d'un compte désactivé avec un message explicite avant la vérification du mot de passe — vérifier par tests : compte désactivé refusé (message « compte désactivé »), compte réactivé de nouveau connectable
- [x] 2.3 Mettre à jour `parcours-auth.spec.ts` au nouveau contrat (inscription fermée après le premier compte) — vérifier que `npm test` passe

## 3. Gestion des comptes par l'administrateur

- [x] 3.1 Implémenter `creerCompte()` dans `AuthService` (rôle `ADMIN` requis, rôles `TRESORIER`/`MEMBRE` uniquement, e-mail unique, MDP ≥ 8 caractères, compte créé actif, trésorier unique) — vérifier par tests : création réussie, refus non-admin, refus e-mail dupliqué, refus MDP court, refus second trésorier
- [x] 3.2 Implémenter `modifierCompte()` (nom complet et rôle ; refus de modifier son propre rôle ; trésorier unique à la promotion) — vérifier par tests : modification enregistrée, rôle propre protégé, promotion en second trésorier refusée, rétrogradation du trésorier existant autorisée
- [x] 3.3 Implémenter `activerCompte()`/`desactiverCompte()` avec refus sur son propre compte — vérifier par tests : désactivation/réactivation d'un autre compte, refus sur soi, compte désactivé incapable de se reconnecter (lien §2)
- [x] 3.4 Implémenter `reinitialiserMotDePasse()` (ADMIN, nouveau MDP ≥ 8 caractères, hachage régénéré) — vérifier par tests : réinitialisation acceptée, ancien MDP refusé / nouveau accepté à la connexion, MDP court refusé

## 4. Changement de son propre mot de passe

- [x] 4.1 Implémenter `changerMotDePasse(motDePasseActuel, nouveau)` pour l'utilisateur courant — vérifier par tests : changement réussi (ancien MDP refusé ensuite), ancien MDP incorrect refusé, nouveau MDP trop court refusé, refus si déconnecté

## 5. Bascule « se connecter en tant que »

- [x] 5.1 Implémenter `seConnecterEnTantQue()` et `revenirASonCompte()` avec `compteOrigineId` persisté dans la session, plus signal `enBascule` — vérifier par tests : bascule ouvre la session de la cible avec l'origine conservée, retour restaure l'admin, refus si l'utilisateur n'est pas `ADMIN`, retour refusé (déconnexion) si l'origine est désactivée/supprimée, bascule perdue à la déconnexion mais conservée au rechargement

## 6. Écran d'administration des comptes

- [x] 6.1 Construire `administration.html`/`.ts`/`.css` : formulaire de création (nom, e-mail, rôle parmi `TRESORIER`/`MEMBRE`, mot de passe avec bascule de visibilité), tableau des comptes (nom, e-mail, rôle, état, date de création) et messages d'erreur — vérifier que l'écran compile et affiche la liste réelle des comptes
- [x] 6.2 Ajouter les actions par ligne : modifier (nom/rôle), activer/désactiver, réinitialiser le mot de passe, « Se connecter en tant que » — vérifier manuellement chaque action contre un compte de test (création, édition, bascule, retour)
- [ ] 6.3 Vérifier visuellement l'écran avec la palette existante (`npm start` puis parcours : admin → Administration → créer/modifier/désactiver un compte)

## 7. Écran « changer mon mot de passe »

- [x] 7.1 Créer `src/app/features/espace/changer-mot-de-passe/` (formulaire actuel + nouveau + bascule de visibilité) et la route `/espace/changer-mot-de-passe` accessible à tout authentifié — vérifier : changement réussi depuis l'écran, erreur affichée pour l'ancien MDP incorrect, un visiteur non connecté est redirigé vers `/connexion`

## 8. Espaces, routes et navigation par rôle

- [x] 8.1 Créer les coquilles `src/app/features/espace/tresorerie/` et `src/app/features/espace/mon-espace/` et déclarer les routes (`tresorerie` sous `roleGuard('ADMIN','TRESORIER')`, `mon-espace` pour tous) — vérifier : un `MEMBRE` atteint `/espace/mon-espace` mais est refusé sur `/espace/tresorerie` (écran accès refusé), un `TRESORIER` accède à la trésorerie
- [x] 8.2 Mettre à jour `layout.html`/`.css` : navigation adaptée au rôle (Administration pour `ADMIN`, Trésorerie pour `ADMIN`/`TRESORIER`, Mon espace pour tous), lien « Changer mon mot de passe » — vérifier en naviguant : chaque rôle ne voit que ses liens
- [x] 8.3 Ajouter le bandeau de bascule dans le layout (signal `enBascule`, libellé + bouton « Revenir à mon compte ») — vérifier manuellement : bascule depuis l'administration, bandeau visible, retour restaurateur l'admin

## 9. Vérification d'intégration

- [x] 9.1 Parcours complet bout en bout : bootstrap du premier `ADMIN`, fermeture de l'inscription, création d'un trésorier et d'un membre, désactivation puis refus de connexion, changement de MDP personnel, bascule et retour — confirmer chaque comportement attendu
- [x] 9.2 Exécuter la suite de tests et le build de production (`npm test`, `npm run build`) — vérifier qu'ils réussissent sans erreur

## Workflow follow-up

- Synchronise les specs du change vers `openspec/specs/` après implémentation validée.
- Archive le change après validation (commande `openspec archive "add-gestion-comptes-roles"`) et vérifie le résultat.
