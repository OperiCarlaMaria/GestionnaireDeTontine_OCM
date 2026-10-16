import { Injectable, inject } from '@angular/core';
import { User } from '../models/user';
import { StorageService } from './storage.service';

/** Opérations sur la collection des utilisateurs. */
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly storage = inject(StorageService);
  private readonly cle = 'utilisateurs';

  lister(): User[] {
    return this.storage.read<User[]>(this.cle) ?? [];
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

  private normaliser(email: string): string {
    return email.trim().toLowerCase();
  }
}
