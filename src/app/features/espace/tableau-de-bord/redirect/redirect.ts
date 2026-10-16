import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

/** Redirige l'utilisateur vers son tableau de bord selon son rôle. */
@Component({
  selector: 'app-tableau-de-bord-redirect',
  template: '',
  standalone: true,
})
export class TableauDeBordRedirect {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  constructor() {
    effect(() => {
      const role = this.auth.role();
      if (role === null) {
        this.router.navigate(['/connexion']);
        return;
      }
      switch (role) {
        case 'ADMIN':
          this.router.navigate(['/espace/tableau-de-bord-admin']);
          break;
        case 'TRESORIER':
          this.router.navigate(['/espace/tableau-de-bord-tresorier']);
          break;
        case 'MEMBRE':
          this.router.navigate(['/espace/mon-espace']);
          break;
      }
    });
  }
}
