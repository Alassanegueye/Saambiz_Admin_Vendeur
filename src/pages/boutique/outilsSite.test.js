import { describe, it, expect } from 'vitest';
import {
  nettoyerAdresse, erreurAdresse, prefixeAdresse, completerLien, egal,
  etatDesEtapes, verifierBrouillon, sectionsRemplies,
} from './outilsSite';

describe('adresse du site', () => {
  it('rend utilisable ce que le vendeur tape', () => {
    expect(nettoyerAdresse('Chez Fatou')).toBe('chez-fatou');
    expect(nettoyerAdresse("L'Atelier de Sañsé")).toBe('l-atelier-de-sanse');
    expect(nettoyerAdresse('Bœuf & Co')).toBe('boeuf-co');
    expect(nettoyerAdresse('  --déjà--là  ')).toBe('deja-la-');
  });

  it('laisse le tiret final le temps de la saisie, puis le refuse', () => {
    expect(nettoyerAdresse('chez-')).toBe('chez-');
    expect(erreurAdresse('chez-')).toMatch(/tiret/);
  });

  it('suit la règle du serveur', () => {
    expect(erreurAdresse('chez-fatou')).toBeNull();
    expect(erreurAdresse('ab')).toMatch(/3 caractères/);
    expect(erreurAdresse('')).toMatch(/3 caractères/);
    expect(erreurAdresse('a'.repeat(61))).not.toBeNull();
  });

  it('montre le début réel de l’adresse, sans protocole', () => {
    expect(prefixeAdresse('https://saambiz.com/b/chez-fatou')).toBe('saambiz.com/b/');
    expect(prefixeAdresse('')).toBe('saambiz.com/b/');
  });
});

describe('liens des réseaux sociaux', () => {
  it('complète une adresse tapée sans https://', () => {
    expect(completerLien('facebook', 'facebook.com/ma-page')).toBe('https://facebook.com/ma-page');
    expect(completerLien('site', 'www.boutique.sn')).toBe('https://www.boutique.sn');
  });

  it('transforme un nom de compte en adresse de profil', () => {
    expect(completerLien('instagram', '@sanse.couture')).toBe('https://instagram.com/sanse.couture');
    expect(completerLien('tiktok', '@sanse')).toBe('https://tiktok.com/@sanse');
    expect(completerLien('snapchat', '@sanse')).toBe('https://snapchat.com/add/sanse');
  });

  it('laisse intacts un lien complet et un champ vide', () => {
    expect(completerLien('facebook', 'https://facebook.com/x')).toBe('https://facebook.com/x');
    expect(completerLien('facebook', '   ')).toBe('');
  });
});

describe('égalité des réglages', () => {
  it('compare en profondeur, sans dépendre de l’ordre des clés', () => {
    expect(egal({ a: 1, b: { c: [1, 2] } }, { b: { c: [1, 2] }, a: 1 })).toBe(true);
    expect(egal({ a: [1, 2] }, { a: [2, 1] })).toBe(false);
    expect(egal({ a: 1 }, { a: 1, b: undefined })).toBe(false);
    expect(egal(null, {})).toBe(false);
  });
});

const BROUILLON = {
  slug: 'chez-fatou',
  modele: 'galerie',
  accent: '#0d1b3d',
  apropos: '',
  horaires: '',
  reseaux: { facebook: '', instagram: '' },
  commande: true,
  paiementLivraison: true,
  sectionsPerso: [],
  blocs: { avantages: [] },
};
const MODELES = [{ cle: 'galerie', nom: 'Galerie' }];
const COULEURS = [{ valeur: '#0D1B3D', nom: 'Bleu marine' }];

describe('état des étapes', () => {
  it('résume l’apparence sans la marquer « faite »', () => {
    const e = etatDesEtapes({ valeurs: BROUILLON, modeles: MODELES, couleurs: COULEURS });
    expect(e.style).toEqual({ fait: false, resume: 'Galerie · Bleu marine' });
  });

  it('signale un site qui ne montre aucun produit', () => {
    const vide = etatDesEtapes({ valeurs: BROUILLON, modeles: MODELES, couleurs: COULEURS });
    expect(vide.sections.aFaire).toBe(true);

    const rempli = etatDesEtapes({
      valeurs: {
        ...BROUILLON,
        sectionsPerso: [
          { id: 's1', titre: 'Nouveautés', produitIds: ['a', 'b'] },
          { id: 's2', titre: 'Promos', produitIds: ['b'] },
          { id: 's3', titre: 'Vide', produitIds: [] },
        ],
      },
      modeles: MODELES,
      couleurs: COULEURS,
    });
    expect(rempli.sections).toEqual({ fait: true, aFaire: false, resume: '3 sections · 2 produits · 1 vide' });
  });

  it('compte photos, avantages et infos', () => {
    const e = etatDesEtapes({
      valeurs: {
        ...BROUILLON,
        horaires: '9h — 20h',
        reseaux: { facebook: 'https://facebook.com/x', instagram: 'https://instagram.com/y' },
        blocs: { avantages: [{ titre: 'Livraison rapide' }, { titre: '  ' }] },
      },
      photos: [{ id: 1 }],
      modeles: MODELES,
      couleurs: COULEURS,
    });
    expect(e.photos.fait).toBe(true);
    expect(e.avantages.resume).toBe('Livraison rapide');
    expect(e.infos.resume).toBe('Horaires, 2 réseaux sociaux');
  });
});

describe('vérification avant l’envoi', () => {
  it('renvoie à l’étape où corriger', () => {
    expect(verifierBrouillon(BROUILLON)).toBeNull();
    expect(verifierBrouillon({ ...BROUILLON, slug: 'a-' }).etape).toBe('commandes');
    expect(verifierBrouillon({
      ...BROUILLON,
      sectionsPerso: [{ id: 's1', titre: 'Ok', produitIds: [] }, { id: 's2', titre: '  ', produitIds: [] }],
    })).toEqual({ etape: 'sections', message: 'Donnez un nom à la section n° 2.' });
  });

  it('ne reproche pas une adresse que le vendeur n’a pas changée', () => {
    // « bo » : l'adresse fabriquée par le serveur pour la boutique « Bo ».
    expect(verifierBrouillon({ ...BROUILLON, slug: 'bo' }, { slugEnregistre: 'bo' })).toBeNull();
    expect(verifierBrouillon({ ...BROUILLON, slug: 'bo' }, { slugEnregistre: 'boutique-bo' }).etape).toBe('commandes');
  });

  it('ne compte que les sections qui montrent un produit', () => {
    expect(sectionsRemplies([{ produitIds: [] }, { produitIds: ['a'] }, {}])).toHaveLength(1);
  });
});
