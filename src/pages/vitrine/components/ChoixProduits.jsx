import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Badge from '../../../components/common/Badge';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { formatMontant } from '../../../utils/formatters';
import { ROUTES } from '../../../constants/routes';
import { enModeration, statutProduit, visiblePourLesClients } from '../../produits/statutProduit';
import { MAX_PRODUITS_PAR_SECTION, pluriel } from '../../boutique/outilsSite';

/**
 * Les produits d'une section, à cocher dans une fenêtre.
 *
 * Les cases cochées ne touchent le brouillon du site qu'à « Valider » :
 * fermer la fenêtre abandonne le choix. Un produit que la modération n'a
 * pas encore validé n'apparaît pas sur le site (le serveur ne montre dans
 * les sections que les produits approuvés) : la liste le dit, pour qu'un
 * vendeur ne cherche pas pourquoi il manque. Retiré ou en rupture, il est
 * signalé aussi : le client le verra sans pouvoir le commander.
 *
 * À monter avec une clé par section : l'état repart du choix enregistré.
 */
export default function ChoixProduits({ section, produits, chargement, erreur, onRecharger, onValider, onClose }) {
  const [choisis, setChoisis] = useState(() => section?.produitIds || []);
  const [recherche, setRecherche] = useState('');

  const visibles = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (produits || []).filter((p) => (p.nom || '').toLowerCase().includes(q));
  }, [produits, recherche]);

  const ensemble = new Set(choisis);
  const plein = choisis.length >= MAX_PRODUITS_PAR_SECTION;

  const basculer = (id) => setChoisis((liste) => (liste.includes(id)
    ? liste.filter((x) => x !== id)
    : (liste.length < MAX_PRODUITS_PAR_SECTION ? [...liste, id] : liste)));

  const toutCocher = () => setChoisis((liste) => [
    ...new Set([...liste, ...visibles.map((p) => p.id)]),
  ].slice(0, MAX_PRODUITS_PAR_SECTION));

  const toutDecocher = () => {
    const retires = new Set(visibles.map((p) => p.id));
    setChoisis((liste) => liste.filter((id) => !retires.has(id)));
  };

  const titre = section?.titre?.trim() || 'cette section';

  return (
    <Modal
      isOpen
      large
      onClose={onClose}
      title={`Produits de « ${titre} »`}
      description="Cochez les produits à afficher dans cette section de votre site."
      footer={(
        <>
          <span className="choix-produits__compte">
            {pluriel(choisis.length, 'produit choisi', 'produits choisis')}
            {plein && ` — ${MAX_PRODUITS_PAR_SECTION} au maximum`}
          </span>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button type="button" className="btn btn-primary" onClick={() => onValider(choisis)} disabled={chargement}>
            Valider
          </button>
        </>
      )}
    >
      {chargement && <LoadingSpinner />}

      {!chargement && erreur && (
        <div className="vitrine-vide">
          <p><strong>{erreur}</strong></p>
          <button type="button" className="btn btn-secondary btn-sm vitrine-marge-haut" onClick={onRecharger}>Réessayer</button>
        </div>
      )}

      {!chargement && !erreur && (produits || []).length === 0 && (
        <div className="vitrine-vide">
          <p><strong>Vous n'avez pas encore de produit.</strong></p>
          <p className="form-hint">Ajoutez vos produits, puis revenez les placer sur votre site.</p>
          <Link to={`${ROUTES.PRODUITS}?nouveau=1`} className="btn btn-primary btn-sm vitrine-marge-haut">Ajouter un produit</Link>
        </div>
      )}

      {!chargement && !erreur && (produits || []).length > 0 && (
        <>
          <div className="choix-produits__outils">
            <input
              className="form-input"
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un produit…"
              aria-label="Rechercher un produit"
            />
            <button type="button" className="btn btn-ghost btn-sm" onClick={toutCocher} disabled={plein || visibles.length === 0}>
              Tout cocher
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={toutDecocher} disabled={choisis.length === 0}>
              Tout décocher
            </button>
          </div>

          <ul className="choix-produits">
            {visibles.map((p) => {
              const coche = ensemble.has(p.id);
              const etat = visiblePourLesClients(p) ? null : statutProduit(p);
              return (
                <li key={p.id}>
                  <label className={`choix-produit${coche ? ' est-choisi' : ''}${!coche && plein ? ' est-bloque' : ''}`}>
                    <input type="checkbox" checked={coche} disabled={!coche && plein} onChange={() => basculer(p.id)} />
                    {p.image
                      ? <img src={p.image} alt="" className="choix-produit__vignette" loading="lazy" />
                      : <span className="choix-produit__vignette choix-produit__vignette--vide" aria-hidden="true"><ImageOff size={16} /></span>}
                    <span className="choix-produit__textes">
                      <span className="choix-produit__nom">{p.nom}</span>
                      {etat && (
                        <span className="choix-produit__etat">
                          <Badge variant={etat.variant}>{etat.label}</Badge>
                          {enModeration(p) && (
                            <span>{p.statut === 'rejete' ? 'n’apparaîtra pas sur votre site' : 'apparaîtra sur votre site une fois validé'}</span>
                          )}
                        </span>
                      )}
                    </span>
                    <span className="choix-produit__prix">{formatMontant(p.prix_promo || p.prix)}</span>
                  </label>
                </li>
              );
            })}
            {visibles.length === 0 && <li className="form-hint">Aucun produit ne correspond à « {recherche} ».</li>}
          </ul>
        </>
      )}
    </Modal>
  );
}
