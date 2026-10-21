import ChoixIcone from '../components/ChoixIcone';
import IconeVitrine from '../components/IconeVitrine';
import { ICONES_AVANTAGES, AVANTAGES_SUGGERES } from '../iconesVitrine';

/**
 * Le bandeau des avantages (« Livraison rapide », « Paiement sécurisé »…) :
 * jusqu'à quatre, chacun avec une icône choisie dans la liste. Aucun
 * avantage, pas de bandeau.
 */
export default function EtapeAvantages({ avantages, onChange }) {
  const maj = (i, champ, val) => onChange(avantages.map((a, j) => (j === i ? { ...a, [champ]: val } : a)));
  const retirer = (i) => onChange(avantages.filter((_, j) => j !== i));
  const suggestions = AVANTAGES_SUGGERES.filter((s) => !avantages.some((a) => a.titre === s.titre));

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Vos avantages</h3>
          <p className="form-hint vitrine-sans-marge">Ce qui rassure vos clients, sous vos produits. Jusqu'à 4.</p>
        </div>
      </div>
      <div className="card-body">
        {avantages.length === 0 && (
          <p className="vitrine-vide"><strong>Aucun avantage.</strong> Le bandeau n'apparaît pas sur votre site.</p>
        )}

        {avantages.map((a, i) => (
          <div key={i} className="vitrine-avantage">
            <ChoixIcone valeur={a.icone} options={ICONES_AVANTAGES} libelle={a.titre}
              onChange={(cle) => maj(i, 'icone', cle)} />
            <div className="vitrine-avantage__champs">
              <input className="form-input" maxLength={40} value={a.titre} placeholder="Titre"
                aria-label={`Titre de l'avantage ${i + 1}`} onChange={(e) => maj(i, 'titre', e.target.value)} />
              <input className="form-input" maxLength={60} value={a.texte} placeholder="Précision (facultatif)"
                aria-label={`Précision de l'avantage ${i + 1}`} onChange={(e) => maj(i, 'texte', e.target.value)} />
            </div>
            <button type="button" className="btn btn-ghost btn-sm vitrine-danger" onClick={() => retirer(i)}
              aria-label={`Supprimer l'avantage ${a.titre || i + 1}`}>Supprimer</button>
          </div>
        ))}

        {avantages.length < 4 && (
          <>
            <p className="form-label vitrine-marge-haut">Ajouter</p>
            <div className="vitrine-suggestions">
              {suggestions.map((s) => (
                <button key={s.titre} type="button" className="vitrine-suggestion" onClick={() => onChange([...avantages, { ...s }])}>
                  <IconeVitrine cle={s.icone} size={18} /> {s.titre}
                </button>
              ))}
              <button type="button" className="vitrine-suggestion"
                onClick={() => onChange([...avantages, { icone: 'etoile', titre: '', texte: '' }])}>
                + Un autre
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
