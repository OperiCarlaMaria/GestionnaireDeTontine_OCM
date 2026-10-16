import { Injectable } from '@angular/core';

/** Résultat du hachage d'un mot de passe. */
export interface MotDePasseHache {
  hash: string;
  sel: string;
}

const ITERATIONS = 100_000;
const LONGUEUR_SEL = 16;
const LONGUEUR_CLE = 256;

/**
 * Hache et vérifie les mots de passe avec PBKDF2-SHA-256 via l'API Web Crypto.
 * Un sel aléatoire unique est généré pour chaque compte.
 */
@Injectable({ providedIn: 'root' })
export class PasswordHasherService {
  async hacher(motDePasse: string): Promise<MotDePasseHache> {
    const sel = this.genererSel();
    const hash = await this.deriver(motDePasse, sel);
    return { hash, sel };
  }

  async verifier(motDePasse: string, sel: string, hashAttendu: string): Promise<boolean> {
    const hash = await this.deriver(motDePasse, sel);
    return this.comparerEnTempsConstant(hash, hashAttendu);
  }

  private async deriver(motDePasse: string, sel: string): Promise<string> {
    const encodeur = new TextEncoder();
    const cle = await crypto.subtle.importKey(
      'raw',
      encodeur.encode(motDePasse),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: this.base64VersOctets(sel),
        iterations: ITERATIONS,
        hash: 'SHA-256',
      },
      cle,
      LONGUEUR_CLE,
    );
    return this.octetsVersBase64(new Uint8Array(bits));
  }

  private genererSel(): string {
    const octets = new Uint8Array(LONGUEUR_SEL);
    crypto.getRandomValues(octets);
    return this.octetsVersBase64(octets);
  }

  private octetsVersBase64(octets: Uint8Array<ArrayBuffer>): string {
    let binaire = '';
    for (const octet of octets) {
      binaire += String.fromCharCode(octet);
    }
    return btoa(binaire);
  }

  private base64VersOctets(base64: string): Uint8Array<ArrayBuffer> {
    const binaire = atob(base64);
    const octets = new Uint8Array(binaire.length);
    for (let index = 0; index < binaire.length; index++) {
      octets[index] = binaire.charCodeAt(index);
    }
    return octets;
  }

  private comparerEnTempsConstant(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    let difference = 0;
    for (let index = 0; index < a.length; index++) {
      difference |= a.charCodeAt(index) ^ b.charCodeAt(index);
    }
    return difference === 0;
  }
}
