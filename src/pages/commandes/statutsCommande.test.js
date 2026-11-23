import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { STATUTS, TRANSITIONS, transitionsDepuis, infoStatut } from './statutsCommande';

/**
 * Le cycle de vie d'une commande est décrit des deux côtés : par le modèle et
 * le service du backend, et ici pour l'affichage. Deux copies divergent — c'est
 * arrivé : il manquait `acceptee`, `rejetee` et `payee`, si bien qu'aucun
 * bouton ne permettait d'accepter ni de refuser une commande depuis le web,
 * alors que c'est la première décision que prend un vendeur.
 *
 * Ces tests tiennent les deux copies ensemble. Quand le dépôt de l'API est à
 * côté sur le disque, ils le lisent et comparent ; sinon ils vérifient au
 * moins que la table est cohérente avec elle-même.
 */

// Le dépôt de l'API, quand il est à côté de celui-ci sur le disque.
const BACKEND = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../Saambiz_Back');
const MODELE = resolve(BACKEND, 'src/models/commande.model.js');
const SERVICE = resolve(BACKEND, 'src/services/commandes/commande.service.js');
const backendPresent = existsSync(MODELE) && existsSync(SERVICE);

const codes = STATUTS.map((s) => s.code);

describe('cycle de vie d’une commande', () => {
  it('connaît les dix statuts', () => {
    expect(codes).toEqual([
      'en_attente', 'acceptee', 'rejetee', 'payee', 'confirmee',
      'en_preparation', 'prete', 'en_livraison', 'livree', 'annulee',
    ]);
  });

  it('propose d’accepter ou de refuser une commande en attente', () => {
    expect(transitionsDepuis('en_attente').map((s) => s.code))
      .toEqual(['acceptee', 'rejetee', 'annulee']);
  });

  it('ne propose aucune suite à un statut terminal', () => {
    ['livree', 'annulee', 'rejetee'].forEach((code) => {
      expect(transitionsDepuis(code)).toEqual([]);
    });
  });

  it('ne mène jamais vers un statut inconnu', () => {
    Object.entries(TRANSITIONS).forEach(([depuis, vers]) => {
      expect(codes).toContain(depuis);
      vers.forEach((v) => expect(codes).toContain(v));
    });
  });

  it('décrit chacun des dix statuts, sans code brut à l’écran', () => {
    codes.forEach((code) => {
      expect(infoStatut(code).label).not.toBe(code);
    });
  });

  // ── Comparaison avec le backend, quand il est là ──────────────────────────

  it.runIf(backendPresent)('a exactement les statuts du modèle backend', () => {
    // La parenthèse fermante est celle qui tient seule sa ligne : les
    // commentaires du modèle contiennent eux-mêmes des parenthèses.
    const enum_ = readFileSync(MODELE, 'utf8')
      .match(/statut:\s*\{\s*type:\s*DataTypes\.ENUM\(([\s\S]*?)\n\s*\),/)?.[1];
    expect(enum_, 'ENUM `statut` introuvable dans commande.model.js').toBeTruthy();
    const duBackend = [...enum_.replace(/\/\/.*/g, '').matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
    expect(duBackend).toHaveLength(10);

    expect(new Set(codes)).toEqual(new Set(duBackend));
  });

  it.runIf(backendPresent)('a exactement la table de transitions du backend', () => {
    const source = readFileSync(SERVICE, 'utf8');
    const bloc = source.match(/const TRANSITIONS = \{([\s\S]*?)\n\};/)?.[1];
    expect(bloc, 'table TRANSITIONS introuvable dans commande.service.js').toBeTruthy();

    const duBackend = {};
    for (const ligne of bloc.split('\n')) {
      const m = ligne.match(/^\s*([a-z_]+):\s*\[(.*?)\]/);
      if (m) duBackend[m[1]] = [...m[2].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]);
    }

    expect(TRANSITIONS).toEqual(duBackend);
  });

  it.runIf(backendPresent)('emploie les mêmes libellés que le backend', () => {
    const bloc = readFileSync(SERVICE, 'utf8')
      .match(/const LIBELLES_STATUT = \{([\s\S]*?)\n\};/)?.[1];
    expect(bloc, 'LIBELLES_STATUT introuvable dans commande.service.js').toBeTruthy();

    const duBackend = {};
    for (const ligne of bloc.split('\n')) {
      const m = ligne.match(/^\s*([a-z_]+):\s*'(.+?)'/);
      if (m) duBackend[m[1]] = m[2];
    }

    codes.forEach((code) => {
      expect(infoStatut(code).label, `libellé de « ${code} »`).toBe(duBackend[code]);
    });
  });
});
