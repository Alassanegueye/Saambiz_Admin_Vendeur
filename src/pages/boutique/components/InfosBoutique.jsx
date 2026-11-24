import { useState } from 'react';
import { Pencil } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Badge from '../../../components/common/Badge';
import { showConfirm } from '../../../utils/alert';
import FormBoutique from './FormBoutique';
import CarteVerification from './CarteVerification';

/** Initiales de la boutique, quand elle n'a pas encore de logo. */
const initiales = (nom) => String(nom || '?').trim().split(/\s+/).slice(0, 2).map((m) => m[0]).join('').toUpperCase();

/** Une ligne de la fiche ; une valeur manquante propose de la compléter. */
function Detail({ libelle, valeur, onCompleter, multiligne = false }) {
  return (
    <div className="infos-boutique__detail">
      <dt>{libelle}</dt>
      <dd className={multiligne ? 'texte-multiligne' : undefined}>
        {valeur || (
          <button type="button" className="bouton-lien infos-boutique__completer" onClick={onCompleter}>
            + Ajouter
          </button>
        )}
      </dd>
    </div>
  );
}

/** Ouverte ou en pause : tous les produits rendus indisponibles d'un geste. */
function Disponibilite({ b }) {
  const [confirmer, setConfirmer] = useState(false);
  const suspendue = b.boutique?.statut === 'suspendu';
  const aucunProduit = b.produits.length === 0;

  const mettreEnPause = async () => {
    if (await b.basculerPause()) setConfirmer(false);
  };

  return (
    <div className="infos-boutique__bloc">
      <div className="infos-boutique__ligne">
        <div>
          <strong>Disponibilité</strong>
          <p className="form-hint">
            {b.enPause
              ? 'Votre boutique est en pause : tous vos produits sont indisponibles, vos clients ne peuvent rien commander. La réactiver rend tous vos produits disponibles.'
              : 'Un congé, une rupture ? Mettez la boutique en pause : vos produits deviennent indisponibles le temps de votre absence.'}
          </p>
        </div>
        <Badge variant={b.enPause ? 'warning' : 'success'}>{b.enPause ? 'En pause' : 'Ouverte'}</Badge>
      </div>

      {suspendue && (
        <p className="texte-refus">Votre boutique est suspendue par SaamBiz. Contactez-nous depuis la page Aide.</p>
      )}

      {aucunProduit ? (
        <p className="form-hint">Rien à mettre en pause pour l’instant : vous n’avez pas encore de produit.</p>
      ) : b.enPause ? (
        <button type="button" className="btn btn-primary btn-sm" onClick={b.basculerPause} disabled={b.pauseEnCours}>
          {b.pauseEnCours ? 'Un instant…' : 'Réactiver ma boutique'}
        </button>
      ) : !confirmer ? (
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirmer(true)}>
          Mettre en pause
        </button>
      ) : (
        <div className="infos-boutique__confirmation" role="alert">
          <p>
            Tous vos produits passeront « indisponibles » : plus aucune commande jusqu’à la
            réactivation. Les commandes en cours ne sont pas touchées.
          </p>
          <div className="barre-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmer(false)} disabled={b.pauseEnCours}>
              Annuler
            </button>
            <button type="button" className="btn btn-warning btn-sm" onClick={mettreEnPause} disabled={b.pauseEnCours}>
              {b.pauseEnCours ? 'Un instant…' : 'Oui, mettre en pause'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Fenêtre « Infos de la boutique », ouverte par le bouton du haut de la page.
 *
 * Elle s'ouvre en lecture : le vendeur voit ses infos telles que ses clients
 * les lisent, sans risque de rien changer par mégarde. « Modifier » passe en
 * saisie ; « Enregistrer » revient à la lecture. La disponibilité (pause) et
 * la vérification du profil, qui concernent la boutique et non le site, sont
 * ici aussi.
 *
 * Sans boutique (vendeur inscrit sans en créer), elle s'ouvre directement en
 * saisie pour la créer.
 */
export default function InfosBoutique({ mode, onMode, onClose, b, onEnregistre }) {
  const creation = !b.boutique;
  const edition = creation || mode === 'modifier';
  const boutique = b.boutique;

  /** Rien ne se perd sans le dire : une saisie en cours demande confirmation. */
  const abandonnerSiAccepte = async () => {
    if (!b.modifie) return true;
    return showConfirm({
      titre: 'Abandonner vos modifications\u00a0?',
      message: 'Les infos que vous avez changées ne seront pas enregistrées.',
      confirmText: 'Abandonner',
      cancelText: 'Continuer la saisie',
      danger: true,
    });
  };

  const fermer = async () => {
    if (edition && !(await abandonnerSiAccepte())) return;
    b.annulerModifs();
    onClose();
  };

  const annulerEdition = async () => {
    if (creation) { await fermer(); return; }
    if (!(await abandonnerSiAccepte())) return;
    b.annulerModifs();
    onMode('voir');
  };

  const enregistrer = async () => {
    if (!(await b.enregistrer())) return;
    onEnregistre?.();
    if (creation) onClose();
    else onMode('voir');
  };

  const categories = Array.isArray(boutique?.categories) && boutique.categories.length
    ? boutique.categories.map((c) => c.nom)
    : (boutique?.categorie ? [boutique.categorie] : []);

  return (
    <Modal
      isOpen
      large
      onClose={fermer}
      title={creation ? 'Créer ma boutique' : 'Infos de la boutique'}
      description={creation
        ? 'Quelques informations suffisent pour commencer. Vous pourrez tout changer ensuite.'
        : 'Ce que vos clients voient de votre boutique, dans l’application et sur votre site.'}
      footer={edition ? (
        <>
          <button type="button" className="btn btn-secondary" onClick={annulerEdition} disabled={b.saving}>Annuler</button>
          <button type="button" className="btn btn-primary" onClick={enregistrer} disabled={b.saving}>
            {b.saving ? 'Enregistrement…' : creation ? 'Créer ma boutique' : 'Enregistrer'}
          </button>
        </>
      ) : (
        <>
          <button type="button" className="btn btn-secondary" onClick={fermer}>Fermer</button>
          <button type="button" className="btn btn-primary" onClick={() => onMode('modifier')}>
            <Pencil aria-hidden="true" /> Modifier les infos
          </button>
        </>
      )}
    >
      {edition ? (
        <FormBoutique
          valeurs={b.valeurs}
          setValeurs={b.setValeurs}
          erreurs={b.erreurs}
          boutique={boutique}
          categories={b.categories}
          etatCategories={b.etatCategories}
          onRechargerCategories={b.rechargerCategories}
          logo={b.logo}
          setLogo={b.setLogo}
        />
      ) : (
        <div className="infos-boutique">
          <div className="infos-boutique__identite">
            {boutique.logo
              ? <img src={boutique.logo} alt="Logo de la boutique" className="infos-boutique__logo" />
              : <span className="infos-boutique__logo infos-boutique__logo--vide" aria-hidden="true">{initiales(boutique.nom)}</span>}
            <div>
              <strong>{boutique.nom}</strong>
              {boutique.slogan
                ? <span>{boutique.slogan}</span>
                : <button type="button" className="bouton-lien infos-boutique__completer" onClick={() => onMode('modifier')}>+ Ajouter un slogan</button>}
              {categories.length > 0 && (
                <div className="infos-boutique__categories">
                  {categories.map((c, i) => <span key={c} className="specs-puce specs-puce--on">{i === 0 ? '★ ' : ''}{c}</span>)}
                </div>
              )}
            </div>
          </div>

          <dl className="infos-boutique__details">
            <Detail libelle="Description" valeur={boutique.description} multiligne onCompleter={() => onMode('modifier')} />
            <Detail libelle="Ville / quartier" valeur={boutique.localisation || boutique.ville} onCompleter={() => onMode('modifier')} />
            <Detail libelle="Téléphone / WhatsApp" valeur={boutique.telephone || boutique.whatsapp} onCompleter={() => onMode('modifier')} />
          </dl>

          <Disponibilite b={b} />

          <CarteVerification
            verif={b.verif}
            piece={b.piece}
            setPiece={b.setPiece}
            typePiece={b.typePiece}
            setTypePiece={b.setTypePiece}
            envoiVerif={b.envoiVerif}
            onEnvoyer={b.envoyerVerification}
          />
        </div>
      )}
    </Modal>
  );
}
