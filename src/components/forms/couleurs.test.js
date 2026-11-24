/**
 * Les couleurs d'un produit, côté vendeur.
 *
 * Le format est celui de l'API (`specifications.js` dans Saambiz_Back) :
 * ce fichier en est le pendant, et les deux doivent rester d'accord. Les cas
 * ci-dessous sont les mêmes que ceux du test `specificationsCouleurs` de
 * l'API.
 */
import { describe, it, expect } from 'vitest';
import { enCouleurs, nomSuggere, dejaChoisie, NUANCIER, codeDuNom } from './couleurs';

describe('Lecture de la valeur enregistrée', () => {
  it('garde le code et le nom', () => {
    expect(enCouleurs([{ code: '#F2B705', nom: 'Ocre' }]))
      .toEqual([{ code: '#f2b705', nom: 'Ocre' }]);
  });

  it('accepte une ancienne valeur de type texte', () => {
    // Une catégorie passée de « variantes » à « couleurs » : le produit
    // porte encore « Noir, Rouge ». On garde les noms, sans teinte.
    expect(enCouleurs('Noir, Rouge')).toEqual([{ nom: 'Noir' }, { nom: 'Rouge' }]);
  });

  it('écarte un code qui n’en est pas un, sans perdre le nom', () => {
    expect(enCouleurs([{ code: 'bleu-nuit', nom: 'Bleu nuit' }]))
      .toEqual([{ nom: 'Bleu nuit' }]);
  });

  it('ne garde pas deux fois la même teinte', () => {
    expect(enCouleurs([
      { code: '#000000', nom: 'Noir' },
      { code: '#000000', nom: 'Noir profond' },
    ])).toEqual([{ code: '#000000', nom: 'Noir' }]);
  });

  it('ne rend rien d’une valeur vide', () => {
    expect(enCouleurs(null)).toEqual([]);
    expect(enCouleurs('')).toEqual([]);
    expect(enCouleurs([{}, { nom: '  ' }])).toEqual([]);
  });
});

describe('Nom proposé pour une teinte', () => {
  it('reconnaît les teintes de référence', () => {
    expect(nomSuggere('#000000')).toBe('Noir');
    expect(nomSuggere('#ffffff')).toBe('Blanc');
    expect(nomSuggere('#f2b705')).toBe('Ocre');
  });

  it('propose la plus proche pour une teinte quelconque', () => {
    // Un rouge légèrement différent reste « Rouge » : la suggestion doit
    // tomber juste sans que le vendeur ait à la corriger à chaque fois.
    expect(nomSuggere('#c0392c')).toBe('Rouge');
    expect(nomSuggere('#010101')).toBe('Noir');
  });

  it('ne propose rien sur un code illisible', () => {
    expect(nomSuggere('rouge')).toBe('');
    expect(nomSuggere('')).toBe('');
  });
});

describe('Teinte déjà choisie', () => {
  const couleurs = [{ code: '#000000', nom: 'Noir' }, { nom: 'Rouge' }];

  it('reconnaît une teinte présente, quelle que soit la casse', () => {
    expect(dejaChoisie(couleurs, '#000000')).toBe(true);
    expect(dejaChoisie(couleurs, '#000000'.toUpperCase())).toBe(true);
  });

  it('ignore les couleurs sans code', () => {
    expect(dejaChoisie(couleurs, '#c0392b')).toBe(false);
  });
});

describe('Nuancier et noms seuls', () => {
  it('propose des pastilles toutes nommées comme la suggestion', () => {
    NUANCIER.forEach((c) => expect(nomSuggere(c.code), c.nom).toBe(c.nom));
  });

  it('retrouve la teinte d’une couleur connue par son nom', () => {
    expect(codeDuNom('bleu nuit')).toBe('#0d1b3d');
    expect(codeDuNom('Fuchsia électrique')).toBeNull();
  });
});
