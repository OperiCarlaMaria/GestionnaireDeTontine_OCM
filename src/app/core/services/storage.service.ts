import { Injectable } from '@angular/core';

/**
 * Encapsule l'accès au stockage local du navigateur.
 * Les services métier ne touchent jamais directement à `localStorage`,
 * ce qui facilite les tests et une future migration vers un backend.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly prefixe = 'tontine.';

  read<T>(cle: string): T | null {
    try {
      const brut = localStorage.getItem(this.prefixe + cle);
      if (brut === null) {
        return null;
      }
      return JSON.parse(brut) as T;
    } catch {
      return null;
    }
  }

  write<T>(cle: string, valeur: T): void {
    try {
      localStorage.setItem(this.prefixe + cle, JSON.stringify(valeur));
    } catch {
      /* stockage indisponible : on ignore silencieusement */
    }
  }

  remove(cle: string): void {
    try {
      localStorage.removeItem(this.prefixe + cle);
    } catch {
      /* stockage indisponible : on ignore silencieusement */
    }
  }
}
