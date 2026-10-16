import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StatistiquesDashboard } from '../../../core/models/dashboard.model';
import { ConfigurationService } from '../../../core/services/configuration.service';
import { AuthService } from '../../../core/services/auth.service';
import { libelleRole } from '../../../core/models/role';

/** Écran de tableau de bord pour l'administrateur. */
@Component({
  selector: 'app-dashboard-admin',
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './tableau-de-bord-admin.html',
  styleUrl: './tableau-de-bord-admin.css',
})
export class TableauDeBordAdmin {
  private readonly dashboardService = inject(DashboardService);
  private readonly configService = inject(ConfigurationService);
  private readonly auth = inject(AuthService);

  readonly statistiques = computed(() => this.dashboardService.calculerStatistiques());
  readonly configuration = this.configService.configuration;
  readonly libelleRole = libelleRole;

  readonly roleCourant = this.auth.role;

  /** Rôle courant de l'utilisateur connecté. */
  readonly authRole = this.roleCourant;

  /** Vrai si l'utilisateur est administrateur. */
  readonly estAdministrateur = computed(() => this.roleCourant() === 'ADMIN');

  /** Sauvegarder la configuration. */
  sauvegarderConfiguration(): void {
    const config = this.configuration();
    const resultat = this.configService.modifier(config);
    if (resultat.succes) {
      // Succès déjà signalé par le service
    }
  }

  /** Exporter les statistiques au format CSV. */
  exporterCSV(): void {
    // TODO: générer un fichier CSV avec les statistiques
  }
}
