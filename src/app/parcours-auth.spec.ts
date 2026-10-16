import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { AccesRefuse } from './features/acces-refuse/acces-refuse';
import { Connexion } from './features/auth/connexion/connexion';
import { AuthService } from './core/services/auth.service';
import { routes } from './app.routes';

describe('Parcours d’authentification (intégration)', () => {
  let auth: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    auth = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('redirige un visiteur vers la connexion pour un écran protégé', async () => {
    const harnais = await RouterTestingHarness.create();

    await harnais.navigateByUrl('/espace/tableau-de-bord');

    expect(router.url.startsWith('/connexion')).toBe(true);
    expect(router.url).toContain('redirection=%2Fespace%2Ftableau-de-bord');
    expect(harnais.routeDebugElement?.componentInstance).toBeInstanceOf(Connexion);
  });

  it('premier compte ADMIN : accès au tableau de bord puis à l’administration', async () => {
    await auth.register({
      nomComplet: 'Awa Diop',
      email: 'awa@example.com',
      motDePasse: 'motdepasse123',
    });
    const harnais = await RouterTestingHarness.create();

    await harnais.navigateByUrl('/espace/tableau-de-bord');
    expect(router.url).toBe('/espace/tableau-de-bord');
    expect(harnais.routeNativeElement?.textContent).toContain('Bonjour, Awa Diop');

    await harnais.navigateByUrl('/espace/administration');
    expect(router.url).toBe('/espace/administration');
    expect(harnais.routeNativeElement?.textContent).toContain('Administration');
  });

  it('déconnexion puis reconnexion conservent le rôle et l’accès', async () => {
    await auth.register({
      nomComplet: 'Awa Diop',
      email: 'awa@example.com',
      motDePasse: 'motdepasse123',
    });
    auth.logout();

    const harnais = await RouterTestingHarness.create();
    await harnais.navigateByUrl('/connexion');
    expect(harnais.routeDebugElement?.componentInstance).toBeInstanceOf(Connexion);

    await auth.login({ email: 'awa@example.com', motDePasse: 'motdepasse123' });
    await harnais.navigateByUrl('/espace/tableau-de-bord');

    expect(auth.role()).toBe('ADMIN');
    expect(router.url).toBe('/espace/tableau-de-bord');
    expect(harnais.routeNativeElement?.textContent).toContain('Bonjour, Awa Diop');
  });

  it('second compte MEMBRE : accès refusé à l’administration', async () => {
    await auth.register({
      nomComplet: 'Awa Diop',
      email: 'awa@example.com',
      motDePasse: 'motdepasse123',
    });
    await auth.register({
      nomComplet: 'Moussa Fall',
      email: 'moussa@example.com',
      motDePasse: 'motdepasse456',
    });
    const harnais = await RouterTestingHarness.create();

    await harnais.navigateByUrl('/espace/administration');

    expect(auth.role()).toBe('MEMBRE');
    expect(router.url).toBe('/acces-refuse');
    expect(harnais.routeDebugElement?.componentInstance).toBeInstanceOf(AccesRefuse);
  });
});
