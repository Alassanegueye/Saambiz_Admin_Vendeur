import ChampsSpecifications from '../../../components/forms/ChampsSpecifications';

/**
 * Champs du produit, présentés dans la modale de création comme dans celle de
 * modification. Un seul formulaire pour les deux : les champs sont identiques,
 * seuls le titre et le libellé du bouton changent — et ils vivent dans la
 * modale, pas ici.
 */
export default function FormProduit({
  valeurs,
  setValeurs,
  erreurs,
  categories,
  image,
  setImage,
  setImages,
  estModification,
}) {
  const majChamp = (champ) => (e) => setValeurs({ ...valeurs, [champ]: e.target.value });
  // Changer de catégorie change les caractéristiques à renseigner : celles
  // de l'ancienne catégorie n'ont plus de sens (des pointures pour un jus).
  const majCategorie = (e) => setValeurs({ ...valeurs, categorieId: e.target.value, attributs: {} });
  const specifications = categories.find((c) => c.id === valeurs.categorieId)?.specifications || [];

  return (
    <>
      <div className="form-field">
        <label className="form-label" htmlFor="p-nom">Nom du produit</label>
        <input
          id="p-nom"
          className="form-input"
          value={valeurs.nom}
          onChange={majChamp('nom')}
          placeholder="Ex. Escarpins Chic"
        />
        {erreurs.nom && <span className="form-error">{erreurs.nom}</span>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="p-desc">Description</label>
        <textarea
          id="p-desc"
          className="form-textarea"
          rows={3}
          value={valeurs.description}
          onChange={majChamp('description')}
          placeholder="Ce qui rend ce produit unique…"
        />
      </div>

      <div className="form-duo">
        <div className="form-field">
          <label className="form-label" htmlFor="p-prix">Prix (FCFA)</label>
          <input
            id="p-prix"
            className="form-input"
            type="number"
            min="0"
            value={valeurs.prix}
            onChange={majChamp('prix')}
          />
          {erreurs.prix && <span className="form-error">{erreurs.prix}</span>}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="p-qte">Quantité en stock</label>
          <input
            id="p-qte"
            className="form-input"
            type="number"
            min="0"
            value={valeurs.quantite}
            onChange={majChamp('quantite')}
          />
          {erreurs.quantite && <span className="form-error">{erreurs.quantite}</span>}
        </div>
      </div>

      {/* Le champ n'apparaît que si le référentiel a pu être chargé : sans
          catégories, un sélecteur vide n'aide personne. */}
      {categories.length > 0 && (
        <div className="form-field">
          <label className="form-label" htmlFor="p-cat">Catégorie</label>
          <select
            id="p-cat"
            className="form-input"
            value={valeurs.categorieId}
            onChange={majCategorie}
          >
            <option value="">— Choisir —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
          {erreurs.categorieId && <span className="form-error">{erreurs.categorieId}</span>}
        </div>
      )}

      <ChampsSpecifications
        specifications={specifications}
        valeurs={valeurs.attributs || {}}
        onChange={(attributs) => setValeurs({ ...valeurs, attributs })}
        erreurs={erreurs.attributs || {}}
      />

      <div className="form-field">
        <label className="form-label" htmlFor="p-img">Photo principale</label>
        <input
          id="p-img"
          className="form-input"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
        {estModification && !image && (
          <span className="form-hint">Laissez vide pour conserver la photo actuelle.</span>
        )}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="p-imgs">Photos supplémentaires</label>
        <input
          id="p-imgs"
          className="form-input"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files || []))}
        />
      </div>
    </>
  );
}
