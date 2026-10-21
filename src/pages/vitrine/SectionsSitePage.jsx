import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ROUTES } from '../../constants/routes';
import { toast } from '../../utils/alert';
import { formatMontant } from '../../utils/formatters';
import { getMaVitrine, modifierVitrine, getProduits, getApercuVitrine } from '../../service/vendeur.service';
import ApercuSite from './components/ApercuSite';
import '../../styles/vitrine.css';
import { messageErreur } from './messageErreur';

const extraire = (r) => r?.data?.data ?? r?.data ?? null;

/**
 * « Sections du site » — le vendeur choisit, parmi ses produits, ceux qui
 * s'affichent dans chacune de ses sections. Les sections elles-mêmes se
 * créent et se renomment dans « Mon site ». Sur grand écran, le site suit
 * chaque case cochée.
 */
export default function SectionsSitePage() {
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [url, setUrl] = useState('');
  const [sections, setSections] = useState([]);
  const [initiales, setInitiales] = useState('[]');
  const [produits, setProduits] = useState([]);
  const [apercu, setApercu] = useState(null);
  const [active, setActive] = useState(0);
  const [recherche, setRecherche] = useState('');
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    let annule = false;
    Promise.all([getMaVitrine(), getProduits({ limit: 200 })])
      .then(([rv, rp]) => {
        if (annule) return;
        const v = extraire(rv)?.vitrine || {};
        const liste = Array.isArray(v.sectionsPerso) ? v.sectionsPerso : [];
        setSections(liste);
        setInitiales(JSON.stringify(liste));
        setUrl(v.url || '');
        const p = rp?.data?.produits || rp?.data?.data || rp?.data || [];
        setProduits(Array.isArray(p) ? p : []);
      })
      .catch((e) => { if (!annule) setErreur(e?.response?.data?.message || "Vos sections n'ont pas pu être chargées."); })
      .finally(() => { if (!annule) setChargement(false); });
    getApercuVitrine().then((r) => { if (!annule) setApercu(extraire(r)); }).catch(() => {});
    return () => { annule = true; };
  }, []);

  const modifie = JSON.stringify(sections) !== initiales;
  const section = sections[active];
  const choisis = useMemo(() => new Set(section?.produitIds || []), [section]);
  const visibles = produits.filter((p) => (p.nom || '').toLowerCase().includes(recherche.toLowerCase().trim()));
  const brouillon = useMemo(() => ({ sectionsPerso: sections }), [sections]);

  const basculer = (id) => setSections((liste) => liste.map((s, i) => {
    if (i !== active) return s;
    const ids = s.produitIds || [];
    return { ...s, produitIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id] };
  }));
  const toutCocher = (oui) => setSections((liste) => liste.map((s, i) => (i !== active ? s : {
    ...s,
    produitIds: oui ? [...new Set([...(s.produitIds || []), ...visibles.map((p) => p.id)])].slice(0, 60) : [],
  })));

  const enregistrer = async () => {
    setEnregistrement(true);
    try {
      const r = await modifierVitrine({ sectionsPerso: sections });
      const liste = extraire(r)?.vitrine?.sectionsPerso || sections;
      setSections(liste);
      setInitiales(JSON.stringify(liste));
      toast.success('Vos sections sont à jour.');
    } catch (e) {
      toast.error(messageErreur(e, "L'enregistrement a échoué."));
    } finally {
      setEnregistrement(false);
    }
  };

  if (chargement) return <LoadingSpinner fullPage />;

  return (
    <div>
      <Helmet><title>Sections du site — SaamBiz Vendeur</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Sections du site</h1>
          <p>Choisissez les produits affichés dans chaque section de votre site</p>
        </div>
        <div className="actions-rapides">
          <Link to={ROUTES.VITRINE} className="btn btn-secondary">Créer ou renommer une section</Link>
          <button type="button" className="btn btn-primary" onClick={enregistrer} disabled={!modifie || enregistrement}>
            {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {erreur && <div className="card card-info"><div className="card-body"><p>{erreur}</p></div></div>}

      {!erreur && sections.length === 0 && (
        <div className="card">
          <div className="card-body vitrine-vide-page">
            <p><strong>Vous n'avez pas encore de section.</strong></p>
            <p className="form-hint">Créez-en une dans « Mon site » (étape « Sections »), puis revenez ici pour choisir ses produits.</p>
            <Link to={ROUTES.VITRINE} className="btn btn-primary vitrine-marge-haut">Créer une section</Link>
          </div>
        </div>
      )}

      {!erreur && sections.length > 0 && (
        <div className="vitrine-colonnes">
          <div className="vitrine-reglages">
            <div className="sections-onglets" role="tablist" aria-label="Vos sections">
              {sections.map((s, i) => (
                <button key={s.id} type="button" role="tab" aria-selected={i === active}
                  className={`sections-onglet ${i === active ? 'est-actif' : ''}`}
                  onClick={() => { setActive(i); setRecherche(''); }}>
                  {s.titre || 'Section sans nom'}
                  <span>{(s.produitIds || []).length}</span>
                </button>
              ))}
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{section?.titre || 'Section sans nom'}</h3>
                  <p className="form-hint vitrine-sans-marge">
                    {choisis.size} produit{choisis.size > 1 ? 's' : ''} choisi{choisis.size > 1 ? 's' : ''}
                    {choisis.size === 0 && ' — la section reste invisible pour vos clients'}
                  </p>
                </div>
              </div>
              <div className="card-body">
                {produits.length === 0 ? (
                  <div className="vitrine-vide">
                    <p><strong>Vous n'avez pas encore de produit.</strong></p>
                    <Link to={ROUTES.PRODUITS} className="btn btn-primary btn-sm vitrine-marge-haut">Ajouter un produit</Link>
                  </div>
                ) : (
                  <>
                    <div className="sections-outils">
                      <input className="form-input" type="search" value={recherche}
                        onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un produit…"
                        aria-label="Rechercher un produit" />
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toutCocher(true)}>Tout cocher</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toutCocher(false)} disabled={choisis.size === 0}>Tout décocher</button>
                    </div>
                    <ul className="sections-perso__choix">
                      {visibles.map((p) => (
                        <li key={p.id}>
                          <label className={`sections-perso__option${choisis.has(p.id) ? ' est-choisi' : ''}`}>
                            <input type="checkbox" checked={choisis.has(p.id)} onChange={() => basculer(p.id)} />
                            {p.image
                              ? <img src={p.image} alt="" className="sections-perso__vignette" />
                              : <span className="sections-perso__vignette sections-perso__vignette--vide" aria-hidden="true" />}
                            <span className="sections-perso__nom">{p.nom}</span>
                            <span className="sections-perso__prix">{formatMontant(p.prix_promo || p.prix)}</span>
                          </label>
                        </li>
                      ))}
                      {visibles.length === 0 && <li className="form-hint">Aucun produit ne correspond.</li>}
                    </ul>
                  </>
                )}
              </div>
            </div>
            {modifie && (
              <div className="vitrine-barre-enregistrer">
                <button type="button" className="btn btn-primary" onClick={enregistrer} disabled={enregistrement}>
                  {enregistrement ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>

          <aside className="vitrine-apercu-colonne">
            <ApercuSite url={url} donnees={apercu} brouillon={brouillon} cible="sections" />
          </aside>
        </div>
      )}
    </div>
  );
}
