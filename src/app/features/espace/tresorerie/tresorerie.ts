import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StatistiquesDashboard } from '../../../core/models/dashboard.model';
import { ConfigurationService } from '../../../core/services/configuration.service';
import { AuthService } from '../../../core/services/auth.service';
import { libelleRole } from '../../../core/models/role';

/** Écran de tableau de bord du trésorier. */
@Component({
  selector: 'app-tableau-de-bord-tresorier',
  imports: [RouterLink, FormsModule, DecimalPipe],
  templateUrl: './tableau-de-bord-tresorer.html',
  styleUrl: './tableau-de-bord-tresorer.css',
})
export class TableauDeBordTresorer {
  private readonly dashboardService = inject(DashboardService);
  private readonly configService = inject(ConfigurationService);
  private readonly auth = inject(AuthService);

  readonly statistiques = computed(() => this.dashboardService.calculerStatistiques());
  readonly configuration = this.configService.configuration;
  readonly libelleRole = libelleRole;
  readonly roleCourant = this.auth.role;

  readonly estAdministrateur = computed(() => this.roleCourant() === 'ADMIN');
  readonly estTresorier = computed(() => this.roleCourant() === 'TRESORIER');

  /** Accéder à la liste des alertes. */
  voirAlertes(): void {
    // TODO: Navigation vers la liste des alertes
  }

  /** Ajouter une note manuellement. */
  noterManuel(): void {
    // TODO: Formulaire d'ajout manuel
  }
}

