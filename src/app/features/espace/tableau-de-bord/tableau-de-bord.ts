import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { libelleRole, ROLES as ROLES_ROLES } from '../../../core/models/role';
import { AuthService } from '../../../core/services/auth.service';

/** Écran d'accueil de l'espace personnel, différencié par rôle. */
@Component({
  selector: 'app-tableau-de-bord',
  imports: [RouterLink],
  templateUrl: './tableau-de-bord.html',
  styleUrl: './tableau-de-bord.css',
})
export class TableauDeBord {
  private readonly auth = inject(AuthService);

  readonly utilisateur = this.auth.currentUser;
  readonly libelleRole = libelleRole;
  /** Signal réactif du rôle courant (ne pas appeler avant utilisation). */
  readonly roleCourant = this.auth.role;

  /** Modules affichés différenciés selon le rôle. */
  readonly modules = this.roleCourant() === 'ADMIN'
    ? [
        {
          titre: 'Administration',
          description: 'Gérer les comptes, les rôles et l\'état d\'activation.',
          actions: [
            { label: 'Les comptes', cible: '/espace/administration' },
            { label: 'Paramètres', cible: '/espace/administration/parametres' },
          ],
          etat: 'Activé',
        },
        {
          titre: 'Configuration',
          description: 'Définir la cotisation et les règles de la tontine.',
          actions: [
            { label: 'Paramètres', cible: '/espace/administration/parametres' },
          ],
          etat: 'Activé',
        },
      ]
    : this.roleCourant() === 'TRESORIER'
      ? [
          {
            titre: 'Trésorerie',
            description: 'Suivre les cotisations en recette et les versements en paiement.',
            actions: [
              { label: 'Trésorerie', cible: '/espace/tresorerie' },
            ],
            etat: 'Activé',
          },
          {
            titre: 'Cotisations',
            description: 'Enregistrer et suivre les cotisations des membres.',
            actions: [
              { label: 'Cotisations', cible: '/espace/tresorerie' },
            ],
            etat: 'Activé',
          },
        ]
      : [
          {
            titre: 'Mon espace',
            description: 'Consulter vos informations et suivre vos participations.',
            actions: [
              { label: 'Mon espace', cible: '/espace/mon-espace' },
            ],
            etat: 'Activé',
          },
          {
            titre: 'Sécurité',
            description: 'Changer votre mot de passe.',
            actions: [
              { label: 'Changer de mot de passe', cible: '/espace/changer-mot-de-passe' },
            ],
            etat: 'Activé',
          },
        ];

  readonly estAdministrateur = computed(() => this.roleCourant() === 'ADMIN');
  readonly estTresorier = computed(() => this.roleCourant() === 'TRESORIER');
}

