import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import TablePromotions from './components/TablePromotions';
import FormPromotion from './components/FormPromotion';
import usePromotions from './usePromotions';

/** Promotions du vendeur : baisse temporaire du prix d'un produit. */
export default function PromotionsPage() {
  const p = usePromotions();

  if (p.loading) return <LoadingSpinner fullPage />;

  const sansProduit = p.produits.length === 0;

  return (
    <div>
      <Helmet><title>Promotions — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Promotions</h1>
          <p>Baissez temporairement le prix d’un produit pour attirer vos clients</p>
        </div>
        <button className="btn btn-primary" onClick={p.ouvrirCreation} disabled={sansProduit}>
          + Créer une promotion
        </button>
      </div>

      {/* Le bouton est désactivé au-dessus : sans cette explication, on ne
          comprend pas pourquoi. */}
      {sansProduit && (
        <div className="card card-info">
          <div className="card-body">
            <p>Publiez d’abord un produit : une promotion porte toujours sur un produit précis.</p>
          </div>
        </div>
      )}

      <div className="card">
        <TablePromotions
          promotions={p.promotions}
          onModifier={p.ouvrirEdition}
          onSupprimer={p.setSuppression}
        />
      </div>

      <Modal
        isOpen={p.edition !== null}
        onClose={p.fermer}
        title={p.edition?.id ? 'Modifier la promotion' : 'Nouvelle promotion'}
        footer={(
          <>
            <button className="btn btn-ghost" onClick={p.fermer} disabled={p.saving}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={p.enregistrer} disabled={p.saving}>
              {p.saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </>
        )}
      >
        <FormPromotion
          valeurs={p.valeurs}
          setValeurs={p.setValeurs}
          erreurs={p.erreurs}
          produits={p.produits}
        />
      </Modal>

      <ConfirmModal
        isOpen={p.suppression !== null}
        onClose={() => p.setSuppression(null)}
        onConfirm={p.confirmerSuppression}
        title="Supprimer la promotion"
        message={`Supprimer « ${p.suppression?.titre} » ?`}
        confirmLabel="Supprimer"
      />
    </div>
  );
}
