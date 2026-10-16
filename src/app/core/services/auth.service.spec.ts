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

    it("ferme l'inscription publique après le premier compte", async () => {
      await service.register(INSCRIPTION);
      service.logout();

      const resultat = await service.register({
        nomComplet: 'Moussa Fall',
        email: 'moussa@example.com',
        motDePasse: 'autremotdepasse',
      });

      expect(resultat).toEqual({
        succes: false,
        message: "L'inscription publique est fermée.",
      });
      expect(TestBed.inject(UserService).nombre()).toBe(1);
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
      expect(service.enBascule()).toBe(false);
    });
  });

  describe('gestion des comptes', () => {
    const MEMBRE_CREE = {
      nomComplet: 'Karim Ba',
      email: 'karim@example.com',
      role: 'MEMBRE' as const,
      motDePasse: 'motdepasse456',
    };

    beforeEach(async () => {
      await service.register(INSCRIPTION);
    });

    it('crée un compte actif avec le rôle choisi, sans ouvrir sa session', async () => {
      const resultat = await service.creerCompte({ ...MEMBRE_CREE, role: 'TRESORIER' });

      expect(resultat.succes).toBe(true);
      const compte = TestBed.inject(UserService).trouverParEmail('karim@example.com');
      expect(compte?.role).toBe('TRESORIER');
      expect(compte?.actif).toBe(true);
      expect(service.currentUser()?.email).toBe(INSCRIPTION.email);
    });

    it('refuse la création à un non-administrateur', async () => {
      await service.creerCompte(MEMBRE_CREE);
      service.logout();
      await service.login({ email: MEMBRE_CREE.email, motDePasse: MEMBRE_CREE.motDePasse });

      const resultat = await service.creerCompte({ ...MEMBRE_CREE, email: 'autre@example.com' });

      expect(resultat).toEqual({
        succes: false,
        message: 'Seul un administrateur peut effectuer cette opération.',
      });
    });

    it('refuse un e-mail déjà utilisé ou un mot de passe trop court', async () => {
      const doublon = await service.creerCompte({ ...MEMBRE_CREE, email: INSCRIPTION.email });
      const court = await service.creerCompte({ ...MEMBRE_CREE, motDePasse: 'court' });

      expect(doublon).toEqual({ succes: false, message: 'Cette adresse e-mail est déjà utilisée.' });
      expect(court).toEqual({
        succes: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères.',
      });
      expect(TestBed.inject(UserService).nombre()).toBe(1);
    });

    it("n'autorise qu'un seul trésorier", async () => {
      const creation = await service.creerCompte({ ...MEMBRE_CREE, role: 'TRESORIER' });
      expect(creation.succes).toBe(true);

      const second = await service.creerCompte({
        ...MEMBRE_CREE,
        email: 'second@example.com',
        role: 'TRESORIER',
      });

      expect(second).toEqual({
        succes: false,
        message: 'Un trésorier existe déjà : modifiez le compte existant.',
      });
    });

    it('modifie le nom et le rôle d’un autre compte', async () => {
      await service.creerCompte(MEMBRE_CREE);
      const compte = TestBed.inject(UserService).trouverParEmail(MEMBRE_CREE.email)!;

      const resultat = service.modifierCompte(compte.id, {
        nomComplet: 'Karim Ba Traoré',
        role: 'TRESORIER',
      });

      expect(resultat.succes).toBe(true);
      expect(TestBed.inject(UserService).trouverParId(compte.id)?.nomComplet).toBe('Karim Ba Traoré');
      expect(TestBed.inject(UserService).trouverParId(compte.id)?.role).toBe('TRESORIER');
    });

    it('protège le rôle de son propre compte', async () => {
      const moi = service.currentUser()!;

      const resultat = service.modifierCompte(moi.id, { nomComplet: moi.nomComplet, role: 'MEMBRE' });

      expect(resultat).toEqual({
        succes: false,
        message: 'Impossible de modifier le rôle de votre propre compte.',
      });
    });

    it('refuse de promouvoir un second trésorier', async () => {
      await service.creerCompte({ ...MEMBRE_CREE, role: 'TRESORIER' });
      await service.creerCompte({ ...MEMBRE_CREE, email: 'moussa@example.com', role: 'MEMBRE' });
      const membre = TestBed.inject(UserService).trouverParEmail('moussa@example.com')!;

      const resultat = service.modifierCompte(membre.id, {
        nomComplet: membre.nomComplet,
        role: 'TRESORIER',
      });

      expect(resultat.succes).toBe(false);
    });

    it('désactive un compte (connexion bloquée) puis le réactive, jamais son propre compte', async () => {
      await service.creerCompte(MEMBRE_CREE);
      const membre = TestBed.inject(UserService).trouverParEmail(MEMBRE_CREE.email)!;

      expect(service.desactiverCompte(membre.id).succes).toBe(true);
      service.logout();
      const connexion = await service.login({
        email: MEMBRE_CREE.email,
        motDePasse: MEMBRE_CREE.motDePasse,
      });
      expect(connexion).toEqual({
        succes: false,
        message: 'Ce compte est désactivé. Contactez un administrateur.',
      });

      await service.login({ email: INSCRIPTION.email, motDePasse: INSCRIPTION.motDePasse });
      expect(service.activerCompte(membre.id).succes).toBe(true);
      expect(service.desactiverCompte(service.currentUser()!.id)).toEqual({
        succes: false,
        message: 'Impossible de désactiver votre propre compte.',
      });
    });

    it('réinitialise le mot de passe d’un compte (ancien refusé, nouveau accepté)', async () => {
      await service.creerCompte(MEMBRE_CREE);
      const membre = TestBed.inject(UserService).trouverParEmail(MEMBRE_CREE.email)!;

      const tropCourt = await service.reinitialiserMotDePasse(membre.id, 'court');
      expect(tropCourt.succes).toBe(false);

      const resultat = await service.reinitialiserMotDePasse(membre.id, 'nouveaumotdepasse');
      expect(resultat.succes).toBe(true);

      service.logout();
      const ancien = await service.login({
        email: MEMBRE_CREE.email,
        motDePasse: MEMBRE_CREE.motDePasse,
      });
      expect(ancien.succes).toBe(false);
      const nouveau = await service.login({
        email: MEMBRE_CREE.email,
        motDePasse: 'nouveaumotdepasse',
      });
      expect(nouveau.succes).toBe(true);
    });
  });

  describe('changement de son propre mot de passe', () => {
    beforeEach(async () => {
      await service.register(INSCRIPTION);
    });

    it('change le mot de passe avec le mot de passe actuel correct', async () => {
      const resultat = await service.changerMotDePasse('motdepasse123', 'nouveaumotdepasse');

      expect(resultat.succes).toBe(true);
      service.logout();
      const ancien = await service.login({
        email: INSCRIPTION.email,
        motDePasse: 'motdepasse123',
      });
      expect(ancien.succes).toBe(false);
      const nouveau = await service.login({
        email: INSCRIPTION.email,
        motDePasse: 'nouveaumotdepasse',
      });
      expect(nouveau.succes).toBe(true);
    });

    it('refuse le mot de passe actuel incorrect', async () => {
      const resultat = await service.changerMotDePasse('faux-mot-de-passe', 'nouveaumotdepasse');

      expect(resultat).toEqual({
        succes: false,
        message: 'Le mot de passe actuel est incorrect.',
      });
    });

    it('refuse un nouveau mot de passe trop court', async () => {
      const resultat = await service.changerMotDePasse('motdepasse123', 'court');

      expect(resultat.succes).toBe(false);
    });

    it('refuse tout changement hors session', async () => {
      service.logout();

      const resultat = await service.changerMotDePasse('motdepasse123', 'nouveaumotdepasse');

      expect(resultat).toEqual({ succes: false, message: 'Vous n’êtes pas connecté.' });
    });
  });

  describe('bascule « se connecter en tant que »', () => {
    const CIBLE = {
      nomComplet: 'Moussa Fall',
      email: 'moussa@example.com',
      role: 'MEMBRE' as const,
      motDePasse: 'motdepasse456',
    };

    beforeEach(async () => {
      await service.register(INSCRIPTION);
      await service.creerCompte(CIBLE);
    });

    it('ouvre la session du compte cible puis revient à l’administrateur', () => {
      const membre = TestBed.inject(UserService).trouverParEmail(CIBLE.email)!;
      const adminId = service.currentUser()!.id;

      const bascule = service.seConnecterEnTantQue(membre.id);
      expect(bascule.succes).toBe(true);
      expect(service.currentUser()?.email).toBe(CIBLE.email);
      expect(service.role()).toBe('MEMBRE');
      expect(service.enBascule()).toBe(true);

      const retour = service.revenirASonCompte();
      expect(retour.succes).toBe(true);
      expect(service.currentUser()?.id).toBe(adminId);
      expect(service.role()).toBe('ADMIN');
      expect(service.enBascule()).toBe(false);
    });

    it('conserve la bascule après rechargement de la session', () => {
      const membre = TestBed.inject(UserService).trouverParEmail(CIBLE.email)!;
      service.seConnecterEnTantQue(membre.id);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const nouveau = TestBed.inject(AuthService);

      expect(nouveau.currentUser()?.email).toBe(CIBLE.email);
      expect(nouveau.enBascule()).toBe(true);
      expect(nouveau.revenirASonCompte().succes).toBe(true);
      expect(nouveau.currentUser()?.email).toBe(INSCRIPTION.email);
    });

    it('refuse la bascule à un non-administrateur', async () => {
      const adminId = service.currentUser()!.id;
      service.logout();
      await service.login({ email: CIBLE.email, motDePasse: CIBLE.motDePasse });

      const resultat = service.seConnecterEnTantQue(adminId);

      expect(resultat.succes).toBe(false);
      expect(service.role()).toBe('MEMBRE');
    });

    it('refuse la bascule vers un compte désactivé', async () => {
      await service.creerCompte({ ...CIBLE, email: 'karim@example.com' });
      const desactive = TestBed.inject(UserService).trouverParEmail('karim@example.com')!;
      service.desactiverCompte(desactive.id);

      const resultat = service.seConnecterEnTantQue(desactive.id);

      expect(resultat).toEqual({
        succes: false,
        message: 'Impossible d’ouvrir la session d’un compte désactivé.',
      });
    });

    it('déconnecte si le compte d’origine est désactivé pendant la bascule', () => {
      const membre = TestBed.inject(UserService).trouverParEmail(CIBLE.email)!;
      const adminId = service.currentUser()!.id;
      service.seConnecterEnTantQue(membre.id);

      const users = TestBed.inject(UserService);
      const admin = users.trouverParId(adminId)!;
      users.mettreAJour({ ...admin, actif: false });

      const retour = service.revenirASonCompte();

      expect(retour.succes).toBe(false);
      expect(service.isAuthenticated()).toBe(false);
      expect(service.enBascule()).toBe(false);
    });
  });
});
