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
      { path: '', pathMatch: 'full', redirectTo: 'tableau-de-bord' },
      {
        path: 'tableau-de-bord',
        loadComponent: () =>
          import('./features/espace/tableau-de-bord/tableau-de-bord').then((m) => m.TableauDeBord),
      },
      {
        path: 'administration',
        canActivate: [roleGuard('ADMIN')],
        loadComponent: () =>
          import('./features/espace/administration/administration').then((m) => m.Administration),
      },
      {
        path: 'tresorerie',
        canActivate: [roleGuard('ADMIN', 'TRESORIER')],
        loadComponent: () =>
          import('./features/espace/tresorerie/tresorerie').then((m) => m.Tresorerie),
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
