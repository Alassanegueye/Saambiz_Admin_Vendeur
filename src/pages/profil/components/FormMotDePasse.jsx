/**
 * Changement de mot de passe.
 *
 * Formulaire séparé de l'identité : le backend révoque toutes les autres
 * sessions à ce changement, ce n'est pas la même conséquence que corriger
 * une faute de frappe dans son prénom.
 */
export default function FormMotDePasse({
  mdp, majMdp, changementMdp, erreurMdp, longueurMin, onEnregistrer,
}) {
  return (
    <form className="card" onSubmit={onEnregistrer}>
      <div className="card-header"><h2 className="card-title">Mot de passe</h2></div>
      <div className="card-body">
        <div className="form-field">
          <label className="form-label" htmlFor="p-ancien">Mot de passe actuel</label>
          <input
            id="p-ancien" type="password" className="form-input" value={mdp.ancien}
            onChange={majMdp('ancien')} autoComplete="current-password" required
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="p-nouveau">Nouveau mot de passe</label>
          <input
            id="p-nouveau" type="password" className="form-input" value={mdp.nouveau}
            onChange={majMdp('nouveau')} autoComplete="new-password" required
          />
        </div>
        <div className="form-field">
          <label className="form-label" htmlFor="p-confirm">Confirmer le nouveau mot de passe</label>
          <input
            id="p-confirm" type="password" className="form-input" value={mdp.confirmation}
            onChange={majMdp('confirmation')} autoComplete="new-password" required
          />
          {erreurMdp && <span className="form-error">{erreurMdp}</span>}
        </div>
        <p className="profil-aide">
          {longueurMin} caractères minimum, avec majuscule, minuscule, chiffre et
          caractère spécial.
        </p>
        <button type="submit" className="btn btn-secondary" disabled={changementMdp}>
          {changementMdp ? 'Modification…' : 'Changer le mot de passe'}
        </button>
      </div>
    </form>
  );
}
