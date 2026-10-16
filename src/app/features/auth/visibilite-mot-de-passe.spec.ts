import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { Connexion } from './connexion/connexion';
import { Inscription } from './inscription/inscription';

describe('Bascule de visibilité du mot de passe', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function verifier(typeComposant: typeof Connexion | typeof Inscription): void {
    const fixture: ComponentFixture<Connexion | Inscription> =
      TestBed.createComponent(typeComposant as typeof Connexion);
    fixture.detectChanges();

    const champ = fixture.nativeElement.querySelector('#motDePasse') as HTMLInputElement;
    const bascule = fixture.nativeElement.querySelector(
      '.bascule-visibilite',
    ) as HTMLButtonElement;

    expect(champ).toBeTruthy();
    expect(bascule).toBeTruthy();
    expect(champ.type).toBe('password');
    expect(bascule.getAttribute('aria-pressed')).toBe('false');

    bascule.click();
    fixture.detectChanges();

    expect(champ.type).toBe('text');
    expect(bascule.getAttribute('aria-pressed')).toBe('true');

    bascule.click();
    fixture.detectChanges();

    expect(champ.type).toBe('password');
    expect(bascule.getAttribute('aria-pressed')).toBe('false');
  }

  it('révèle puis masque le mot de passe sur l’écran de connexion', () => {
    verifier(Connexion);
  });

  it('révèle puis masque le mot de passe sur l’écran d’inscription', () => {
    verifier(Inscription);
  });
});
