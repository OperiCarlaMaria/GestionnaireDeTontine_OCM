import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'espace' },
  {
    path: 'connexion',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/connexion/connexion').then((m) => m.Connexion),
  },
  {
    path: 'inscription',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/inscription/inscription').then((m) => m.Inscription),
  },
  {
    path: 'espace',
    canActivate: [authGuard],
    loadComponent: () => import('./features/layout/layout').then((m) => m.Layout),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./features/espace/tableau-de-bord/redirect/redirect').then((m) => m.TableauDeBordRedirect) },
      {
        path: 'tableau-de-bord-admin',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./features/espace/tableau-de-bord/tableau-de-bord-admin').then((m) => m.TableauDeBordAdmin),
      },
      {
        path: 'tableau-de-bord-tresorier',
        canActivate: [roleGuard('ADMIN', 'TRESORIER')],
        loadComponent: () =>
          import('./features/espace/tresorerie/tresorerie').then((m) => m.TableauDeBordTresorer),
      },
      {
        path: 'administration',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./features/espace/administration/administration').then((m) => m.Administration),
      },
      {
        path: 'administration/parametres',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./features/espace/administration/parametres/parametres').then((m) => m.Parametres),
      },
      {
        path: 'tresorerie',
        canActivate: [roleGuard('ADMIN', 'TRESORIER')],
        loadComponent: () =>
          import('./features/espace/tresorerie/tresorerie').then((m) => m.TableauDeBordTresorer),
      },
      {
        path: 'mon-espace',
        loadComponent: () =>
          import('./features/espace/mon-espace/mon-espace').then((m) => m.MonEspace),
      },
      {
        path: 'changer-mot-de-passe',
        loadComponent: () =>
          import('./features/espace/changer-mot-de-passe/changer-mot-de-passe').then(
            (m) => m.ChangerMotDePasse,
          ),
      },
    ],
  },
  {
    path: 'acces-refuse',
    canActivate: [authGuard],
    loadComponent: () => import('./features/acces-refuse/acces-refuse').then((m) => m.AccesRefuse),
  },
  { path: '**', redirectTo: 'espace' },
];