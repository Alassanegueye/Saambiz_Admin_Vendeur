import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { STATUTS_PAIEMENT, infoPaiement, MOYENS, nomMoyen } from './statutPaiement';

/**
 * L'historique des paiements lisait des statuts qui n'existent pas côté
 * serveur. Ces tests comparent les deux vocabulaires quand le dépôt de l'API
 * est à côté sur le disque, et tiennent les libellés français autrement.
 */

const BACKEND = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../Saambiz_Back');
const MODELE = resolve(BACKEND, 'src/models/paiement.model.js');
const CONTROLEUR = resolve(BACKEND, 'src/controllers/paiement/paiement.controller.js');

describe('statuts et moyens de paiement', () => {
  it('traduit les quatre statuts, sans mot anglais à l’écran', () => {
    expect(Object.keys(STATUTS_PAIEMENT)).toEqual(['pending', 'success', 'failed', 'cancelled']);
    expect(infoPaiement('success')).toEqual({ label: 'Réussi', variant: 'success' });
    expect(infoPaiement('pending').label).toBe('En attente');
    expect(infoPaiement('failed').variant).toBe('danger');
  });

  it('ne casse pas sur un statut inconnu ou absent', () => {
    expect(infoPaiement(undefined).label).toBe('—');
    expect(infoPaiement('autre_chose').variant).toBe('default');
  });

  it('nomme les deux opérateurs', () => {
    expect(nomMoyen('wave')).toBe('Wave');
    expect(nomMoyen('orange_money')).toBe('Orange Money');
    expect(nomMoyen(null)).toBe('—');
  });

  it.runIf(existsSync(MODELE))('a exactement les statuts du modèle backend', () => {
    const ligne = readFileSync(MODELE, 'utf8')
      .match(/statut:\s*\{\s*type:\s*DataTypes\.ENUM\(([^)]*)\)/)?.[1];
    expect(ligne, 'ENUM `statut` introuvable dans paiement.model.js').toBeTruthy();
    const duBackend = [...ligne.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);

    expect(new Set(Object.keys(STATUTS_PAIEMENT))).toEqual(new Set(duBackend));
  });

  it.runIf(existsSync(CONTROLEUR))('n’offre que les méthodes que le serveur accepte', () => {
    const ligne = readFileSync(CONTROLEUR, 'utf8')
      .match(/METHODES_SUPPORTEES\s*=\s*\[([^\]]*)\]/)?.[1];
    expect(ligne, 'METHODES_SUPPORTEES introuvable').toBeTruthy();
    const duBackend = [...ligne.matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);

    expect(new Set(Object.keys(MOYENS))).toEqual(new Set(duBackend));
  });
});
