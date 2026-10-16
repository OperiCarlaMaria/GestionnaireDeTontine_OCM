import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService, LONGUEUR_MIN_MOT_DE_PASSE } from '../../../core/services/auth.service';

/** Écran « changer mon mot de passe » : accessible à tous les rôles authentifiés. */
@Component({
  selector: 'app-changer-mot-de-passe',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './changer-mot-de-passe.html',
  styleUrl: './changer-mot-de-passe.css',
})
export class ChangerMotDePasse {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly longueurMin = LONGUEUR_MIN_MOT_DE_PASSE;
  readonly messageErreur = signal<string | null>(null);
  readonly messageSucces = signal<string | null>(null);
  readonly enCours = signal(false);
  readonly actuelVisible = signal(false);
  readonly nouveauVisible = signal(false);

  readonly formulaire = this.fb.nonNullable.group({
    motDePasseActuel: ['', [Validators.required]],
    nouveauMotDePasse: ['', [Validators.required, Validators.minLength(LONGUEUR_MIN_MOT_DE_PASSE)]],
  });

  basculerActuel(): void {
    this.actuelVisible.update((visible) => !visible);
  }

  basculerNouveau(): void {
    this.nouveauVisible.update((visible) => !visible);
  }

  async valider(): Promise<void> {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.messageErreur.set(null);
    this.messageSucces.set(null);
    this.enCours.set(true);

    const { motDePasseActuel, nouveauMotDePasse } = this.formulaire.getRawValue();
    const resultat = await this.auth.changerMotDePasse(motDePasseActuel, nouveauMotDePasse);

    this.enCours.set(false);
    if (!resultat.succes) {
      this.messageErreur.set(resultat.message);
      return;
    }
    this.formulaire.reset({ motDePasseActuel: '', nouveauMotDePasse: '' });
    this.messageSucces.set('Votre mot de passe a été modifié.');
  }
}
