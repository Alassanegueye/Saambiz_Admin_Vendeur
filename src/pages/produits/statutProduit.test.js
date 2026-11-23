import { describe, it, expect } from 'vitest';
import { statutProduit, visiblePourLesClients, enModeration } from './statutProduit';

/**
 * Un produit refusé par la modération n'est ni vendable ni visible : depuis
 * que le backend l'exclut du catalogue, il disparaît pour les clients. Le web
 * l'affichait pourtant « En vente », sans rien dire au vendeur — qui pouvait
 * attendre des commandes indéfiniment. Ces tests tiennent l'ordre des causes,
 * le même que celui de l'application mobile.
 */

const produit = (p = {}) => ({ statut: 'approuve', disponible: true, quantite: 10, ...p });

describe('état d’un produit vu par son vendeur', () => {
  it('annonce le refus de la modération avant tout le reste', () => {
    const p = produit({ statut: 'rejete', disponible: true, quantite: 10 });
    expect(statutProduit(p).label).toBe('Refusé par la modération');
    expect(statutProduit(p).variant).toBe('danger');
  });

  it('annonce l’attente de validation avant le stock', () => {
    const p = produit({ statut: 'en_attente', quantite: 0 });
    expect(statutProduit(p).label).toBe('En attente de validation');
  });

  it('distingue retiré, rupture et en vente', () => {
    expect(statutProduit(produit({ disponible: false })).label).toBe('Retiré');
    expect(statutProduit(produit({ quantite: 0 })).label).toBe('Rupture');
    expect(statutProduit(produit()).label).toBe('En vente');
  });

  it('traite un produit sans statut comme approuvé', () => {
    const p = { disponible: true, quantite: 4 };
    expect(statutProduit(p).label).toBe('En vente');
    expect(enModeration(p)).toBe(false);
  });

  it('ne compte pas un produit en modération parmi les visibles', () => {
    expect(visiblePourLesClients(produit())).toBe(true);
    expect(visiblePourLesClients(produit({ statut: 'rejete' }))).toBe(false);
    expect(visiblePourLesClients(produit({ statut: 'en_attente' }))).toBe(false);
    expect(visiblePourLesClients(produit({ disponible: false }))).toBe(false);
    expect(visiblePourLesClients(produit({ quantite: 0 }))).toBe(false);
  });

  it('reconnaît les deux seuls états de modération', () => {
    expect(enModeration(produit({ statut: 'rejete' }))).toBe(true);
    expect(enModeration(produit({ statut: 'en_attente' }))).toBe(true);
    expect(enModeration(produit({ statut: 'approuve' }))).toBe(false);
  });
});
