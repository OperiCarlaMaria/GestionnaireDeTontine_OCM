import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { CONFIGURATION_PAR_DEFAUT } from '../../../core/models/configuration';
import { AuthService } from '../../../core/services/auth.service';
import { ConfigurationService } from '../../../core/services/configuration.service';
import { Parametres } from './parametres';

describe('Écran des paramètres de la tontine', () => {
  let fixture: ComponentFixture<Parametres>;
  let configurations: ConfigurationService;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Parametres],
      providers: [provideRouter([])],
    });
    const auth = TestBed.inject(AuthService);
    configurations = TestBed.inject(ConfigurationService);
    await auth.register({
      nomComplet: 'Awa Diop',
      email: 'awa@example.com',
      motDePasse: 'motdepasse123',
    });
    fixture = TestBed.createComponent(Parametres);
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

  function soumettre(): void {
    racine().querySelector<HTMLFormElement>('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('pré-remplit le formulaire avec la configuration courante', () => {
    expect(racine().querySelector<HTMLInputElement>('#nom')!.value).toBe(
      CONFIGURATION_PAR_DEFAUT.nom,
    );
    expect(racine().querySelector<HTMLInputElement>('#montantCotisation')!.value).toBe('1000');
    expect(racine().querySelector<HTMLSelectElement>('#frequence')!.value).toBe('MENSUELLE');
    expect(racine().querySelector<HTMLInputElement>('#jourEcheance')!.value).toBe('1');
  });

  it('affiche les erreurs et n’enregistre rien si le nom est vide', () => {
    saisir('nom', '   ');
    soumettre();

    expect(racine().textContent).toContain('Le nom de la tontine est obligatoire.');
    expect(configurations.configuration()).toEqual(CONFIGURATION_PAR_DEFAUT);
  });

  it('enregistre une configuration valide', () => {
    saisir('nom', 'Tontine du Quartier');
    saisir('montantCotisation', '2500');
    soumettre();

    expect(racine().textContent).toContain('La configuration a été enregistrée.');
    expect(configurations.configuration().nom).toBe('Tontine du Quartier');
    expect(configurations.configuration().montantCotisation).toBe(2500);
  });

  it('borne le jour d’échéance selon la fréquence choisie', () => {
    const select = racine().querySelector<HTMLSelectElement>('#frequence')!;
    select.value = 'HEBDOMADAIRE';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    saisir('jourEcheance', '8');
    soumettre();

    expect(racine().textContent).toContain(
      "Le jour d'échéance doit être compris entre 1 et 7.",
    );
    expect(configurations.configuration().frequence).toBe('MENSUELLE');
  });

  it('refuse un montant nul', () => {
    saisir('montantCotisation', '0');
    soumettre();

    expect(racine().textContent).toContain('Le montant doit être supérieur à 0.');
    expect(configurations.configuration().montantCotisation).toBe(
      CONFIGURATION_PAR_DEFAUT.montantCotisation,
    );
  });
});
