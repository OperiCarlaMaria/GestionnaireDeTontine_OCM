import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  FrequenceCotisation,
  OrdreTours,
  bornesJourEcheance,
} from '../../../../core/models/configuration';
import { ConfigurationService } from '../../../../core/services/configuration.service';

/** Écran des paramètres de la tontine — réservé à l'administrateur. */
@Component({
  selector: 'app-parametres',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './parametres.html',
  styleUrl: './parametres.css',
})
export class Parametres {
  private readonly configurations = inject(ConfigurationService) as ConfigurationService;
  private readonly fb = inject(FormBuilder);

  readonly frequences: readonly FrequenceCotisation[] = ['MENSUELLE', 'HEBDOMADAIRE'];
  readonly ordres: readonly OrdreTours[] = ['ALEATOIRE', 'MANUEL'];
  readonly messageErreur = signal<string | null>(null);
  readonly messageSucces = signal<string | null>(null);

  private readonly courante = this.configurations.configuration();
  readonly formulaire = this.fb.nonNullable.group({
    nom: [this.courante.nom, [Validators.required]],
    montantCotisation: [this.courante.montantCotisation, [Validators.required, Validators.min(1)]],
    frequence: [this.courante.frequence, [Validators.required]],
    jourEcheance: [this.courante.jourEcheance, [Validators.required]],
    ordreTours: [this.courante.ordreTours, [Validators.required]],
  });

  get bornes(): { min: number; max: number } {
    return bornesJourEcheance(this.formulaire.controls.frequence.value);
  }

  get frequenceCourante(): FrequenceCotisation {
    return this.formulaire.controls.frequence.value;
  }

  libelleFrequence(frequence: FrequenceCotisation): string {
    return frequence === 'MENSUELLE' ? 'Mensuelle' : 'Hebdomadaire';
  }

  libelleOrdre(ordre: OrdreTours): string {
    return ordre === 'ALEATOIRE' ? 'Tirage au sort' : 'Ordre manuel';
  }

  /** Ajuste les bornes du jour d'échéance quand la fréquence change. */
  changerFrequence(): void {
    const bornes = this.bornes;
    const controle = this.formulaire.controls.jourEcheance;
    controle.setValidators([
      Validators.required,
      Validators.min(bornes.min),
      Validators.max(bornes.max),
    ]);
    controle.updateValueAndValidity();
  }

  valider(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }
    this.messageErreur.set(null);
    this.messageSucces.set(null);

    const resultat = this.configurations.modifier(this.formulaire.getRawValue());
    if (!resultat.succes) {
      this.messageErreur.set(resultat.message);
      return;
    }
    this.messageSucces.set('La configuration a été enregistrée.');
  }
}
