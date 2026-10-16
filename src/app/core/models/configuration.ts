/** Fréquence des cotisations de la tontine. */
export type FrequenceCotisation = 'MENSUELLE' | 'HEBDOMADAIRE';

/** Mode de détermination de l'ordre des bénéficiaires. */
export type OrdreTours = 'ALEATOIRE' | 'MANUEL';

/** Règles de base de la tontine, partagées par tous les modules métier. */
export interface ConfigurationTontine {
  nom: string;
  montantCotisation: number;
  frequence: FrequenceCotisation;
  /** 1..31 (jour du mois) en mensuel, 1..7 (jour de la semaine, lundi = 1) en hebdomadaire. */
  jourEcheance: number;
  ordreTours: OrdreTours;
}

/** Configuration proposée au premier lancement, avant tout réglage. */
export const CONFIGURATION_PAR_DEFAUT: ConfigurationTontine = {
  nom: 'Ma tontine',
  montantCotisation: 1000,
  frequence: 'MENSUELLE',
  jourEcheance: 1,
  ordreTours: 'ALEATOIRE',
};

/** Bornes du jour d'échéance selon la fréquence choisie. */
export function bornesJourEcheance(frequence: FrequenceCotisation): { min: number; max: number } {
  return frequence === 'HEBDOMADAIRE' ? { min: 1, max: 7 } : { min: 1, max: 31 };
}
