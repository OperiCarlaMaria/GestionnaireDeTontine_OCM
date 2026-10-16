import { Role } from './role';

/**
 * Utilisateur de l'application.
 * Le mot de passe en clair n'est jamais conservé : seul le condensat
 * (`passwordHash`) et le sel (`salt`) qui lui correspondent sont stockés.
 */
export interface User {
  id: string;
  nomComplet: string;
  email: string;
  role: Role;
  salt: string;
  passwordHash: string;
  dateCreation: string;
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

/** Session persistée pour un utilisateur connecté. */
export interface Session {
  userId: string;
  expiresAt: number;
}
