import { Injectable, computed, inject, signal } from '@angular/core';
import { Role } from '../models/role';
import {
  DonneesCreationCompte,
  IdentifiantsConnexion,
  IdentifiantsInscription,
  Session,
  User,
} from '../models/user';
import { PasswordHasherService } from './password-hasher.service';
import { StorageService } from './storage.service';
import { UserService } from './user.service';

/** Résultat d'une opération d'authentification ou de gestion des comptes. */
export type ResultatAuth = { succes: true } | { succes: false; message: string };

/** Durée de validité d'une session : 12 heures. */
export const DUREE_SESSION_MS = 12 * 60 * 60 * 1000;

/** Longueur minimale d'un mot de passe. */
export const LONGUEUR_MIN_MOT_DE_PASSE = 8;

const MOTIF_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_IDENTIFIANTS_INVALIDES = 'Adresse e-mail ou mot de passe incorrect.';
const MESSAGE_INSCRIPTION_FERMEE = "L'inscription publique est fermée.";
const MESSAGE_COMPTE_DESACTIVE = 'Ce compte est désactivé. Contactez un administrateur.';
const MESSAGE_EMAIL_UTILISE = 'Cette adresse e-mail est déjà utilisée.';
const MESSAGE_NOM_OBLIGATOIRE = 'Le nom complet est obligatoire.';
const MESSAGE_EMAIL_INVALIDE = "L'adresse e-mail n'est pas valide.";
const messageMotDePasseCourt = (): string =>
  `Le mot de passe doit contenir au moins ${LONGUEUR_MIN_MOT_DE_PASSE} caractères.`;
const MESSAGE_NON_ADMIN = 'Seul un administrateur peut effectuer cette opération.';
const MESSAGE_COMPTE_INTROUVABLE = 'Compte introuvable.';
const MESSAGE_ROLE_INVALIDE = 'Le rôle sélectionné n’est pas valide.';
const MESSAGE_TRESORIER_EXISTANT = 'Un trésorier existe déjà : modifiez le compte existant.';
const MESSAGE_PROPRE_ROLE = 'Impossible de modifier le rôle de votre propre compte.';
const MESSAGE_PROPRE_COMPTE = 'Impossible de désactiver votre propre compte.';
const MESSAGE_MDP_ACTUEL_INCORRECT = 'Le mot de passe actuel est incorrect.';
const MESSAGE_AUCUNE_ORIGINE = "Aucun compte d'origine à restaurer.";
const MESSAGE_ORIGINE_PERDUE =
  "Impossible de revenir au compte d'origine : vous avez été déconnecté.";
const MESSAGE_DEJA_EN_BASCULE = 'Vous consultez déjà un autre compte.';
const MESSAGE_CIBLE_INACTIVE = 'Impossible d’ouvrir la session d’un compte désactivé.';
const MESSAGE_NON_CONNECTE = 'Vous n’êtes pas connecté.';
const MESSAGE_CIBLE_SOI = 'Vous êtes déjà sur ce compte.';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly users = inject(UserService);
  private readonly hasher = inject(PasswordHasherService);
  private readonly storage = inject(StorageService);
  private readonly cleSession = 'session';

  private readonly utilisateur = signal<User | null>(null);
  private readonly origine = signal<string | null>(null);
  readonly currentUser = this.utilisateur.asReadonly();
  readonly isAuthenticated = computed(() => this.utilisateur() !== null);
  readonly role = computed<Role | null>(() => this.utilisateur()?.role ?? null);
  /** Vrai pendant une bascule « se connecter en tant que ». */
  readonly enBascule = computed(() => this.origine() !== null);

  constructor() {
    this.restaurerSession();
  }

  /**
   * Inscription publique : n'est ouverte que pour la création du tout premier
   * compte (rôle `ADMIN`). Dès qu'un compte existe, elle est fermée — les
   * comptes suivants sont créés par un administrateur (`creerCompte`).
   */
  async register(identifiants: IdentifiantsInscription): Promise<ResultatAuth> {
    const nomComplet = identifiants.nomComplet.trim();
    const email = identifiants.email.trim();

    if (nomComplet.length === 0) {
      return { succes: false, message: MESSAGE_NOM_OBLIGATOIRE };
    }
    if (!MOTIF_EMAIL.test(email)) {
      return { succes: false, message: MESSAGE_EMAIL_INVALIDE };
    }
    if (identifiants.motDePasse.length < LONGUEUR_MIN_MOT_DE_PASSE) {
      return { succes: false, message: messageMotDePasseCourt() };
    }
    if (this.users.trouverParEmail(email)) {
      return { succes: false, message: MESSAGE_EMAIL_UTILISE };
    }
    if (this.users.nombre() > 0) {
      return { succes: false, message: MESSAGE_INSCRIPTION_FERMEE };
    }

    const { hash, sel } = await this.hasher.hacher(identifiants.motDePasse);
    const utilisateur: User = {
      id: this.genererId(),
      nomComplet,
      email,
      role: 'ADMIN',
      salt: sel,
      passwordHash: hash,
      dateCreation: new Date().toISOString(),
      actif: true,
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
    if (!utilisateur.actif) {
      return { succes: false, message: MESSAGE_COMPTE_DESACTIVE };
    }

    this.ouvrirSession(utilisateur);
    return { succes: true };
  }

  logout(): void {
    this.storage.remove(this.cleSession);
    this.utilisateur.set(null);
    this.origine.set(null);
  }

  /*
   * Gestion des comptes — opérations réservées aux administrateurs.
   */

  /** Crée un compte `TRESORIER` ou `MEMBRE` (règle du trésorier unique). */
  async creerCompte(donnees: DonneesCreationCompte): Promise<ResultatAuth> {
    if (!this.estAdministrateur()) {
      return { succes: false, message: MESSAGE_NON_ADMIN };
    }
    const nomComplet = donnees.nomComplet.trim();
    const email = donnees.email.trim();

    if (nomComplet.length === 0) {
      return { succes: false, message: MESSAGE_NOM_OBLIGATOIRE };
    }
    if (!MOTIF_EMAIL.test(email)) {
      return { succes: false, message: MESSAGE_EMAIL_INVALIDE };
    }
    if (donnees.role !== 'TRESORIER' && donnees.role !== 'MEMBRE') {
      return { succes: false, message: MESSAGE_ROLE_INVALIDE };
    }
    if (donnees.motDePasse.length < LONGUEUR_MIN_MOT_DE_PASSE) {
      return { succes: false, message: messageMotDePasseCourt() };
    }
    if (this.users.trouverParEmail(email)) {
      return { succes: false, message: MESSAGE_EMAIL_UTILISE };
    }
    if (donnees.role === 'TRESORIER' && this.possedeTresorier()) {
      return { succes: false, message: MESSAGE_TRESORIER_EXISTANT };
    }

    const { hash, sel } = await this.hasher.hacher(donnees.motDePasse);
    this.users.ajouter({
      id: this.genererId(),
      nomComplet,
      email,
      role: donnees.role,
      salt: sel,
      passwordHash: hash,
      dateCreation: new Date().toISOString(),
      actif: true,
    });
    return { succes: true };
  }

  /** Modifie le nom complet et/ou le rôle d'un compte (le rôle propre est protégé). */
  modifierCompte(id: string, donnees: { nomComplet: string; role: Role }): ResultatAuth {
    const acteur = this.utilisateur();
    if (!this.estAdministrateur()) {
      return { succes: false, message: MESSAGE_NON_ADMIN };
    }
    const compte = this.users.trouverParId(id);
    if (!compte) {
      return { succes: false, message: MESSAGE_COMPTE_INTROUVABLE };
    }
    const nomComplet = donnees.nomComplet.trim();
    if (nomComplet.length === 0) {
      return { succes: false, message: MESSAGE_NOM_OBLIGATOIRE };
    }
    if (donnees.role !== 'ADMIN' && donnees.role !== 'TRESORIER' && donnees.role !== 'MEMBRE') {
      return { succes: false, message: MESSAGE_ROLE_INVALIDE };
    }
    if (id === acteur?.id && donnees.role !== compte.role) {
      return { succes: false, message: MESSAGE_PROPRE_ROLE };
    }
    if (donnees.role === 'TRESORIER' && compte.role !== 'TRESORIER' && this.possedeTresorier(id)) {
      return { succes: false, message: MESSAGE_TRESORIER_EXISTANT };
    }

    this.users.mettreAJour({ ...compte, nomComplet, role: donnees.role });
    if (id === acteur?.id) {
      this.utilisateur.set(this.users.trouverParId(id) ?? null);
    }
    return { succes: true };
  }

  /** Désactive un compte autre que le sien : il ne pourra plus ouvrir de session. */
  desactiverCompte(id: string): ResultatAuth {
    return this.definirEtatActif(id, false);
  }

  /** Réactive un compte désactivé. */
  activerCompte(id: string): ResultatAuth {
    return this.definirEtatActif(id, true);
  }

  /** Définit un nouveau mot de passe pour n'importe quel compte (administrateur). */
  async reinitialiserMotDePasse(id: string, nouveauMotDePasse: string): Promise<ResultatAuth> {
    if (!this.estAdministrateur()) {
      return { succes: false, message: MESSAGE_NON_ADMIN };
    }
    const compte = this.users.trouverParId(id);
    if (!compte) {
      return { succes: false, message: MESSAGE_COMPTE_INTROUVABLE };
    }
    if (nouveauMotDePasse.length < LONGUEUR_MIN_MOT_DE_PASSE) {
      return { succes: false, message: messageMotDePasseCourt() };
    }

    const { hash, sel } = await this.hasher.hacher(nouveauMotDePasse);
    this.users.mettreAJour({ ...compte, passwordHash: hash, salt: sel });
    return { succes: true };
  }

  /** Change son propre mot de passe : exige la saisie du mot de passe actuel. */
  async changerMotDePasse(
    motDePasseActuel: string,
    nouveauMotDePasse: string,
  ): Promise<ResultatAuth> {
    const acteur = this.utilisateur();
    if (!acteur) {
      return { succes: false, message: MESSAGE_NON_CONNECTE };
    }
    if (nouveauMotDePasse.length < LONGUEUR_MIN_MOT_DE_PASSE) {
      return { succes: false, message: messageMotDePasseCourt() };
    }

    const actuelValide = await this.hasher.verifier(
      motDePasseActuel,
      acteur.salt,
      acteur.passwordHash,
    );
    if (!actuelValide) {
      return { succes: false, message: MESSAGE_MDP_ACTUEL_INCORRECT };
    }

    const { hash, sel } = await this.hasher.hacher(nouveauMotDePasse);
    const maj = { ...acteur, passwordHash: hash, salt: sel };
    this.users.mettreAJour(maj);
    this.utilisateur.set(maj);
    return { succes: true };
  }

  /**
   * Bascule « se connecter en tant que » : ouvre la session d'un autre compte
   * en conservant le compte administrateur d'origine dans la session.
   */
  seConnecterEnTantQue(id: string): ResultatAuth {
    const acteur = this.utilisateur();
    if (!acteur || acteur.role !== 'ADMIN') {
      return { succes: false, message: MESSAGE_NON_ADMIN };
    }
    if (this.origine() !== null) {
      return { succes: false, message: MESSAGE_DEJA_EN_BASCULE };
    }
    const cible = this.users.trouverParId(id);
    if (!cible) {
      return { succes: false, message: MESSAGE_COMPTE_INTROUVABLE };
    }
    if (id === acteur?.id) {
      return { succes: false, message: MESSAGE_CIBLE_SOI };
    }
    if (!cible.actif) {
      return { succes: false, message: MESSAGE_CIBLE_INACTIVE };
    }

    this.ouvrirSession(cible, acteur.id);
    return { succes: true };
  }

  /** Revient au compte administrateur d'origine de la bascule. */
  revenirASonCompte(): ResultatAuth {
    const origineId = this.origine();
    if (!origineId) {
      return { succes: false, message: MESSAGE_AUCUNE_ORIGINE };
    }
    const origine = this.users.trouverParId(origineId);
    if (!origine || !origine.actif || origine.role !== 'ADMIN') {
      this.logout();
      return { succes: false, message: MESSAGE_ORIGINE_PERDUE };
    }

    this.ouvrirSession(origine);
    return { succes: true };
  }

  private definirEtatActif(id: string, actif: boolean): ResultatAuth {
    if (!this.estAdministrateur()) {
      return { succes: false, message: MESSAGE_NON_ADMIN };
    }
    const compte = this.users.trouverParId(id);
    if (!compte) {
      return { succes: false, message: MESSAGE_COMPTE_INTROUVABLE };
    }
    if (!actif && id === this.utilisateur()?.id) {
      return { succes: false, message: MESSAGE_PROPRE_COMPTE };
    }

    this.users.mettreAJour({ ...compte, actif });
    return { succes: true };
  }

  private estAdministrateur(): boolean {
    return this.utilisateur()?.role === 'ADMIN';
  }

  /** Vrai si un autre compte porte déjà le rôle `TRESORIER`. */
  private possedeTresorier(saufId?: string): boolean {
    return this.users.lister().some((compte) => compte.role === 'TRESORIER' && compte.id !== saufId);
  }

  private ouvrirSession(utilisateur: User, compteOrigineId?: string): void {
    const session: Session = {
      userId: utilisateur.id,
      expiresAt: Date.now() + DUREE_SESSION_MS,
    };
    if (compteOrigineId) {
      session.compteOrigineId = compteOrigineId;
    }
    this.storage.write(this.cleSession, session);
    this.utilisateur.set(utilisateur);
    this.origine.set(compteOrigineId ?? null);
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
    if (!utilisateur || !utilisateur.actif) {
      this.storage.remove(this.cleSession);
      return;
    }
    this.utilisateur.set(utilisateur);
    if (session.compteOrigineId) {
      this.origine.set(session.compteOrigineId);
    }
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
