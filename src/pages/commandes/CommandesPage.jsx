import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import TableCommandes from './components/TableCommandes';
import DetailCommande from './components/DetailCommande';
import useCommandes, { STATUTS } from './useCommandes';

/** Commandes reçues par le vendeur, et leur avancement. */
export default function CommandesPage() {
  const c = useCommandes();

  if (c.loading) return <LoadingSpinner fullPage />;

  const pluriel = c.commandes.length > 1 ? 's' : '';

  return (
    <div>
      <Helmet><title>Commandes — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Commandes</h1>
          <p>
            {c.commandes.length} commande{pluriel} reçue{pluriel}
            {c.enAttente > 0 && ` — ${c.enAttente} en attente de traitement`}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="toolbar-left">
            <SearchInput
              value={c.search}
              onChange={c.rechercher}
              placeholder="Rechercher une commande ou un client…"
            />
          </div>
          <div className="toolbar-right">
            <select
              className="filter-select"
              value={c.filtreStatut}
              onChange={(e) => c.filtrerParStatut(e.target.value)}
              aria-label="Filtrer par statut"
            >
              <option value="tous">Tous les statuts</option>
              {STATUTS.map((s) => (
                <option key={s.code} value={s.code}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <TableCommandes
          commandes={c.pageCourante}
          filtreActif={Boolean(c.rechercheDifferee) || c.filtreStatut !== 'tous'}
          onDetail={c.setDetail}
        />

        {c.totalPages > 1 && (
          <Pagination currentPage={c.page} totalPages={c.totalPages} onPageChange={c.setPage} />
        )}
      </div>

      <Modal
        isOpen={c.detail !== null}
        onClose={() => c.setDetail(null)}
        title={`Commande ${c.detail?.reference || `#${String(c.detail?.id || '').slice(0, 8)}`}`}
      >
        <DetailCommande
          commande={c.detail}
          saving={c.saving}
          onChangerStatut={c.changerStatut}
        />
      </Modal>
    </div>
  );
}
