import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-connexion',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './connexion.html',
  styleUrls: ['./../auth.css', './connexion.css'],
})
export class Connexion {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly messageErreur = signal<string | null>(null);
  readonly enCours = signal(false);
  readonly motDePasseVisible = signal(false);
  readonly formulaire = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required]],
  });

  basculerVisibiliteMotDePasse(): void {
    this.motDePasseVisible.update((visible) => !visible);
  }

  async valider(): Promise<void> {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.enCours.set(true);
    this.messageErreur.set(null);

    const { email, motDePasse } = this.formulaire.getRawValue();
    const resultat = await this.auth.login({ email, motDePasse });

    this.enCours.set(false);
    if (!resultat.succes) {
      this.messageErreur.set(resultat.message);
      return;
    }
    await this.router.navigateByUrl(this.cheminRedirection());
  }

  private cheminRedirection(): string {
    const redirection = this.route.snapshot.queryParamMap.get('redirection');
    if (redirection && redirection.startsWith('/') && !redirection.startsWith('//')) {
      return redirection;
    }
    return '/espace';
  }
}
