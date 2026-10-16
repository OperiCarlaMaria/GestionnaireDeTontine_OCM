import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Autorise l'accès aux écrans applicatifs aux utilisateurs authentifiés.
 * Un visiteur est redirigé vers la connexion en mémorisant l'URL demandée.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/connexion'], {
    queryParams: { redirection: state.url },
  });
};
