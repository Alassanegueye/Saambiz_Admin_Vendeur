/** Coordonnées du vendeur — son compte, pas sa boutique. */
export default function FormIdentite({ profil, majChamp, enregistrement, onEnregistrer }) {
  return (
    <form className="card" onSubmit={onEnregistrer}>
      <div className="card-header"><h2 className="card-title">Informations personnelles</h2></div>
      <div className="card-body">
        <div className="profil-champs">
          <div className="form-field">
            <label className="form-label" htmlFor="p-prenom">Prénom</label>
            <input
              id="p-prenom" className="form-input" value={profil.prenom}
              onChange={majChamp('prenom')} autoComplete="given-name"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="p-nom">Nom</label>
            <input
              id="p-nom" className="form-input" value={profil.nom}
              onChange={majChamp('nom')} autoComplete="family-name"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="p-email">Adresse email</label>
            <input
              id="p-email" type="email" className="form-input" value={profil.email}
              onChange={majChamp('email')} autoComplete="email"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="p-tel">Téléphone</label>
            <input
              id="p-tel" className="form-input" value={profil.telephone}
              onChange={majChamp('telephone')} placeholder="+221 77 000 00 00"
              autoComplete="tel"
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="p-ville">Ville</label>
            <input
              id="p-ville" className="form-input" value={profil.ville}
              onChange={majChamp('ville')} placeholder="Dakar"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={enregistrement}>
          {enregistrement ? 'Enregistrement…' : 'Enregistrer les modifications'}
        </button>
      </div>
    </form>
  );
}
