import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Store } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from '../../utils/alert';
import useBoutique from './useBoutique';
import useVitrine, { MODELES, COULEURS } from '../vitrine/useVitrine';
import useProduitsSite from '../vitrine/useProduitsSite';
import InfosBoutique from './components/InfosBoutique';
import CarteSite from '../vitrine/components/CarteSite';
import EtapeSite from '../vitrine/components/EtapeSite';
import SectionsSite from '../vitrine/components/SectionsSite';
import ChoixProduits from '../vitrine/components/ChoixProduits';
import BarreEnregistrement from '../vitrine/components/BarreEnregistrement';
import ApercuSite from '../vitrine/components/ApercuSite';
import EtapeApparence from '../vitrine/etapes/EtapeApparence';
import EtapePhotos from '../vitrine/etapes/EtapePhotos';
import EtapeAvantages from '../vitrine/etapes/EtapeAvantages';
import EtapeInfos from '../vitrine/etapes/EtapeInfos';
import EtapeCommandes from '../vitrine/etapes/EtapeCommandes';
import { etatDesEtapes, prefixeAdresse, sectionsRemplies, verifierBrouillon } from './outilsSite';
import '../../styles/vitrine.css';
import '../../styles/boutique.css';

/**
 * Les étapes du site, dans l'ordre où le visiteur le parcourt. `cible` est
 * la partie du site vers laquelle l'aperçu descend quand l'étape s'ouvre.
 */
const ETAPES = [
  { cle: 'style', titre: 'Apparence', cible: 'style' },
  { cle: 'photos', titre: 'Photos du haut du site', cible: 'photos' },
  { cle: 'sections', titre: 'Produits affichés', cible: 'sections' },
  { cle: 'avantages', titre: 'Vos avantages', cible: 'avantages' },
  { cle: 'infos', titre: 'Présentation et contact', cible: 'infos' },
  { cle: 'commandes', titre: 'Adresse du site et commandes', cible: 'publication' },
];
const CLES = ETAPES.map((e) => e.cle);

/**
 * « Ma boutique » — tout ce qui touche à la boutique et à son site, sur une
 * seule page.
 *
 * Avant, le vendeur passait par trois pages : « Infos de la boutique »,
 * « Mon site » (six étapes avec Précédent / Suivant) et « Sections du site »
 * (les produits de chaque section, ailleurs, après avoir enregistré). Ici :
 *  - les infos de la boutique s'ouvrent dans une fenêtre, depuis le bouton
 *    du haut ;
 *  - la carte du haut dit où en est le site — les trois étapes pour le
 *    créer, ou de quoi le partager une fois publié ;
 *  - chaque partie du site est une étape repliable qui résume son état ;
 *    les produits d'une section se cochent sans quitter la page ;
 *  - un seul « Enregistrer », qui n'apparaît que s'il y a quelque chose à
 *    enregistrer ;
 *  - sur grand écran, le vrai site suit chaque changement, à droite.
 *
 * Adresses reconnues : ?etape=<clé> ouvre une étape (l'ancienne page
 * « Sections du site » y renvoie), ?infos=1 ouvre les infos de la boutique.
 */
export default function BoutiquePage() {
  const b = useBoutique();
  const v = useVitrine();
  const [params, setParams] = useSearchParams();

  const [infos, setInfos] = useState(() => (params.get('infos') ? 'voir' : null));
  const [ouverte, setOuverte] = useState(null);
  const [choix, setChoix] = useState(null);
  const [etapeInitiale, setEtapeInitiale] = useState(false);
  const pret = !b.loading && !v.loading;

  // Au premier affichage : l'étape demandée par l'adresse, sinon la première
  // pour un site jamais publié — le vendeur sait par où commencer.
  if (pret && !etapeInitiale) {
    setEtapeInitiale(true);
    const demandee = params.get('etape');
    setOuverte(CLES.includes(demandee) ? demandee : (v.configuree ? null : 'style'));
  }

  // Les produits ne sont chargés qu'au premier besoin.
  const produitsSite = useProduitsSite(ouverte === 'sections' || choix !== null);

  // Quitter l'onglet avec des changements non enregistrés : le navigateur
  // demande confirmation.
  useEffect(() => {
    if (!v.modifie) return undefined;
    const retenir = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', retenir);
    return () => window.removeEventListener('beforeunload', retenir);
  }, [v.modifie]);

  if (!pret) return <LoadingSpinner fullPage />;

  const ouvrirInfos = (mode = 'voir') => setInfos(mode);
  const fermerInfos = () => {
    setInfos(null);
    if (params.has('infos')) {
      setParams((p) => { const n = new URLSearchParams(p); n.delete('infos'); return n; }, { replace: true });
    }
  };
  const recharger = () => { b.charger(); v.rafraichir(); };

  const entete = (
    <div className="page-header">
      <div className="page-header-left">
        <h1>Ma boutique</h1>
        <p>Votre site web et les infos de votre boutique, au même endroit</p>
      </div>
      {b.boutique && (
        <button type="button" className="btn btn-primary ma-boutique__infos" onClick={() => ouvrirInfos('voir')}>
          <Store aria-hidden="true" /> Infos de la boutique
        </button>
      )}
    </div>
  );

  const fenetreInfos = infos && (
    <InfosBoutique mode={infos} onMode={setInfos} onClose={fermerInfos} b={b} onEnregistre={v.rafraichir} />
  );

  // ── Pas de boutique, ou boutique illisible ─────────────────────────────
  if (!b.boutique) {
    return (
      <div className="ma-boutique">
        <Helmet><title>Ma boutique — SaamBiz Vendeur</title></Helmet>
        {entete}
        {b.erreurChargement ? (
          <div className="card">
            <div className="card-body ma-boutique__vide">
              <p><strong>Votre boutique n’a pas pu être chargée.</strong></p>
              <p className="form-hint">Vérifiez votre connexion, puis réessayez.</p>
              <button type="button" className="btn btn-primary" onClick={recharger}>Réessayer</button>
            </div>
          </div>
        ) : (
          <div className="card">
            <div className="card-body ma-boutique__vide">
              <span className="ma-boutique__picto"><Store size={28} aria-hidden="true" /></span>
              <h2>Créons votre boutique</h2>
              <p>
                Un nom, une catégorie, un numéro de téléphone : c’est tout ce qu’il faut pour
                commencer. Vous composerez ensuite votre site sur cette même page.
              </p>
              <button type="button" className="btn btn-primary" onClick={() => ouvrirInfos('modifier')}>
                Créer ma boutique
              </button>
            </div>
          </div>
        )}
        {fenetreInfos}
      </div>
    );
  }

  // ── Boutique sans site lisible (panne du côté du site) ─────────────────
  if (!v.donnees) {
    return (
      <div className="ma-boutique">
        <Helmet><title>Ma boutique — SaamBiz Vendeur</title></Helmet>
        {entete}
        <div className="card">
          <div className="card-body ma-boutique__vide">
            <p><strong>{v.erreur || 'Votre site n’a pas pu être chargé.'}</strong></p>
            <p className="form-hint">Les infos de votre boutique restent accessibles avec le bouton ci-dessus.</p>
            <button type="button" className="btn btn-primary" onClick={v.rafraichir}>Réessayer</button>
          </div>
        </div>
        {fenetreInfos}
      </div>
    );
  }

  // ── La boutique et son site ────────────────────────────────────────────
  const { valeurs } = v;
  const etats = etatDesEtapes({ valeurs, photos: v.photos, modeles: MODELES, couleurs: COULEURS });
  const sectionsOk = sectionsRemplies(valeurs.sectionsPerso).length > 0;
  const cible = ETAPES.find((e) => e.cle === ouverte)?.cible;
  const sectionChoisie = choix !== null ? valeurs.sectionsPerso[choix] : null;

  const basculerEtape = (cle) => setOuverte((o) => (o === cle ? null : cle));

  /** Ce que le serveur refuserait est dit avant l'envoi, à l'étape où le corriger. */
  const brouillonValide = () => {
    const probleme = verifierBrouillon(valeurs, { slugEnregistre: v.slugEnregistre });
    if (!probleme) return true;
    setOuverte(probleme.etape);
    toast.error(probleme.message);
    return false;
  };
  const enregistrer = () => { if (brouillonValide()) v.enregistrer(); };
  const publier = () => { if (brouillonValide()) v.publier(); };

  const majProduitsSection = (index, ids) => v.majChamp(
    'sectionsPerso',
    valeurs.sectionsPerso.map((s, i) => (i === index ? { ...s, produitIds: ids } : s)),
  );

  const contenu = (cle) => {
    switch (cle) {
      case 'style':
        return <EtapeApparence modele={valeurs.modele} accent={valeurs.accent} onChange={v.majChamp} />;
      case 'photos':
        return (
          <EtapePhotos
            photos={v.photos}
            max={v.photosMax}
            occupe={v.photosOccupe}
            onAjouter={v.ajouterPhotos}
            onRetirer={v.retirerPhoto}
            onDeplacer={v.deplacerPhoto}
          />
        );
      case 'sections':
        return (
          <SectionsSite
            sections={valeurs.sectionsPerso}
            onChange={(liste) => v.majChamp('sectionsPerso', liste)}
            produits={produitsSite.produits}
            onChoisir={setChoix}
          />
        );
      case 'avantages':
        return <EtapeAvantages avantages={valeurs.blocs.avantages} onChange={(l) => v.majBloc('avantages', l)} />;
      case 'infos':
        return (
          <EtapeInfos
            valeurs={valeurs}
            onChamp={v.majChamp}
            onReseau={v.majReseau}
            onSection={v.majSection}
            onOuvrirInfos={() => ouvrirInfos('modifier')}
          />
        );
      case 'commandes':
        return (
          <EtapeCommandes
            valeurs={valeurs}
            onChamp={v.majChamp}
            prefixe={prefixeAdresse(v.url)}
            slugEnregistre={v.slugEnregistre}
            configuree={v.configuree}
            onSupprimer={v.supprimerSite}
            saving={v.saving}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="ma-boutique">
      <Helmet><title>Ma boutique — SaamBiz Vendeur</title></Helmet>
      {entete}

      <div className="vitrine-colonnes ma-boutique__colonnes">
        <div className="vitrine-reglages">
          <CarteSite
            boutique={b.boutique}
            verifie={b.verif?.statutValidation === 'approuve'}
            enPause={b.enPause}
            url={v.url}
            configuree={v.configuree}
            enLigne={v.enLigne}
            vues={v.vues}
            nombreProduits={v.nombreProduits}
            sectionsOk={sectionsOk}
            onOuvrirInfos={() => ouvrirInfos('voir')}
            onOuvrirEtape={setOuverte}
            onPublier={publier}
            onBasculerEnLigne={v.basculerEnLigne}
            bascule={v.bascule}
            saving={v.saving}
          />

          <div className="ma-boutique__intro">
            <h2>Personnaliser mon site</h2>
            <p>Ouvrez une partie pour la modifier. Sur grand écran, l’aperçu à droite suit chaque changement.</p>
          </div>

          <div className="etapes-site">
            {ETAPES.map((e, i) => (
              <EtapeSite
                key={e.cle}
                cle={e.cle}
                numero={i + 1}
                titre={e.titre}
                resume={etats[e.cle].resume}
                fait={etats[e.cle].fait}
                aFaire={etats[e.cle].aFaire}
                ouverte={ouverte === e.cle}
                onBasculer={() => basculerEtape(e.cle)}
              >
                {contenu(e.cle)}
              </EtapeSite>
            ))}
          </div>

          <BarreEnregistrement
            modifie={v.modifie}
            premiere={!v.configuree}
            saving={v.saving}
            onEnregistrer={enregistrer}
            onAnnuler={v.annuler}
            onPublier={publier}
          />
        </div>

        {/* Le vrai site, en direct, sur grand écran. */}
        <aside className="vitrine-apercu-colonne">
          <ApercuSite url={v.url} donnees={v.apercu} brouillon={valeurs} cible={cible} />
        </aside>
      </div>

      {fenetreInfos}

      {sectionChoisie && (
        <ChoixProduits
          key={sectionChoisie.id}
          section={sectionChoisie}
          produits={produitsSite.produits}
          chargement={produitsSite.chargement || (!produitsSite.produits && !produitsSite.erreur)}
          erreur={produitsSite.erreur}
          onRecharger={produitsSite.recharger}
          onValider={(ids) => { majProduitsSection(choix, ids); setChoix(null); }}
          onClose={() => setChoix(null)}
        />
      )}
    </div>
  );
}
