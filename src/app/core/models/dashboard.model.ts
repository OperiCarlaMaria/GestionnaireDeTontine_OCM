/** Statistiques mensuelles pour les graphiques (6 derniers mois). */
export interface DonneesMensuelles {
  /** Nom du mois (ex: 'Janvier 2026'). */
  mois: string;
  /** Cotisations collectées en fcfa. */
  cotisationsCollectees: number;
  /** Versements effectués en fcfa. */
  versementsEffectues: number;
}

/** Statistiques globales du tableau de bord. */
export interface StatistiquesDashboard {
  /** Nombre total de membres. */
  membresTotal: number;
  /** Nombre de membres actifs. */
  membresActifs: number;
  /** Nombre de membres inactifs. */
  membresInactifs: number;
  /** Montant total des cotisations collectées en fcfa. */
  cotisationsCollectees: number;
  /** Nombre de cotisations en attente. */
  cotisationsEnAttente: number;
  /** Nombre de cotisations en retard. */
  cotisationsEnRetard: number;
  /** Nombre de versements effectués. */
  versementsEffectues: number;
  /** Montant total des versements effectués en fcfa. */
  montantVersementsEffectues: number;
  /** Données mensuelles pour les graphiques. */
  donneesMensuelles: DonneesMensuelles[];
  /** Solde disponible de la tontine en fcfa. */
  soldeDispo: number;
}

/** Cotisation d'un membre. */
export interface Cotisation {
  id: string;
  membreId: string;
  membreNom: string;
  membreRole: string;
  montant: number;
  etat: 'COLLECTEE' | 'EN_ATTENTE' | 'EN_RETARD';
  dateDernierRappel?: string;
}

/** Versement d'un membre. */
export interface Versement {
  id: string;
  membreId: string;
  membreNom: string;
  montant: number;
  etat: 'EFFECTUE' | 'EN_ATTENTE';
  dateVersement?: string;
}
