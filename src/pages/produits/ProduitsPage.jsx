import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import TableProduits from './components/TableProduits';
import FormProduit from './components/FormProduit';
import useProduits from './useProduits';

/**
 * Catalogue du vendeur.
 *
 * La page n'assemble que des morceaux : toute la logique est dans
 * `useProduits`, tout l'affichage dans les deux composants voisins. Elle se
 * lit d'un regard, ce qui n'était pas le cas de la version à 400 lignes où
 * chargement, formulaire, mutations et JSX étaient entremêlés.
 */
export default function ProduitsPage() {
  const p = useProduits();

  if (p.loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <Helmet><title>Mes produits — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Mes produits</h1>
          <p>
            {p.produits.length} produit{p.produits.length > 1 ? 's' : ''} dans votre catalogue
          </p>
        </div>
        <button className="btn btn-primary" onClick={p.ouvrirCreation}>
          + Ajouter un produit
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="toolbar-left">
            <SearchInput
              value={p.search}
              onChange={p.rechercher}
              placeholder="Rechercher un produit…"
            />
          </div>
        </div>

        <TableProduits
          produits={p.pageCourante}
          recherche={p.rechercheDifferee}
          onModifier={p.ouvrirEdition}
          onBasculer={p.basculer}
          onDupliquer={p.dupliquer}
          onSupprimer={p.setSuppression}
        />

        {p.totalPages > 1 && (
          <Pagination currentPage={p.page} totalPages={p.totalPages} onPageChange={p.setPage} />
        )}
      </div>

      <Modal
        isOpen={p.edition !== null}
        onClose={p.fermer}
        title={p.edition?.id ? 'Modifier le produit' : 'Nouveau produit'}
        footer={(
          <>
            <button className="btn btn-ghost" onClick={p.fermer} disabled={p.saving}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={p.enregistrer} disabled={p.saving}>
              {p.saving ? 'Enregistrement…' : p.edition?.id ? 'Enregistrer' : 'Publier'}
            </button>
          </>
        )}
      >
        <FormProduit
          valeurs={p.valeurs}
          setValeurs={p.setValeurs}
          erreurs={p.erreurs}
          categories={p.categories}
          image={p.image}
          setImage={p.setImage}
          setImages={p.setImages}
          estModification={Boolean(p.edition?.id)}
        />
      </Modal>

      <ConfirmModal
        isOpen={p.suppression !== null}
        onClose={() => p.setSuppression(null)}
        onConfirm={p.confirmerSuppression}
        title="Supprimer le produit"
        message={`Supprimer « ${p.suppression?.nom} » ? Cette action est définitive.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
