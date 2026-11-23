import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LONGUEUR_MIN, erreurMotDePasse, AIDE_MOT_DE_PASSE } from './motDePasse';

/**
 * L'espace vendeur exigeait douze caractères et une minuscule ; le serveur en
 * demande huit, sans minuscule obligatoire. Un mot de passe accepté par
 * l'application mobile était donc refusé ici, sur le même compte.
 */

const VALIDATEUR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../Saambiz_Back/src/validators/auth.validator.js',
);

describe('politique de mot de passe', () => {
  it('accepte un mot de passe conforme', () => {
    expect(erreurMotDePasse('Abcdef1!')).toBeNull();
    expect(erreurMotDePasse('MotDePasse2026!')).toBeNull();
  });

  it('nomme ce qui manque, au lieu de répéter la règle', () => {
    expect(erreurMotDePasse('abcdefg1!')).toBe('Il manque une majuscule.');
    expect(erreurMotDePasse('Abc1!')).toBe('Il manque 8 caractères.');
    expect(erreurMotDePasse('abcdefgh')).toBe('Il manque une majuscule, un chiffre et un caractère spécial.');
  });

  it('n’exige pas de minuscule, le serveur non plus', () => {
    expect(erreurMotDePasse('ABCDEF1!')).toBeNull();
  });

  it.runIf(existsSync(VALIDATEUR))('exige la même longueur que le serveur', () => {
    const source = readFileSync(VALIDATEUR, 'utf8');
    const min = Number(source.match(/Joi\.string\(\)\s*\n?\s*\.min\((\d+)\)/)?.[1]);
    expect(min, 'longueur minimale introuvable dans auth.validator.js').toBeGreaterThan(0);
    expect(LONGUEUR_MIN).toBe(min);
    expect(AIDE_MOT_DE_PASSE).toContain(String(min));
  });
});
