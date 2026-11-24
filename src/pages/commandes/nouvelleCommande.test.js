import { describe, it, expect } from 'vitest';
import {
  prixActuel, optionsDuProduit, nouvelleLigne, totalLignes, verifierCommande, versRequete, FORM_VIDE,
} from './nouvelleCommande';

const robe = {
  id: 'p1', nom: 'Robe', prix: 25000, prix_promo: 19900, quantite: 4,
  attributs: { tailles: ['S', 'M', 'M'], couleurs: [{ code: '#000000', nom: 'Noir' }], matiere: 'Wax' },
};

describe('nouvelle commande du vendeur', () => {
  it('prend la promo en cours, sinon le prix', () => {
    expect(prixActuel(robe)).toBe(19900);
    expect(prixActuel({ prix: 100, prix_promo: 150 })).toBe(100);
    expect(prixActuel({ prix: '3000' })).toBe(3000);
  });

  it('ne garde que les listes, sans doublon, couleurs ramenées à leur nom', () => {
    const o = optionsDuProduit(robe);
    expect(o.map((x) => x.libelle)).toEqual(['Taille', 'Couleur']);
    expect(o[0].valeurs.map((v) => v.valeur)).toEqual(['S', 'M']);
    expect(o[1].valeurs[0]).toEqual({ valeur: 'Noir', code: '#000000' });
  });

  it('choisit d’office une option à valeur unique', () => {
    const l = nouvelleLigne(robe);
    expect(l.choix).toEqual({ couleurs: 'Noir' });
    expect(l.prix).toBe(19900);
    expect(l.stock).toBe(4);
  });

  it('exige client, téléphone, produits et options', () => {
    const l = nouvelleLigne(robe);
    const e = verifierCommande(FORM_VIDE, [l]);
    expect(Object.keys(e).sort()).toEqual(['lignes', 'prenom', 'telephone']);
    expect(e.lignes).toMatch(/taille/);
    expect(verifierCommande(FORM_VIDE, []).lignes).toMatch(/au moins/);
    const ok = { ...FORM_VIDE, prenom: 'Awa', telephone: '77 123 45 67' };
    expect(verifierCommande(ok, [{ ...l, choix: { ...l.choix, tailles: 'M' } }])).toEqual({});
    expect(verifierCommande({ ...ok, modeLivraison: 'livraison' }, [{ ...l, choix: { tailles: 'M', couleurs: 'Noir' } }]))
      .toHaveProperty('adresseLivraison');
  });

  it('construit le corps de la requête', () => {
    const l = { ...nouvelleLigne(robe), quantite: 2, choix: { tailles: 'M', couleurs: 'Noir' } };
    const r = versRequete({ ...FORM_VIDE, prenom: ' Awa ', telephone: '771234567', adresseLivraison: 'x' }, [l]);
    expect(r).toEqual({
      client: { prenom: 'Awa', nom: null, telephone: '771234567', email: null },
      items: [{ produitId: 'p1', quantite: 2, options: { tailles: 'M', couleurs: 'Noir' } }],
      modeLivraison: 'retrait',
      adresseLivraison: null,
      note: null,
    });
    expect(totalLignes([l])).toBe(39800);
  });
});
