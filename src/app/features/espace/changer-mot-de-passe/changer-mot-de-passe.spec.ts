import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { ChangerMotDePasse } from './changer-mot-de-passe';

const ADMIN = {
  nomComplet: 'Awa Diop',
  email: 'awa@example.com',
  motDePasse: 'motdepasse123',
};

describe('Écran « changer mon mot de passe »', () => {
  let fixture: ComponentFixture<ChangerMotDePasse>;
  let auth: AuthService;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [ChangerMotDePasse],
      providers: [provideRouter([])],
    });
    auth = TestBed.inject(AuthService);
    await auth.register(ADMIN);
    fixture = TestBed.createComponent(ChangerMotDePasse);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function racine(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function saisir(id: string, valeur: string): void {
    const champ = racine().querySelector<HTMLInputElement>(`#${id}`)!;
    champ.value = valeur;
    champ.dispatchEvent(new Event('input'));
  }

  /** Attend la fin du changement asynchrone (hachage PBKDF2 compris). */
  async function soumettre(): Promise<void> {
    racine().querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    const limite = Date.now() + 5000;
    while (fixture.componentInstance.enCours() && Date.now() < limite) {
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('change le mot de passe de l’utilisateur connecté', async () => {
    saisir('motDePasseActuel', 'motdepasse123');
    saisir('nouveauMotDePasse', 'nouveaumotdepasse');
    await soumettre();

    expect(racine().textContent).toContain('Votre mot de passe a été modifié.');

    auth.logout();
    const resultat = await auth.login({ email: ADMIN.email, motDePasse: 'nouveaumotdepasse' });
    expect(resultat.succes).toBe(true);
  });

  it('affiche une erreur si le mot de passe actuel est incorrect', async () => {
    saisir('motDePasseActuel', 'faux-mot-de-passe');
    saisir('nouveauMotDePasse', 'nouveaumotdepasse');
    await soumettre();

    expect(racine().textContent).toContain('Le mot de passe actuel est incorrect.');
  });

  it('révèle puis masque les deux champs mot de passe', () => {
    const boutons = racine().querySelectorAll<HTMLButtonElement>('.bascule-visibilite');
    expect(boutons.length).toBe(2);

    expect(racine().querySelector<HTMLInputElement>('#motDePasseActuel')!.type).toBe('password');
    boutons[0].click();
    fixture.detectChanges();
    expect(racine().querySelector<HTMLInputElement>('#motDePasseActuel')!.type).toBe('text');
    expect(boutons[0].getAttribute('aria-pressed')).toBe('true');

    expect(racine().querySelector<HTMLInputElement>('#nouveauMotDePasse')!.type).toBe('password');
    boutons[1].click();
    fixture.detectChanges();
    expect(racine().querySelector<HTMLInputElement>('#nouveauMotDePasse')!.type).toBe('text');
  });
});
