import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  it('écrit puis relit une valeur', () => {
    service.write('exemple', { nom: 'Amadou', age: 42 });

    expect(service.read<{ nom: string; age: number }>('exemple')).toEqual({
      nom: 'Amadou',
      age: 42,
    });
  });

  it('retourne null pour une clé absente', () => {
    expect(service.read('absente')).toBeNull();
  });

  it('retourne null si la donnée stockée est illisible', () => {
    localStorage.setItem('tontine.corrompue', '{ceci nest pas du json');

    expect(service.read('corrompue')).toBeNull();
  });

  it('supprime une valeur', () => {
    service.write('a-supprimer', 'valeur');
    service.remove('a-supprimer');

    expect(service.read('a-supprimer')).toBeNull();
  });

  it('préfixe les clés stockées', () => {
    service.write('macle', 'valeur');

    expect(localStorage.getItem('tontine.macle')).toBe('"valeur"');
  });
});
