import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ROLES, Role, libelleRole } from '../../../core/models/role';
import { User } from '../../../core/models/user';
import { AuthService, LONGUEUR_MIN_MOT_DE_PASSE } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

/** Espace d'administration : gestion complète des comptes de la tontine. */
@Component({
  selector: 'app-administration',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './administration.html',
  styleUrl: './administration.css',
})
export class Administration {
  private readonly auth = inject(AuthService);
  private readonly users = inject(UserService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly longueurMin = LONGUEUR_MIN_MOT_DE_PASSE;
  readonly libelleRole = libelleRole;
  readonly roles = ROLES;
  readonly rolesCreation: readonly Role[] = ['TRESORIER', 'MEMBRE'];

  readonly moi = this.auth.currentUser;
  readonly comptes = signal<User[]>(this.users.lister());
  readonly messageErreur = signal<string | null>(null);
  readonly messageSucces = signal<string | null>(null);
  readonly enCours = signal(false);
  readonly motDePasseVisible = signal(false);

  readonly compteEnEdition = signal<string | null>(null);
  readonly compteAReinitialiser = signal<string | null>(null);

  readonly formulaireCreation = this.fb.nonNullable.group({
    nomComplet: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    role: ['MEMBRE' as Role, [Validators.required]],
    motDePasse: ['', [Validators.required, Validators.minLength(LONGUEUR_MIN_MOT_DE_PASSE)]],
  });

  readonly formulaireEdition = this.fb.nonNullable.group({
    nomComplet: ['', [Validators.required]],
    role: ['MEMBRE' as Role, [Validators.required]],
  });

  readonly formulaireReinitialisation = this.fb.nonNullable.group({
    motDePasse: ['', [Validators.required, Validators.minLength(LONGUEUR_MIN_MOT_DE_PASSE)]],
  });

  estMoi(compte: User): boolean {
    return compte.id === this.moi()?.id;
  }

  basculerVisibiliteMotDePasse(): void {
    this.motDePasseVisible.update((visible) => !visible);
  }

  async creerCompte(): Promise<void> {
    if (this.formulaireCreation.invalid) {
      this.formulaireCreation.markAllAsTouched();
      return;
    }
    this.effacerMessages();
    this.enCours.set(true);
    const resultat = await this.auth.creerCompte(this.formulaireCreation.getRawValue());
    this.enCours.set(false);
    if (!resultat.succes) {
      this.messageErreur.set(resultat.message);
      return;
    }
    this.formulaireCreation.reset({ nomComplet: '', email: '', role: 'MEMBRE', motDePasse: '' });
    this.messageSucces.set('Le compte a été créé.');
    this.rafraichirComptes();
  }

  commencerEdition(compte: User): void {
    this.effacerMessages();
    this.compteAReinitialiser.set(null);
    this.compteEnEdition.set(compte.id);
    this.formulaireEdition.setValue({ nomComplet: compte.nomComplet, role: compte.role });
    if (this.estMoi(compte)) {
      this.formulaireEdition.controls.role.disable();
    } else {
      this.formulaireEdition.controls.role.enable();
    }
  }

  annulerEdition(): void {
    this.compteEnEdition.set(null);
  }

  enregistrerEdition(id: string): void {
    if (this.formulaireEdition.invalid) {
      this.formulaireEdition.markAllAsTouched();
      return;
    }
    const resultat = this.auth.modifierCompte(id, this.formulaireEdition.getRawValue());
    if (!resultat.succes) {
      this.messageErreur.set(resultat.message);
      return;
    }
    this.compteEnEdition.set(null);
    this.messageSucces.set('Le compte a été modifié.');
    this.rafraichirComptes();
  }

  changerEtat(compte: User): void {
    this.effacerMessages();
    const resultat = compte.actif
      ? this.auth.desactiverCompte(compte.id)
      : this.auth.activerCompte(compte.id);
    if (!resultat.succes) {
      this.messageErreur.set(resultat.message);
      return;
    }
    this.messageSucces.set(
      compte.actif ? 'Le compte a été désactivé.' : 'Le compte a été réactivé.',
    );
    this.rafraichirComptes();
  }

  commencerReinitialisation(id: string): void {
    this.effacerMessages();
    this.compteEnEdition.set(null);
    this.compteAReinitialiser.set(id);
    this.formulaireReinitialisation.reset({ motDePasse: '' });
  }

  annulerReinitialisation(): void {
    this.compteAReinitialiser.set(null);
  }

  async reinitialiserMotDePasse(id: string): Promise<void> {
    if (this.formulaireReinitialisation.invalid) {
      this.formulaireReinitialisation.markAllAsTouched();
      return;
    }
    this.effacerMessages();
    this.enCours.set(true);
    const resultat = await this.auth.reinitialiserMotDePasse(
      id,
      this.formulaireReinitialisation.getRawValue().motDePasse,
    );
    this.enCours.set(false);
    if (!resultat.succes) {
      this.messageErreur.set(resultat.message);
      return;
    }
    this.compteAReinitialiser.set(null);
    this.messageSucces.set('Le mot de passe du compte a été réinitialisé.');
  }

  async seConnecterEnTantQue(compte: User): Promise<void> {
    this.effacerMessages();
    const resultat = this.auth.seConnecterEnTantQue(compte.id);
    if (!resultat.succes) {
      this.messageErreur.set(resultat.message);
      return;
    }
    await this.router.navigateByUrl('/espace');
  }

  private rafraichirComptes(): void {
    this.comptes.set(this.users.lister());
  }

  private effacerMessages(): void {
    this.messageErreur.set(null);
    this.messageSucces.set(null);
  }
}

