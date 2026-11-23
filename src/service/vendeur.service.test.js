import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Le contrat d'envoi des photos d'un produit.
 *
 * Il a déjà été cassé une fois : le formulaire joignait les photos
 * supplémentaires au produit lui-même, sous le champ « images ». Les deux
 * routes du produit sont déclarées `upload.single('image')` côté backend, qui
 * rejetait donc la requête entière — « Champ de fichier inattendu : images »,
 * renvoyé en 413 — et le produit n'était pas créé du tout.
 *
 * Ces tests tiennent les deux moitiés du contrat : une seule photo avec le
 * produit, les autres sur leur propre adresse.
 */

const { post, put } = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn() }));

vi.mock('./api', () => ({
  default: { post, put, get: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const { creerProduit, modifierProduit } = await import('./vendeur.service');

const photo = (nom) => new File([new Uint8Array([1, 2, 3])], nom, { type: 'image/png' });

const VALEURS = { nom: 'Escarpins', prix: 15000 };

describe('envoi des photos d’un produit', () => {
  beforeEach(() => {
    post.mockReset();
    put.mockReset();
    post.mockResolvedValue({ data: { produit: { id: '42' } } });
    put.mockResolvedValue({ data: { produit: { id: '42' } } });
  });

  it('ne joint pas les photos supplémentaires au produit créé', async () => {
    await creerProduit(VALEURS, { image: photo('principale.png'), images: [photo('a.png')] });

    const [adresse, corps] = post.mock.calls[0];
    expect(adresse).toBe('/vendeur/ajout-produit');
    expect(corps.get('image')?.name).toBe('principale.png');
    // Le champ qui faisait tout échouer.
    expect(corps.getAll('images')).toEqual([]);
  });

  it('envoie les photos supplémentaires sur leur propre adresse', async () => {
    await creerProduit(VALEURS, {
      image: photo('principale.png'),
      images: [photo('a.png'), photo('b.png')],
    });

    expect(post).toHaveBeenCalledTimes(2);
    const [adresse, corps] = post.mock.calls[1];
    expect(adresse).toBe('/vendeur/produit/42/images');
    expect(corps.getAll('images').map((f) => f.name)).toEqual(['a.png', 'b.png']);
  });

  it('n’envoie pas de seconde requête quand il n’y a pas de photo supplémentaire', async () => {
    await creerProduit(VALEURS, { image: photo('principale.png'), images: [] });
    expect(post).toHaveBeenCalledTimes(1);
  });

  it('ne garde que les huit premières photos, plafond du backend', async () => {
    const dix = Array.from({ length: 10 }, (_, i) => photo(`p${i}.png`));
    await creerProduit(VALEURS, { image: null, images: dix });

    expect(post.mock.calls[1][1].getAll('images')).toHaveLength(8);
  });

  it('rend l’échec des photos sans faire passer le produit pour non créé', async () => {
    post.mockReset();
    post.mockResolvedValueOnce({ data: { produit: { id: '42' } } });
    post.mockRejectedValueOnce(new Error('coupure réseau'));

    // Ne lève pas : le produit existe, c'est l'appelant qui le dira.
    const { produit, erreurImages } = await creerProduit(VALEURS, {
      image: photo('principale.png'),
      images: [photo('a.png')],
    });

    expect(produit.id).toBe('42');
    expect(erreurImages).toBeInstanceOf(Error);
  });

  it('suit le même chemin à la modification', async () => {
    await modifierProduit('42', VALEURS, { image: photo('p.png'), images: [photo('a.png')] });

    expect(put.mock.calls[0][0]).toBe('/vendeur/modifier-produit/42');
    expect(put.mock.calls[0][1].getAll('images')).toEqual([]);
    expect(post.mock.calls[0][0]).toBe('/vendeur/produit/42/images');
  });
});
