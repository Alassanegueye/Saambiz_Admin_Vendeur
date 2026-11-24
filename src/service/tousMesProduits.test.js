import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Les produits proposés pour les sections du site.
 *
 * L'API plafonne une page à cent produits : la page « Sections du site »
 * demandait « limit: 200 », en recevait cent, et le cent-unième produit
 * n'était jamais proposable. On parcourt maintenant les pages.
 */

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock('./api', () => ({
  default: { get, post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const { getTousMesProduits } = await import('./vendeur.service');

const page = (debut, n, pages) => ({
  data: { produits: Array.from({ length: n }, (_, i) => ({ id: `p${debut + i}` })), pages },
});

describe('tous les produits du vendeur', () => {
  // Accolades : une fonction rendue par beforeEach est rappelée en fin de test.
  beforeEach(() => { get.mockReset(); });

  it('parcourt les pages jusqu’à la dernière', async () => {
    get
      .mockResolvedValueOnce(page(0, 100, 3))
      .mockResolvedValueOnce(page(100, 100, 3))
      .mockResolvedValueOnce(page(200, 20, 3));

    const produits = await getTousMesProduits();

    expect(produits).toHaveLength(220);
    expect(get).toHaveBeenCalledTimes(3);
    expect(get.mock.calls[1][1]).toEqual({ params: { page: 2, limit: 100 } });
  });

  it('s’arrête sur une page incomplète, même sans nombre de pages', async () => {
    get.mockResolvedValueOnce({ data: { produits: [{ id: 'a' }, { id: 'b' }] } });
    expect(await getTousMesProduits()).toHaveLength(2);
    expect(get).toHaveBeenCalledTimes(1);
  });

  it('ne dépasse pas le plafond demandé', async () => {
    get.mockImplementation((_, { params }) => Promise.resolve(page((params.page - 1) * 100, 100, 99)));
    const produits = await getTousMesProduits({ max: 250 });
    expect(produits).toHaveLength(250);
    expect(get).toHaveBeenCalledTimes(3);
  });

  it('rend une liste vide pour un vendeur sans produit', async () => {
    get.mockResolvedValueOnce({ data: { produits: [], pages: 1 } });
    expect(await getTousMesProduits()).toEqual([]);
  });
});
