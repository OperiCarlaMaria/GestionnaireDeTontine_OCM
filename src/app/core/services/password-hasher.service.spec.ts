import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { PasswordHasherService } from './password-hasher.service';

describe('PasswordHasherService', () => {
  let service: PasswordHasherService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordHasherService);
  });

  it('produit des condensats différents pour un même mot de passe (sel distinct)', async () => {
    const premier = await service.hacher('motdepasse123');
    const second = await service.hacher('motdepasse123');

    expect(premier.sel).not.toBe(second.sel);
    expect(premier.hash).not.toBe(second.hash);
  });

  it('ne stocke jamais le mot de passe en clair dans le condensat ou le sel', async () => {
    const { hash, sel } = await service.hacher('motdepasse123');

    expect(hash).not.toContain('motdepasse123');
    expect(sel).not.toContain('motdepasse123');
  });

  it('vérifie correctement le bon mot de passe', async () => {
    const { hash, sel } = await service.hacher('secret-tres-solide');

    await expect(service.verifier('secret-tres-solide', sel, hash)).resolves.toBe(true);
  });

  it('rejette un mot de passe incorrect', async () => {
    const { hash, sel } = await service.hacher('secret-tres-solide');

    await expect(service.verifier('mauvais-mot-de-passe', sel, hash)).resolves.toBe(false);
  });
});
