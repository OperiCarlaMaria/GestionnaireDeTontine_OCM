import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { CONFIGURATION_PAR_DEFAUT } from '../../core/models/configuration';
import { AuthService } from '../../core/services/auth.service';
import { ConfigurationService } from '../../core/services/configuration.service';
import { Layout } from './layout';

describe('En-tête du layout (nom de la tontine)', () => {
  let fixture: ComponentFixture<Layout>;

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [Layout],
      providers: [provideRouter([])],
    });
    const auth = TestBed.inject(AuthService);
    await auth.register({
      nomComplet: 'Awa Diop',
      email: 'awa@example.com',
      motDePasse: 'motdepasse123',
    });
    fixture = TestBed.createComponent(Layout);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function nomAffiche(): string {
    return (fixture.nativeElement as HTMLElement).querySelector('.marque__nom')!.textContent!.trim();
  }

  it('affiche le nom par défaut de la tontine', () => {
    expect(nomAffiche()).toBe(CONFIGURATION_PAR_DEFAUT.nom);
  });

  it('affiche le nom configuré après modification', () => {
    TestBed.inject(ConfigurationService).modifier({
      ...CONFIGURATION_PAR_DEFAUT,
      nom: 'Tontine du Quartier',
    });
    fixture.detectChanges();

    expect(nomAffiche()).toBe('Tontine du Quartier');
  });
});
