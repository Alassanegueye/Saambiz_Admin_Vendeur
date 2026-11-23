import { describe, it, expect } from 'vitest';
import { PRODUITS_DEMO, COMMANDES_DEMO, ABONNEMENT_DEMO } from './donnees';
import { STATUTS } from '../../pages/commandes/statutsCommande';
import { STATUTS_PAIEMENT, MOYENS } from '../../pages/abonnement/statutPaiement';

/**
 * Le mode démo sert à montrer l'application sans serveur. S'il invente des
 * valeurs que l'API n'emploie pas, il ment : il a longtemps affiché une
 * commande « expediee », statut absent du modèle backend, et donnait aux
 * produits un champ `statutValidation` qui appartient au vendeur et non au
 * produit. Le jeu de démonstration doit parler la même langue que l'API.
 */

const codesCommande = STATUTS.map((s) => s.code);

describe('le jeu de démonstration parle la langue de l’API', () => {
  it('n’emploie que des statuts de commande qui existent', () => {
    COMMANDES_DEMO.forEach((c) => {
      expect(codesCommande, `commande ${c.reference}`).toContain(c.statut);
    });
  });

  it('n’emploie que des statuts de paiement de commande qui existent', () => {
    COMMANDES_DEMO.forEach((c) => {
      expect(['non_paye', 'paye', 'rembourse']).toContain(c.statutPaiement);
    });
  });

  it('donne aux produits le champ de modération de l’API', () => {
    PRODUITS_DEMO.forEach((p) => {
      expect(p, `produit ${p.nom}`).not.toHaveProperty('statutValidation');
      expect(['en_attente', 'approuve', 'rejete'], `produit ${p.nom}`).toContain(p.statut);
    });
  });

  it('décrit les paiements comme le modèle backend', () => {
    ABONNEMENT_DEMO.historique.forEach((p) => {
      expect(Object.keys(STATUTS_PAIEMENT), `paiement ${p.id}`).toContain(p.statut);
      expect(Object.keys(MOYENS), `paiement ${p.id}`).toContain(p.methode);
    });
  });
});
