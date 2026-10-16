import { Role } from './role';

/**
 * Utilisateur de l'application.
 * Le mot de passe en clair n'est jamais conservé : seul le condensat
 * (`passwordHash`) et le sel (`salt`) qui lui correspondent sont stockés.
 * `actif` porte l'état du compte : un compte désactivé ne peut pas ouvrir de session.
 */
export interface User {
  id: string;
  nomComplet: string;
  email: string;
  role: Role;
  salt: string;
  passwordHash: string;
  dateCreation: string;
  actif: boolean;
}

/** Données nécessaires à la création d'un compte. */
export interface IdentifiantsInscription {
  nomComplet: string;
  email: string;
  motDePasse: string;
}

/** Données nécessaires à la connexion. */
export interface IdentifiantsConnexion {
  email: string;
  motDePasse: string;
}

/** Données pour qu'un administrateur crée un compte (rôle hors `ADMIN`). */
export interface DonneesCreationCompte {
  nomComplet: string;
  email: string;
  role: Role;
  motDePasse: string;
}

/** Session persistée pour un utilisateur connecté. */
export interface Session {
  userId: string;
  expiresAt: number;
  /** Présent pendant une bascule : id du compte administrateur d'origine. */
  compteOrigineId?: string;
}
