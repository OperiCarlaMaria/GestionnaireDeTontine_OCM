import { Component, inject } from '@angular/core';
import { libelleRole } from '../../../core/models/role';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-tableau-de-bord',
  templateUrl: './tableau-de-bord.html',
  styleUrl: './tableau-de-bord.css',
})
export class TableauDeBord {
  private readonly auth = inject(AuthService);

  readonly utilisateur = this.auth.currentUser;
  readonly libelleRole = libelleRole;

  readonly modules = [
    { titre: 'Membres', description: 'Gérer la liste des membres de la tontine.' },
    { titre: 'Cotisations', description: 'Enregistrer et suivre les cotisations.' },
    { titre: 'Tours de bénéficiaires', description: 'Organiser les tours de passage.' },
    { titre: 'Historique des versements', description: 'Consulter les versements effectués.' },
  ];
}
