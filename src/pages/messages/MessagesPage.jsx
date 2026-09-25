import { useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { getConversations } from '../../service/vendeur.service';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';

/**
 * Conversations reçues. La messagerie mobile s'appuie sur une socket ;
 * ici on liste les échanges et leur dernier message. La réponse en ligne
 * reste à brancher sur le même canal — voir la note en bas de page.
 */
export default function MessagesPage() {
  const fetcher = useCallback(async () => {
    const res = await getConversations();
    const liste = res.data?.conversations || res.data?.data || res.data || [];
    return Array.isArray(liste) ? liste : [];
  }, []);

  const { data, loading } = usePageData(fetcher, 'Erreur lors du chargement des conversations');

  if (loading) return <LoadingSpinner fullPage />;

  const conversations = data || [];

  const nomClient = (c) =>
    `${c.interlocuteur?.prenom || c.acheteur?.prenom || ''} ${c.interlocuteur?.nom || c.acheteur?.nom || ''}`.trim()
    || c.interlocuteur?.email
    || 'Client';

  return (
    <div>
      <Helmet><title>Messages — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Messages</h1>
          <p>{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Dernier message</th>
                <th>Reçu le</th>
                <th>État</th>
              </tr>
            </thead>
            <tbody>
              {conversations.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <p>Aucune conversation pour l’instant</p>
                    </div>
                  </td>
                </tr>
              ) : conversations.map((c) => {
                const nonLus = c.nonLus ?? c.messagesNonLus ?? 0;
                return (
                  <tr key={c.id || c.conversationId}>
                    <td className="td-bold">{nomClient(c)}</td>
                    <td className="td-muted" style={{ maxWidth: 420 }}>
                      {c.dernierMessage?.contenu || c.dernierMessage || '—'}
                    </td>
                    <td className="td-muted">
                      {formatDateTime(c.dernierMessage?.createdAt || c.updatedAt)}
                    </td>
                    <td>
                      <Badge variant={nonLus > 0 ? 'warning' : 'default'}>
                        {nonLus > 0 ? `${nonLus} non lu${nonLus > 1 ? 's' : ''}` : 'À jour'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ marginTop: 16, fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
        La réponse aux messages depuis le web n’est pas encore active : elle passe par
        la messagerie temps réel de l’application mobile.
      </p>
    </div>
  );
}
