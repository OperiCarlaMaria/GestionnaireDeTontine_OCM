import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Session } from '../models/user';
import { AuthService, DUREE_SESSION_MS } from './auth.service';
import { UserService } from './user.service';

const INSCRIPTION = {
  nomComplet: 'Awa Diop',
  email: 'awa@example.com',
  motDePasse: 'motdepasse123',
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  describe('inscription', () => {
    it('crée le premier compte avec le rôle ADMIN et ouvre une session', async () => {
      const resultat = await service.register(INSCRIPTION);

      expect(resultat.succes).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.role()).toBe('ADMIN');
      expect(service.currentUser()?.nomComplet).toBe('Awa Diop');
    });

    it('attribue le rôle MEMBRE aux comptes suivants', async () => {
      await service.register(INSCRIPTION);
      service.logout();

      const resultat = await service.register({
        nomComplet: 'Moussa Fall',
        email: 'moussa@example.com',
        motDePasse: 'autremotdepasse',
      });

      expect(resultat.succes).toBe(true);
      expect(service.role()).toBe('MEMBRE');
    });

    it("refuse une adresse e-mail déjà utilisée", async () => {
      await service.register(INSCRIPTION);
      service.logout();

      const resultat = await service.register({ ...INSCRIPTION, email: 'AWA@example.com' });

      expect(resultat).toEqual({ succes: false, message: 'Cette adresse e-mail est déjà utilisée.' });
    });

    it('refuse des données invalides', async () => {
      const sansNom = await service.register({ ...INSCRIPTION, nomComplet: '   ' });
      const mauvaisEmail = await service.register({ ...INSCRIPTION, email: 'pas-un-email' });
      const motDePasseCourt = await service.register({ ...INSCRIPTION, motDePasse: 'court' });

      expect(sansNom.succes).toBe(false);
      expect(mauvaisEmail.succes).toBe(false);
      expect(motDePasseCourt.succes).toBe(false);
      expect(TestBed.inject(UserService).nombre()).toBe(0);
    });
  });

  describe('sécurité du stockage', () => {
    it('ne persiste jamais le mot de passe en clair et associe un sel par compte', async () => {
      await service.register(INSCRIPTION);

      const brut = localStorage.getItem('tontine.utilisateurs') ?? '';
      expect(brut).not.toContain('motdepasse123');
      expect(brut).toContain('"salt"');
      expect(brut).toContain('"passwordHash"');

      const [utilisateur] = TestBed.inject(UserService).lister();
      expect(utilisateur.passwordHash).not.toBe('');
      expect(utilisateur.salt).not.toBe('');
    });
  });

  describe('connexion', () => {
    it('connecte un utilisateur avec des identifiants valides', async () => {
      await service.register(INSCRIPTION);
      service.logout();

      const resultat = await service.login({
        email: 'awa@example.com',
        motDePasse: 'motdepasse123',
      });

      expect(resultat.succes).toBe(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('refuse un mot de passe incorrect avec un message générique', async () => {
      await service.register(INSCRIPTION);
      service.logout();

      const resultat = await service.login({
        email: 'awa@example.com',
        motDePasse: 'mauvais-mot-de-passe',
      });

      expect(resultat).toEqual({
        succes: false,
        message: 'Adresse e-mail ou mot de passe incorrect.',
      });
      expect(service.isAuthenticated()).toBe(false);
    });

    it('refuse une adresse e-mail inconnue avec le même message générique', async () => {
      const resultat = await service.login({
        email: 'inconnu@example.com',
        motDePasse: 'motdepasse123',
      });

      expect(resultat).toEqual({
        succes: false,
        message: 'Adresse e-mail ou mot de passe incorrect.',
      });
    });
  });

  describe('session', () => {
    it('restaure une session valide au démarrage', async () => {
      await service.register(INSCRIPTION);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const nouveau = TestBed.inject(AuthService);

      expect(nouveau.isAuthenticated()).toBe(true);
      expect(nouveau.currentUser()?.email).toBe('awa@example.com');
    });

    it('ignore une session expirée et la supprime', () => {
      localStorage.setItem(
        'tontine.session',
        JSON.stringify({ userId: 'quelconque', expiresAt: Date.now() - 1000 } satisfies Session),
      );

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const nouveau = TestBed.inject(AuthService);

      expect(nouveau.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('tontine.session')).toBeNull();
    });

    it('rejette une session pointant vers un utilisateur introuvable', () => {
      localStorage.setItem(
        'tontine.session',
        JSON.stringify({
          userId: 'inconnu',
          expiresAt: Date.now() + DUREE_SESSION_MS,
        } satisfies Session),
      );

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const nouveau = TestBed.inject(AuthService);

      expect(nouveau.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('tontine.session')).toBeNull();
    });

    it('vide la session à la déconnexion', async () => {
      await service.register(INSCRIPTION);

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
      expect(localStorage.getItem('tontine.session')).toBeNull();
    });
  });
});
