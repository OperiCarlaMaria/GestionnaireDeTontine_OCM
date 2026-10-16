import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { Administration } from './administration';

@Component({ template: '' })
class EcranVide {}

const ADMIN = {
  nomComplet: 'Awa Diop',
  email: 'awa@example.com',
  motDePasse: 'motdepasse123',
};

describe('Écran d’administration des comptes', () => {
  let fixture: ComponentFixture<Administration>;
  let auth: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Administration],
      providers: [provideRouter([{ path: 'espace', component: EcranVide }])],
    });
    auth = TestBed.inject(AuthService);
    await auth.register(ADMIN);
    await auth.creerCompte({
      nomComplet: 'Karim Ba',
      email: 'karim@example.com',
      role: 'MEMBRE',
      motDePasse: 'motdepasse456',
    });
    fixture = TestBed.createComponent(Administration);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function racine(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function saisir(champ: HTMLInputElement, valeur: string): void {
    champ.value = valeur;
    champ.dispatchEvent(new Event('input'));
  }

  function action(texte: string): HTMLButtonElement {
    const bouton = Array.from(racine().querySelectorAll<HTMLButtonElement>('.action')).find(
      (b) => b.textContent?.trim() === texte,
    );
    expect(bouton).toBeDefined();
    return bouton!;
  }

  /** Attend la fin d'une opération asynchrone du composant (hachage compris). */
  async function attendreTraitement(): Promise<void> {
    const limite = Date.now() + 5000;
    while (fixture.componentInstance.enCours() && Date.now() < limite) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function soumettre(): Promise<void> {
    racine().querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    await attendreTraitement();
  }

  it('affiche la liste réelle des comptes', () => {
    expect(racine().textContent).toContain('Comptes (2)');
    expect(racine().textContent).toContain('Awa Diop');
    expect(racine().textContent).toContain('karim@example.com');
    expect(racine().textContent).toContain('(vous)');
  });

  it('crée un compte depuis le formulaire de création', async () => {
    saisir(racine().querySelector<HTMLInputElement>('#creation-nom')!, 'Moussa Fall');
    saisir(racine().querySelector<HTMLInputElement>('#creation-email')!, 'moussa@example.com');
    saisir(racine().querySelector<HTMLInputElement>('#creation-mot-de-passe')!, 'motdepasse789');
    await soumettre();

    expect(racine().textContent).toContain('Le compte a été créé.');
    expect(racine().textContent).toContain('moussa@example.com');
    expect(racine().textContent).toContain('Comptes (3)');
  });

  it('modifie le nom d’un compte via le formulaire en ligne', async () => {
    action('Modifier').click();
    fixture.detectChanges();

    const formulaire = racine().querySelector('.formulaire-ligne');
    expect(formulaire).not.toBeNull();
    const champ = formulaire!.querySelector<HTMLInputElement>(
      'input[formcontrolname="nomComplet"]',
    );
    expect(champ).not.toBeNull();

    saisir(champ!, 'Awa Diop Traoré');
    const enregistrer = Array.from(
      racine().querySelectorAll<HTMLButtonElement>('.boutons-ligne button'),
    ).find((b) => b.textContent?.trim() === 'Enregistrer')!;
    enregistrer.click();
    await attendreTraitement();

    expect(racine().textContent).toContain('Awa Diop Traoré');
    expect(racine().textContent).toContain('Le compte a été modifié.');
  });

  it('désactive un compte depuis la ligne du tableau', async () => {
    action('Désactiver').click();
    await attendreTraitement();

    expect(racine().textContent).toContain('Le compte a été désactivé.');
    expect(racine().textContent).toContain('Désactivé');
    expect(racine().textContent).not.toContain('Se connecter en tant que');
  });

  it('ouvre la session du compte choisi avec « se connecter en tant que »', async () => {
    action('Se connecter en tant que').click();
    await attendreTraitement();

    expect(auth.enBascule()).toBe(true);
    expect(auth.currentUser()?.email).toBe('karim@example.com');
  });

  it('propose un formulaire de réinitialisation de mot de passe par ligne', async () => {
    action('Mot de passe').click();
    fixture.detectChanges();

    const champ = racine().querySelector<HTMLInputElement>(
      '.formulaire-ligne input[formcontrolname="motDePasse"]',
    );
    expect(champ).not.toBeNull();

    saisir(champ!, 'nouveaumotdepasse');
    const reinitialiser = Array.from(
      racine().querySelectorAll<HTMLButtonElement>('.boutons-ligne button'),
    ).find((b) => b.textContent?.trim() === 'Réinitialiser')!;
    reinitialiser.click();
    await attendreTraitement();

    expect(racine().textContent).toContain('Le mot de passe du compte a été réinitialisé.');
  });
});
