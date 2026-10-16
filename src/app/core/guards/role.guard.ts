import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Role } from '../models/role';
import { AuthService } from '../services/auth.service';

/**
 * Fabrique un garde qui restreint un écran aux rôles autorisés.
 * Un visiteur est renvoyé vers la connexion, un rôle insuffisant vers l'accès refusé.
 */
export function roleGuard(...roles: Role[]): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/connexion']);
    }
    const role = auth.role();
    if (role !== null && roles.includes(role)) {
      return true;
    }
    return router.createUrlTree(['/acces-refuse']);
  };
}
