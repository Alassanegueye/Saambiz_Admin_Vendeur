import { Link } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

const nouvelId = () => `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * Les sections du site : le vendeur les crée, les renomme, les range et les
 * supprime ici. Les produits de chaque section se choisissent ensuite dans
 * la page « Sections du site ». Une section sans produit n'apparaît pas pour
 * les clients.
 */
export default function SectionsPerso({ sections, onChange }) {
  const maj = (i, champ, valeur) => onChange(sections.map((s, j) => (j === i ? { ...s, [champ]: valeur } : s)));
  const ajouter = () => onChange([...sections, { id: nouvelId(), titre: 'Nouvelle section', produitIds: [] }]);
  const retirer = (i) => onChange(sections.filter((_, j) => j !== i));
  const deplacer = (i, sens) => {
    const j = i + sens;
    if (j < 0 || j >= sections.length) return;
    const copie = [...sections];
    [copie[i], copie[j]] = [copie[j], copie[i]];
    onChange(copie);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Mes sections</h3>
          <p className="form-hint vitrine-sans-marge">Votre site n'affiche que vos sections, dans cet ordre.</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={ajouter} disabled={sections.length >= 12}>
          + Créer une section
        </button>
      </div>
      <div className="card-body">
        {sections.length === 0 ? (
          <div className="vitrine-vide">
            <p><strong>Aucune section pour l'instant.</strong> Votre site est vide.</p>
            <p className="form-hint">Créez une section (« Nouvelle collection », « Promo du mois »…), donnez-lui un nom, puis choisissez ses produits.</p>
          </div>
        ) : (
          <ul className="sections-perso">
            {sections.map((s, i) => {
              const n = (s.produitIds || []).length;
              return (
                <li key={s.id} className="sections-perso__ligne">
                  <div className="sections-perso__haut">
                    <input
                      className="form-input"
                      value={s.titre}
                      maxLength={60}
                      onChange={(e) => maj(i, 'titre', e.target.value)}
                      aria-label={`Nom de la section ${i + 1}`}
                      placeholder="Nom de la section"
                    />
                    <div className="sections-perso__ordre">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label="Monter">↑</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => deplacer(i, 1)} disabled={i === sections.length - 1} aria-label="Descendre">↓</button>
                    </div>
                  </div>
                  <div className="sections-perso__actions">
                    <span className="form-hint vitrine-sans-marge">
                      {n === 0 ? 'Aucun produit — invisible pour vos clients' : `${n} produit${n > 1 ? 's' : ''}`}
                    </span>
                    <button type="button" className="btn btn-ghost btn-sm sections-perso__supprimer" onClick={() => retirer(i)}>
                      Supprimer
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="form-hint">
          Enregistrez votre site, puis choisissez les produits de chaque section dans{' '}
          <Link to={ROUTES.SECTIONS}>Sections du site</Link>.
        </p>
      </div>
    </div>
  );
}
