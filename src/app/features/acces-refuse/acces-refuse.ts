import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-acces-refuse',
  imports: [RouterLink],
  templateUrl: './acces-refuse.html',
  styleUrl: './acces-refuse.css',
})
export class AccesRefuse {
  private readonly auth = inject(AuthService);
  readonly estConnecte = this.auth.isAuthenticated;

  seDeconnecter(): void {
    this.auth.logout();
  }
}
