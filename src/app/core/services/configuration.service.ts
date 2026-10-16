import { Injectable, inject, signal } from '@angular/core';
import {
  CONFIGURATION_PAR_DEFAUT,
  ConfigurationTontine,
  FrequenceCotisation,
  OrdreTours,
  bornesJourEcheance,
} from '../models/configuration';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

/** Résultat d'une opération sur la configuration. */
export type ResultatConfiguration = { succes: true } | { succes: false; message: string };

const FREQUENCES: readonly FrequenceCotisation[] = ['MENSUELLE', 'HEBDOMADAIRE'];
const ORDRES: readonly OrdreTours[] = ['ALEATOIRE', 'MANUEL'];
const MESSAGE_NON_ADMIN = 'Seul un administrateur peut modifier la configuration.';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {
  private readonly storage = inject(StorageService);
  private readonly auth = inject(AuthService);
  private readonly cle = 'configuration';

  private readonly etat = signal<ConfigurationTontine>(this.lire());
  /** Configuration courante, réactive pour l'interface (en-tête, écran de paramètres). */
  readonly configuration = this.etat.asReadonly();

  /** Valeurs enregistrées, avec repli sur la configuration par défaut. */
  lire(): ConfigurationTontine {
    const enregistree = this.storage.read<ConfigurationTontine>(this.cle);
    return enregistree ? { ...CONFIGURATION_PAR_DEFAUT, ...enregistree } : { ...CONFIGURATION_PAR_DEFAUT };
  }

  /** Modifie la configuration — administrateur uniquement, valeurs validées. */
  modifier(donnees: ConfigurationTontine): ResultatConfiguration {
    if (this.auth.role() !== 'ADMIN') {
      return { succes: false, message: MESSAGE_NON_ADMIN };
    }

    const nom = donnees.nom.trim();
    if (nom.length === 0) {
      return { succes: false, message: 'Le nom de la tontine est obligatoire.' };
    }
    if (!Number.isFinite(donnees.montantCotisation) || donnees.montantCotisation <= 0) {
      return {
        succes: false,
        message: 'Le montant de la cotisation doit être supérieur à 0.',
      };
    }
    if (!FREQUENCES.includes(donnees.frequence)) {
      return { succes: false, message: 'La fréquence sélectionnée n’est pas valide.' };
    }
    if (!ORDRES.includes(donnees.ordreTours)) {
      return { succes: false, message: 'Le mode d’ordre des tours n’est pas valide.' };
    }

    const bornes = bornesJourEcheance(donnees.frequence);
    if (
      !Number.isInteger(donnees.jourEcheance) ||
      donnees.jourEcheance < bornes.min ||
      donnees.jourEcheance > bornes.max
    ) {
      return {
        succes: false,
        message: `Le jour d’échéance doit être compris entre ${bornes.min} et ${bornes.max}.`,
      };
    }

    const configuration: ConfigurationTontine = {
      nom,
      montantCotisation: donnees.montantCotisation,
      frequence: donnees.frequence,
      jourEcheance: donnees.jourEcheance,
      ordreTours: donnees.ordreTours,
    };
    this.storage.write(this.cle, configuration);
    this.etat.set(configuration);
    return { succes: true };
  }
}
