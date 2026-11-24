/**
 * La barre d'enregistrement, collée au bas de l'écran.
 *
 * Un seul bouton « Enregistrer » pour tout le site, qui n'apparaît que s'il
 * y a quelque chose à enregistrer — le vendeur ne se demande jamais si ses
 * changements sont partis. Tant que le site n'est pas publié, elle porte
 * aussi « Publier mon site ».
 */
export default function BarreEnregistrement({ modifie, premiere, saving, onEnregistrer, onAnnuler, onPublier }) {
  if (!premiere && !modifie) return null;

  return (
    <div className="barre-site" role="region" aria-label="Enregistrer votre site">
      <p className="barre-site__texte">
        {premiere
          ? (modifie ? 'Modifications non enregistrées. Votre site n’est pas encore en ligne.' : 'Votre site n’est pas encore en ligne.')
          : 'Vous avez des modifications non enregistrées.'}
      </p>
      <div className="barre-site__boutons">
        {modifie && (
          <button type="button" className="btn btn-ghost" onClick={onAnnuler} disabled={saving}>
            Annuler
          </button>
        )}
        {premiere ? (
          <>
            <button type="button" className="btn btn-secondary" onClick={onEnregistrer} disabled={saving || !modifie}>
              Enregistrer le brouillon
            </button>
            <button type="button" className="btn btn-accent" onClick={onPublier} disabled={saving}>
              {saving ? 'Un instant…' : 'Publier mon site'}
            </button>
          </>
        ) : (
          <button type="button" className="btn btn-primary" onClick={onEnregistrer} disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        )}
      </div>
    </div>
  );
}
