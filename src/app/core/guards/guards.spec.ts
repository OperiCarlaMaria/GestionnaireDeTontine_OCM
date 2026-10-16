import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { Role } from '../models/role';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';
import { guestGuard } from './guest.guard';
import { roleGuard } from './role.guard';

interface EtatAuth {
  connecte: boolean;
  role: Role | null;
}

function configurer(etat: EtatAuth) {
  const router = {
    createUrlTree: (commands: unknown[], extras?: { queryParams?: Record<string, string> }) =>
      ({ commands, extras }) as unknown as UrlTree,
  };

  TestBed.configureTestingModule({
    providers: [
      { provide: Router, useValue: router },
      {
        provide: AuthService,
        useValue: {
          isAuthenticated: () => etat.connecte,
          role: () => etat.role,
        },
      },
    ],
  });
}

const route = {} as never;
const etatUrl = { url: '/espace/tableau-de-bord' } as never;

describe('gardes de route', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  describe('authGuard', () => {
    it('laisse passer un utilisateur authentifié', () => {
      configurer({ connecte: true, role: 'MEMBRE' });

      const resultat = TestBed.runInInjectionContext(() => authGuard(route, etatUrl));

      expect(resultat).toBe(true);
    });

    it('redirige un visiteur vers la connexion en mémorisant l’URL', () => {
      configurer({ connecte: false, role: null });

      const resultat = TestBed.runInInjectionContext(() => authGuard(route, etatUrl)) as unknown as {
        commands: string[];
        extras: { queryParams: Record<string, string> };
      };

      expect(resultat.commands).toEqual(['/connexion']);
      expect(resultat.extras.queryParams).toEqual({ redirection: '/espace/tableau-de-bord' });
    });
  });

  describe('guestGuard', () => {
    it('laisse passer un visiteur', () => {
      configurer({ connecte: false, role: null });

      expect(TestBed.runInInjectionContext(() => guestGuard(route, etatUrl))).toBe(true);
    });

    it('redirige un utilisateur connecté vers l’espace applicatif', () => {
      configurer({ connecte: true, role: 'MEMBRE' });

      const resultat = TestBed.runInInjectionContext(() => guestGuard(route, etatUrl)) as unknown as {
        commands: string[];
      };

      expect(resultat.commands).toEqual(['/espace']);
    });
  });

  describe('roleGuard', () => {
    it('laisse passer un rôle autorisé', () => {
      configurer({ connecte: true, role: 'ADMIN' });

      const garde = roleGuard('ADMIN');
      expect(TestBed.runInInjectionContext(() => garde(route, etatUrl))).toBe(true);
    });

    it('refuse un rôle non autorisé et renvoie vers l’accès refusé', () => {
      configurer({ connecte: true, role: 'MEMBRE' });

      const garde = roleGuard('ADMIN');
      const resultat = TestBed.runInInjectionContext(() => garde(route, etatUrl)) as unknown as {
        commands: string[];
      };

      expect(resultat.commands).toEqual(['/acces-refuse']);
    });

    it('redirige un visiteur vers la connexion', () => {
      configurer({ connecte: false, role: null });

      const garde = roleGuard('ADMIN');
      const resultat = TestBed.runInInjectionContext(() => garde(route, etatUrl)) as unknown as {
        commands: string[];
      };

      expect(resultat.commands).toEqual(['/connexion']);
    });
  });
});
