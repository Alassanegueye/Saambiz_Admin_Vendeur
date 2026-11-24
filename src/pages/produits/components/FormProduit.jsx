import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import ChampsSpecifications from '../../../components/forms/ChampsSpecifications';
import ApercuFichier from './ApercuFichier';
import { MAX_IMAGES_SUPPLEMENTAIRES } from '../../../service/vendeur.service';

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
  images = [],
  setImages,
  estModification,
  produit,
  onSupprimerImage,
  suppressionImageId,
}) {
  const majChamp = (champ) => (e) => setValeurs({ ...valeurs, [champ]: e.target.value });
  // Changer de catégorie change les caractéristiques à renseigner : celles
  // de l'ancienne catégorie n'ont plus de sens (des pointures pour un jus).
  const majCategorie = (e) => setValeurs({ ...valeurs, categorieId: e.target.value, attributs: {} });
  const categorie = categories.find((c) => c.id === valeurs.categorieId);
  const specifications = categorie?.specifications || [];
  const champPrincipale = useRef(null);
  const champSupplementaires = useRef(null);
  const place = MAX_IMAGES_SUPPLEMENTAIRES - images.length;
  // Un tissu se vend au mètre, au yard, à la pièce… : le prix le dit.
  const unite = typeof valeurs.attributs?.unite === 'string' ? valeurs.attributs.unite : '';
  const parUnite = unite ? ` par ${unite.charAt(0).toLowerCase()}${unite.slice(1)}` : '';

  // Les photos choisies s'ajoutent aux précédentes au lieu de les remplacer :
  // on peut en prendre une, puis une autre, sans tout reprendre.
  const ajouterPhotos = (fichiers) => {
    const nouvelles = Array.from(fichiers || []);
    if (nouvelles.length) setImages([...images, ...nouvelles]);
  };
  const retirerPhoto = (i) => setImages(images.filter((_, j) => j !== i));

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
          <label className="form-label" htmlFor="p-prix">Prix (FCFA){parUnite}</label>
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
          {unite && <span className="form-hint">Comptée dans la même unité que le prix.</span>}
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
        categorie={categorie?.slug}
      />

      {/* Photo principale : elle se voit dès qu'elle est choisie. Sans
          aperçu, le vendeur ne savait pas s'il avait pris la bonne. */}
      <div className="form-field">
        <span className="form-label">Photo principale</span>
        <div className="photo-principale">
          {image ? (
            <ApercuFichier fichier={image} grand alt="Nouvelle photo principale" />
          ) : estModification && produit?.image ? (
            <img className="photo-principale__image" src={produit.image} alt="Photo actuelle du produit" />
          ) : (
            <button type="button" className="photo-principale__vide" onClick={() => champPrincipale.current?.click()}>
              <ImagePlus size={28} strokeWidth={1.8} aria-hidden="true" />
              <span>Ajouter la photo</span>
            </button>
          )}
          <div className="photo-principale__actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => champPrincipale.current?.click()}>
              {image || (estModification && produit?.image) ? 'Changer la photo' : 'Choisir une photo'}
            </button>
            {image && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setImage(null)}>
                {estModification && produit?.image ? 'Garder l’ancienne' : 'Retirer'}
              </button>
            )}
            <span className="form-hint">
              C'est elle que vos clients voient en premier. JPEG ou PNG, 5 Mo au plus.
            </span>
          </div>
        </div>
        <input
          ref={champPrincipale}
          id="p-img"
          type="file"
          accept="image/png,image/jpeg"
          hidden
          onChange={(e) => { setImage(e.target.files?.[0] || null); e.target.value = ''; }}
        />
      </div>

      <div className="form-field">
        <span className="form-label">Photos supplémentaires</span>
        <ul className="photos-ajoutees">
          {images.map((f, i) => (
            <li key={`${f.name}-${f.lastModified}-${i}`}>
              <ApercuFichier fichier={f} alt={`Photo supplémentaire ${i + 1}`} />
              <button type="button" className="photos-ajoutees__retirer" onClick={() => retirerPhoto(i)}
                aria-label={`Retirer la photo ${i + 1}`} title="Retirer">
                <X size={14} strokeWidth={2.6} aria-hidden="true" />
              </button>
            </li>
          ))}
          {place > 0 && (
            <li>
              <button type="button" className="photos-ajoutees__ajouter" onClick={() => champSupplementaires.current?.click()}>
                <ImagePlus size={22} strokeWidth={1.8} aria-hidden="true" />
                <span>Ajouter</span>
              </button>
            </li>
          )}
        </ul>
        <input
          ref={champSupplementaires}
          id="p-imgs"
          type="file"
          accept="image/png,image/jpeg"
          multiple
          hidden
          onChange={(e) => { ajouterPhotos(e.target.files); e.target.value = ''; }}
        />
        <span className="form-hint">
          {MAX_IMAGES_SUPPLEMENTAIRES} photos au maximum, 5 Mo chacune, en JPEG ou PNG
          {images.length > 0 && ` — ${images.length} choisie${images.length > 1 ? 's' : ''}`}.
        </span>
        {erreurs.images && <span className="form-error">{erreurs.images}</span>}

        {/* Les photos déjà en ligne, et de quoi en retirer une. L'adresse
            existait côté API et l'application mobile s'en sert ; ici, une
            photo ratée restait sur la fiche pour toujours. */}
        {estModification && produit?.images?.length > 0 && (
          <span className="form-hint photos-existantes__titre">Déjà sur la fiche du produit :</span>
        )}
        {estModification && produit?.images?.length > 0 && (
          <ul className="photos-existantes">
            {produit.images.map((img) => (
              <li key={img.id}>
                <img src={img.url} alt="" loading="lazy" />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={suppressionImageId === img.id}
                  onClick={() => onSupprimerImage(img)}
                >
                  {suppressionImageId === img.id ? 'Retrait…' : 'Retirer'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
