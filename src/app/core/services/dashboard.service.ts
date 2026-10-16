import { Injectable, inject, computed } from '@angular/core';
import { User } from '../models/user';
import {
  Cotisation,
  DonneesMensuelles,
  StatistiquesDashboard,
  Versement,
} from '../models/dashboard.model';
import { ConfigurationService } from './configuration.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';

/**
 * Service de calcul des statistiques pour le tableau de bord.
 *
 * ⚠️ NOTE TEMPORAIRE : ce service calcule les statistiques à partir
 * des données disponibles (utilisateurs, configuration). À terme,
 * les cotisations et versements seront des entités complètes
 * avec leur propre service de persistance.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly userService = inject(UserService);
  private readonly configService = inject(ConfigurationService);
  private readonly auth = inject(AuthService);

  /**
   * Calcule l'ensemble des statistiques du tableau de bord.
   */
  calculerStatistiques(): StatistiquesDashboard {
    const users = this.userService.lister();
    const config = this.configService.configuration();
    const membresActifs = users.filter((u) => u.role !== 'ADMIN' && u.actif).length;
    const membresInactifs = users.filter((u) => u.role !== 'ADMIN' && !u.actif).length;
    const membresTotal = membresActifs + membresInactifs;

    // ⚠ Données temporaires : le système n'a pas encore de collection
    // cotisations/versements. Retourne des valeurs par défaut.
    const cotisationsCollectees = 0;
    const cotisationsEnAttente = 0;
    const cotisationsEnRetard = 0;
    const nombreVersements = 0;
    const montantVersementsEffectues = 0;

    const donneesMensuelles: DonneesMensuelles[] = this.generateurDonneesMensuelles(6);

    const soldeDispo = cotisationsCollectees - montantVersementsEffectues;

    return {
      membresTotal,
      membresActifs,
      membresInactifs,
      cotisationsCollectees,
      cotisationsEnAttente,
      cotisationsEnRetard,
      versementsEffectues: nombreVersements,
      montantVersementsEffectues,
      donneesMensuelles,
      soldeDispo,
    };
  }

  /**
   * Génère des données mensuelles simulées pour le graphique.
   * À terme, remplacé par des données réelles depuis une collection cotisations.
   */
  private generateurDonneesMensuelles(nbMois: number): DonneesMensuelles[] {
    const resultats: DonneesMensuelles[] = [];
    const config = this.configService.configuration();
    const montant = config.montantCotisation;

    // ⚠ Données simulées pour la démo
    for (let i = nbMois - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const mois = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      const cotisations = Math.round((montant + (Math.random() - 0.5) * montant * 0.4) * 100) / 100;
      const versements = Math.round((Math.random() * montant * 0.6) * 100) / 100;
      resultats.push({
        mois,
        cotisationsCollectees: Math.max(0, cotisations),
        versementsEffectues: Math.max(0, versements),
      });
    }
    return resultats;
  }
}
