import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LONGUEUR_MIN_MOT_DE_PASSE } from '../../../core/services/auth.service';

@Component({
  selector: 'app-inscription',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './inscription.html',
  styleUrls: ['./../auth.css', './inscription.css'],
})
export class Inscription {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly longueurMin = LONGUEUR_MIN_MOT_DE_PASSE;
  readonly messageErreur = signal<string | null>(null);
  readonly enCours = signal(false);
  readonly formulaire = this.fb.nonNullable.group({
    nomComplet: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', [Validators.required, Validators.minLength(LONGUEUR_MIN_MOT_DE_PASSE)]],
  });

  async valider(): Promise<void> {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.enCours.set(true);
    this.messageErreur.set(null);

    const resultat = await this.auth.register(this.formulaire.getRawValue());

    this.enCours.set(false);
    if (!resultat.succes) {
      this.messageErreur.set(resultat.message);
      return;
    }
    await this.router.navigateByUrl('/espace');
  }
}
