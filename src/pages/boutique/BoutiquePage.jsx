import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';
import FormBoutique from './components/FormBoutique';
import CarteVerification from './components/CarteVerification';
import useBoutique from './useBoutique';

/** Vitrine du vendeur : informations, disponibilité, vérification du profil. */
export default function BoutiquePage() {
  const b = useBoutique();

  if (b.loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <Helmet><title>Ma boutique — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Ma boutique</h1>
          <p>Ces informations sont celles que vos clients voient sur votre vitrine</p>
        </div>
        {b.boutique && (
          <Badge variant={b.boutique.enPause ? 'warning' : 'success'}>
            {b.boutique.enPause ? 'En pause' : 'En ligne'}
          </Badge>
        )}
      </div>

      {/* Le formulaire sert aussi à l'ouverture : sans cette explication, un
          vendeur qui vient de s'inscrire ne sait pas quoi faire de la page. */}
      {!b.boutique && (
        <div className="card card-info">
          <div className="card-body">
            <p>
              Aucune boutique n’est encore rattachée à votre compte. Renseignez les
              informations ci-dessous puis enregistrez pour l’ouvrir.
            </p>
          </div>
        </div>
      )}

      <FormBoutique
        valeurs={b.valeurs}
        setValeurs={b.setValeurs}
        erreurs={b.erreurs}
        saving={b.saving}
        boutique={b.boutique}
        categories={b.categories}
        logo={b.logo}
        setLogo={b.setLogo}
        onEnregistrer={b.enregistrer}
      />

      {b.boutique && (
        <div className="card carte-espacee">
          <div className="card-header"><h3 className="card-title">Disponibilité</h3></div>
          <div className="card-body">
            <p className="texte-secondaire">
              {b.boutique.enPause
                ? 'Votre boutique est en pause : vos produits n’apparaissent plus dans l’application et vous ne recevez pas de commande.'
                : 'Mettre la boutique en pause masque vos produits le temps d’un congé ou d’une rupture de stock. Vous la réactivez quand vous voulez.'}
            </p>
            <button
              className={b.boutique.enPause ? 'btn btn-primary' : 'btn btn-warning'}
              onClick={() => (b.boutique.enPause ? b.basculerPause() : b.setConfirmPause(true))}
            >
              {b.boutique.enPause ? 'Réactiver ma boutique' : 'Mettre en pause'}
            </button>
          </div>
        </div>
      )}

      <CarteVerification
        verif={b.verif}
        setPiece={b.setPiece}
        typePiece={b.typePiece}
        setTypePiece={b.setTypePiece}
        envoiVerif={b.envoiVerif}
        onEnvoyer={b.envoyerVerification}
      />

      <ConfirmModal
        isOpen={b.confirmPause}
        onClose={() => b.setConfirmPause(false)}
        onConfirm={b.basculerPause}
        title="Mettre la boutique en pause"
        message="Vos produits seront masqués dans l’application jusqu’à réactivation. Les commandes en cours ne sont pas affectées."
        confirmLabel="Mettre en pause"
        variant="warning"
      />
    </div>
  );
}
