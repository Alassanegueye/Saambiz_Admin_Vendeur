import { formatMontant } from '../../../utils/formatters';

/** Champs d'une promotion — création et modification partagent le formulaire. */
export default function FormPromotion({ valeurs, setValeurs, erreurs, produits }) {
  const majChamp = (champ) => (e) => setValeurs({ ...valeurs, [champ]: e.target.value });

  return (
    <>
      <div className="form-field">
        <label className="form-label" htmlFor="pr-titre">Titre</label>
        <input
          id="pr-titre"
          className="form-input"
          value={valeurs.titre}
          onChange={majChamp('titre')}
          placeholder="Ex. Promo spéciale Tabaski"
        />
        {erreurs.titre && <span className="form-error">{erreurs.titre}</span>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="pr-produit">Produit concerné</label>
        <select
          id="pr-produit"
          className="form-input"
          value={valeurs.produitId}
          onChange={majChamp('produitId')}
        >
          <option value="">— Choisir —</option>
          {produits.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} — {formatMontant(p.prix)}
            </option>
          ))}
        </select>
        {erreurs.produitId && <span className="form-error">{erreurs.produitId}</span>}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="pr-prix">Prix promotionnel (FCFA)</label>
        <input
          id="pr-prix"
          className="form-input"
          type="number"
          min="0"
          value={valeurs.prixPromo}
          onChange={majChamp('prixPromo')}
        />
        {erreurs.prixPromo && <span className="form-error">{erreurs.prixPromo}</span>}
      </div>

      <div className="form-duo">
        <div className="form-field">
          <label className="form-label" htmlFor="pr-debut">Début</label>
          <input
            id="pr-debut"
            className="form-input"
            type="date"
            value={valeurs.dateDebut}
            onChange={majChamp('dateDebut')}
          />
          {erreurs.dateDebut && <span className="form-error">{erreurs.dateDebut}</span>}
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="pr-fin">Fin</label>
          <input
            id="pr-fin"
            className="form-input"
            type="date"
            value={valeurs.dateFin}
            onChange={majChamp('dateFin')}
          />
          {erreurs.dateFin && <span className="form-error">{erreurs.dateFin}</span>}
        </div>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="pr-desc">Message aux clients</label>
        <textarea
          id="pr-desc"
          className="form-textarea"
          rows={3}
          value={valeurs.description}
          onChange={majChamp('description')}
          placeholder="Ce texte accompagne la notification envoyée à vos abonnés."
        />
      </div>
    </>
  );
}
