import { Injectable, computed, inject, signal } from '@angular/core';
import { Role } from '../models/role';
import { IdentifiantsConnexion, IdentifiantsInscription, Session, User } from '../models/user';
import { PasswordHasherService } from './password-hasher.service';
import { StorageService } from './storage.service';
import { UserService } from './user.service';

/** Résultat d'une opération d'authentification. */
export type ResultatAuth = { succes: true } | { succes: false; message: string };

/** Durée de validité d'une session : 12 heures. */
export const DUREE_SESSION_MS = 12 * 60 * 60 * 1000;

/** Longueur minimale d'un mot de passe. */
export const LONGUEUR_MIN_MOT_DE_PASSE = 8;

const MOTIF_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_IDENTIFIANTS_INVALIDES = 'Adresse e-mail ou mot de passe incorrect.';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = inject(UserService);
  private readonly hasher = inject(PasswordHasherService);
  private readonly storage = inject(StorageService);
  private readonly cleSession = 'session';

  private readonly utilisateur = signal<User | null>(null);
  readonly currentUser = this.utilisateur.asReadonly();
  readonly isAuthenticated = computed(() => this.utilisateur() !== null);
  readonly role = computed<Role | null>(() => this.utilisateur()?.role ?? null);

  constructor() {
    this.restaurerSession();
  }

  async register(identifiants: IdentifiantsInscription): Promise<ResultatAuth> {
    const nomComplet = identifiants.nomComplet.trim();
    const email = identifiants.email.trim();

    if (nomComplet.length === 0) {
      return { succes: false, message: 'Le nom complet est obligatoire.' };
    }
    if (!MOTIF_EMAIL.test(email)) {
      return { succes: false, message: "L'adresse e-mail n'est pas valide." };
    }
    if (identifiants.motDePasse.length < LONGUEUR_MIN_MOT_DE_PASSE) {
      return {
        succes: false,
        message: `Le mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`,
      };
    }
    if (this.users.trouverParEmail(email)) {
      return { succes: false, message: 'Cette adresse e-mail est déjà utilisée.' };
    }

    const { hash, sel } = await this.hasher.hacher(identifiants.motDePasse);
    const role: Role = this.users.nombre() === 0 ? 'ADMIN' : 'MEMBRE';
    const utilisateur: User = {
      id: this.genererId(),
      nomComplet,
      email,
      role,
      salt: sel,
      passwordHash: hash,
      dateCreation: new Date().toISOString(),
    };

    this.users.ajouter(utilisateur);
    this.ouvrirSession(utilisateur);
    return { succes: true };
  }

  async login(identifiants: IdentifiantsConnexion): Promise<ResultatAuth> {
    const utilisateur = this.users.trouverParEmail(identifiants.email);
    if (!utilisateur) {
      return { succes: false, message: MESSAGE_IDENTIFIANTS_INVALIDES };
    }

    const motDePasseValide = await this.hasher.verifier(
      identifiants.motDePasse,
      utilisateur.salt,
      utilisateur.passwordHash,
    );
    if (!motDePasseValide) {
      return { succes: false, message: MESSAGE_IDENTIFIANTS_INVALIDES };
    }

    this.ouvrirSession(utilisateur);
    return { succes: true };
  }

  logout(): void {
    this.storage.remove(this.cleSession);
    this.utilisateur.set(null);
  }

  private ouvrirSession(utilisateur: User): void {
    const session: Session = {
      userId: utilisateur.id,
      expiresAt: Date.now() + DUREE_SESSION_MS,
    };
    this.storage.write(this.cleSession, session);
    this.utilisateur.set(utilisateur);
  }

  private restaurerSession(): void {
    const session = this.storage.read<Session>(this.cleSession);
    if (!session) {
      return;
    }
    if (session.expiresAt <= Date.now()) {
      this.storage.remove(this.cleSession);
      return;
    }
    const utilisateur = this.users.trouverParId(session.userId);
    if (!utilisateur) {
      this.storage.remove(this.cleSession);
      return;
    }
    this.utilisateur.set(utilisateur);
  }

  private genererId(): string {
    if (typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    const octets = new Uint8Array(16);
    crypto.getRandomValues(octets);
    return Array.from(octets, (octet) => octet.toString(16).padStart(2, '0')).join('');
  }
}
