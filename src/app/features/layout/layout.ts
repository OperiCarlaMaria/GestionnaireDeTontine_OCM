import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { libelleRole } from '../../core/models/role';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly utilisateur = this.auth.currentUser;
  readonly libelleRole = libelleRole;

  seDeconnecter(): void {
    this.auth.logout();
    this.router.navigate(['/connexion']);
  }
}
