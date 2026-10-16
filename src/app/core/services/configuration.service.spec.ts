import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CONFIGURATION_PAR_DEFAUT, ConfigurationTontine } from '../models/configuration';
import { AuthService } from './auth.service';
import { ConfigurationService } from './configuration.service';

const OVERRIDES: Partial<ConfigurationTontine> = {
  nom: 'Tontine du Quartier',
  montantCotisation: 2500,
  frequence: 'HEBDOMADAIRE',
  jourEcheance: 5,
  ordreTours: 'MANUEL',
};

describe('ConfigurationService', () => {
  let service: ConfigurationService;
  let auth: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConfigurationService);
    auth = TestBed.inject(AuthService);
    await auth.register({
      nomComplet: 'Awa Diop',
      email: 'awa@example.com',
      motDePasse: 'motdepasse123',
    });
  });

  it('propose la configuration par défaut au premier accès', () => {
    expect(service.lire()).toEqual(CONFIGURATION_PAR_DEFAUT);
    expect(service.configuration()).toEqual(CONFIGURATION_PAR_DEFAUT);
  });

  it('enregistre une configuration valide pour l’administrateur', () => {
    const resultat = service.modifier({ ...CONFIGURATION_PAR_DEFAUT, ...OVERRIDES });

    expect(resultat.succes).toBe(true);
    expect(service.configuration().nom).toBe('Tontine du Quartier');
    expect(service.configuration().montantCotisation).toBe(2500);
    expect(service.lire()).toEqual({ ...CONFIGURATION_PAR_DEFAUT, ...OVERRIDES });
  });

  it('refuse la modification à un non-administrateur', async () => {
    await auth.creerCompte({
      nomComplet: 'Karim Ba',
      email: 'karim@example.com',
      role: 'TRESORIER',
      motDePasse: 'motdepasse456',
    });
    auth.logout();
    await auth.login({ email: 'karim@example.com', motDePasse: 'motdepasse456' });

    const resultat = service.modifier({ ...CONFIGURATION_PAR_DEFAUT, ...OVERRIDES });

    expect(resultat).toEqual({
      succes: false,
      message: 'Seul un administrateur peut modifier la configuration.',
    });
    expect(service.lire()).toEqual(CONFIGURATION_PAR_DEFAUT);
  });

  it('refuse la modification hors session', () => {
    auth.logout();

    const resultat = service.modifier({ ...CONFIGURATION_PAR_DEFAUT, ...OVERRIDES });

    expect(resultat.succes).toBe(false);
  });

  it('refuse les valeurs invalides sans rien persister', () => {
    const cas: { surcharge: Partial<ConfigurationTontine>; attendu: string }[] = [
      { surcharge: { nom: '   ' }, attendu: 'Le nom de la tontine est obligatoire.' },
      { surcharge: { montantCotisation: 0 }, attendu: 'Le montant de la cotisation doit être supérieur à 0.' },
      { surcharge: { montantCotisation: -5 }, attendu: 'Le montant de la cotisation doit être supérieur à 0.' },
      { surcharge: { jourEcheance: 32 }, attendu: 'Le jour d’échéance doit être compris entre 1 et 31.' },
      { surcharge: { jourEcheance: 0 }, attendu: 'Le jour d’échéance doit être compris entre 1 et 31.' },
      {
        surcharge: { frequence: 'HEBDOMADAIRE', jourEcheance: 8 },
        attendu: 'Le jour d’échéance doit être compris entre 1 et 7.',
      },
    ];

    for (const { surcharge, attendu } of cas) {
      const resultat = service.modifier({ ...CONFIGURATION_PAR_DEFAUT, ...surcharge });
      expect(resultat).toEqual({ succes: false, message: attendu });
    }
    expect(service.lire()).toEqual(CONFIGURATION_PAR_DEFAUT);
  });

  it('refuse une fréquence inconnue', () => {
    const resultat = service.modifier({
      ...CONFIGURATION_PAR_DEFAUT,
      frequence: 'QUOTIDIENNE' as ConfigurationTontine['frequence'],
    });

    expect(resultat).toEqual({
      succes: false,
      message: 'La fréquence sélectionnée n’est pas valide.',
    });
  });

  it('restaure la configuration enregistrée après rechargement', () => {
    service.modifier({ ...CONFIGURATION_PAR_DEFAUT, ...OVERRIDES });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const nouveau = TestBed.inject(ConfigurationService);

    expect(nouveau.configuration()).toEqual({ ...CONFIGURATION_PAR_DEFAUT, ...OVERRIDES });
  });
});
