import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../models/user';
import { UserService } from './user.service';

function creerUtilisateur(surcharge: Partial<User> = {}): User {
  return {
    id: 'id-1',
    nomComplet: 'Awa Diop',
    email: 'awa@example.com',
    role: 'MEMBRE',
    salt: 'sel',
    passwordHash: 'hash',
    dateCreation: new Date().toISOString(),
    ...surcharge,
  };
}

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserService);
  });

  it('commence avec une liste vide', () => {
    expect(service.lister()).toEqual([]);
    expect(service.nombre()).toBe(0);
  });

  it('ajoute puis relit un utilisateur', () => {
    service.ajouter(creerUtilisateur());

    expect(service.nombre()).toBe(1);
    expect(service.lister()[0].nomComplet).toBe('Awa Diop');
  });

  it('trouve un utilisateur par e-mail en ignorant la casse et les espaces', () => {
    service.ajouter(creerUtilisateur({ email: 'Awa@Example.com' }));

    expect(service.trouverParEmail('  awa@example.COM ')?.id).toBe('id-1');
  });

  it('trouve un utilisateur par identifiant', () => {
    service.ajouter(creerUtilisateur({ id: 'id-42' }));

    expect(service.trouverParId('id-42')?.nomComplet).toBe('Awa Diop');
  });

  it('retourne undefined pour un e-mail inconnu', () => {
    expect(service.trouverParEmail('inconnu@example.com')).toBeUndefined();
  });

  it('détecte un e-mail déjà présent (unicité)', () => {
    service.ajouter(creerUtilisateur({ email: 'unique@example.com' }));

    expect(service.trouverParEmail('unique@example.com')).toBeDefined();
  });
});
