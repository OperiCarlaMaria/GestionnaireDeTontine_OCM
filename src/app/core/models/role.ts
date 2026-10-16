/** Rôles disponibles dans l'application de tontine. */
export type Role = 'ADMIN' | 'TRESORIER' | 'MEMBRE';

/** Liste des rôles, dans l'ordre d'affichage. */
export const ROLES: readonly Role[] = ['ADMIN', 'TRESORIER', 'MEMBRE'];

/** Libellé lisible en français pour un rôle. */
export function libelleRole(role: Role): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrateur';
    case 'TRESORIER':
      return 'Trésorier';
    case 'MEMBRE':
      return 'Membre';
  }
}
