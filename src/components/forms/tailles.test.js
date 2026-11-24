import { describe, it, expect } from 'vitest';
import { optionsProposees, dansLOrdre, TAILLES_VETEMENTS } from './tailles';

const tailles = { cle: 'tailles', libelle: 'Tailles', type: 'variantes', options: [], libre: true };

describe('tailles proposées', () => {
  it('propose les tailles de vêtements pour la mode', () => {
    expect(optionsProposees(tailles, 'mode-femme')).toEqual(TAILLES_VETEMENTS);
    expect(TAILLES_VETEMENTS).toEqual(expect.arrayContaining(['S', 'M', 'L', 'XL', '2XL', '5XL']));
  });

  it('reconnaît la case des vêtements à son aide, sans la catégorie', () => {
    expect(optionsProposees({ ...tailles, aide: 'Ex. S, M, L, XL' }, undefined)).toEqual(TAILLES_VETEMENTS);
  });

  it('ne propose pas S, M, L pour un gâteau', () => {
    expect(optionsProposees({ ...tailles, aide: 'Ex. 6 parts, 10 parts' }, 'patisserie-gateaux')).toEqual([]);
  });

  it('garde les options de l’administrateur quand il en a mis', () => {
    expect(optionsProposees({ ...tailles, options: ['36', '38'] }, 'mode-femme')).toEqual(['36', '38']);
  });

  it('range les tailles dans leur ordre, les tailles tapées à la fin', () => {
    expect(dansLOrdre(['XL', 'Taille unique', 's', 'M'], TAILLES_VETEMENTS)).toEqual(['S', 'M', 'XL', 'Taille unique']);
  });
});
