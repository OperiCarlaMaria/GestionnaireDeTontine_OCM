import { Injectable, inject } from '@angular/core';
import { User } from '../models/user';
import { StorageService } from './storage.service';

/** Opérations sur la collection des utilisateurs. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly storage = inject(StorageService);
  private readonly cle = 'utilisateurs';

  lister(): User[] {
    const comptes = this.storage.read<User[]>(this.cle) ?? [];
    // Migration douce : les comptes créés avant l'ajout du champ restent actifs.
    return comptes.map((compte) => ({ ...compte, actif: compte.actif !== false }));
  }

  nombre(): number {
    return this.lister().length;
  }

  trouverParEmail(email: string): User | undefined {
    const cible = this.normaliser(email);
    return this.lister().find((utilisateur) => this.normaliser(utilisateur.email) === cible);
  }

  trouverParId(id: string): User | undefined {
    return this.lister().find((utilisateur) => utilisateur.id === id);
  }

  ajouter(utilisateur: User): void {
    const utilisateurs = this.lister();
    utilisateurs.push(utilisateur);
    this.storage.write(this.cle, utilisateurs);
  }

  /** Remplace le compte portant l'id donné, ou retourne false s'il n'existe pas. */
  mettreAJour(utilisateur: User): boolean {
    const utilisateurs = this.lister();
    const index = utilisateurs.findIndex((compte) => compte.id === utilisateur.id);
    if (index === -1) {
      return false;
    }
    utilisateurs[index] = utilisateur;
    this.storage.write(this.cle, utilisateurs);
    return true;
  }

  private normaliser(email: string): string {
    return email.trim().toLowerCase();
  }
}
