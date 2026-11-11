import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  getConversations, getMessagesSite, marquerMessageSiteLu, supprimerMessageSite,
} from '../../service/vendeur.service';
import { showConfirm, toast } from '../../utils/alert';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { formatDateTime } from '../../utils/formatters';

/** Lien WhatsApp vers le visiteur, avec un début de réponse déjà écrit. */
const lienWhatsapp = (m) => {
  const chiffres = String(m.telephone || '').replace(/\D/g, '');
  const texte = `Bonjour${m.nom ? ` ${m.nom}` : ''}, merci pour votre message sur notre site. `;
  return `https://wa.me/${chiffres}?text=${encodeURIComponent(texte)}`;
};

/**
 * Les messages laissés sur la page « Contact » du site de la boutique. Le
 * visiteur n'a pas de compte : on lui répond sur le numéro qu'il a donné.
 */
function MessagesSite({ messages, onLu, onSupprimer }) {
  const nonLus = messages.filter((m) => !m.lu).length;
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Messages reçus sur votre site</span>
        {nonLus > 0 && <Badge variant="warning">{nonLus} non lu{nonLus > 1 ? 's' : ''}</Badge>}
      </div>
      {messages.length === 0 ? (
        <div className="card-body">
          <div className="empty-state">
            <p>Aucun message pour l’instant. Ceux que vos visiteurs écrivent sur la page Contact de votre site arriveront ici.</p>
          </div>
        </div>
      ) : (
        <ul className="msg-site">
          {messages.map((m) => (
            <li key={m.id} className={`msg-site__item ${m.lu ? '' : 'est-nouveau'}`}>
              <div className="msg-site__tete">
                <strong>{m.nom || 'Visiteur du site'}</strong>
                <span className="msg-site__meta">{m.telephone} · {formatDateTime(m.createdAt)}</span>
                {!m.lu && <Badge variant="warning">Nouveau</Badge>}
              </div>
              <p className="msg-site__texte">{m.contenu}</p>
              <div className="msg-site__actions">
                <a className="btn btn-primary btn-sm" href={lienWhatsapp(m)} target="_blank" rel="noopener noreferrer"
                  onClick={() => !m.lu && onLu(m)}>
                  Répondre sur WhatsApp
                </a>
                <a className="btn btn-secondary btn-sm" href={`tel:${m.telephone}`} onClick={() => !m.lu && onLu(m)}>
                  Appeler
                </a>
                {!m.lu && (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onLu(m)}>
                    Marquer comme lu
                  </button>
                )}
                <button type="button" className="btn btn-ghost btn-sm msg-site__supprimer" onClick={() => onSupprimer(m)}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Conversations reçues. La messagerie mobile s'appuie sur une socket ;
 * ici on liste les échanges et leur dernier message. La réponse en ligne
 * reste à brancher sur le même canal — voir la note en bas de page.
 */
export default function MessagesPage() {
  // Les deux listes se chargent ensemble ; l'échec de l'une ne masque pas l'autre.
  const fetcher = useCallback(async () => {
    const [conv, site] = await Promise.allSettled([getConversations(), getMessagesSite()]);
    if (conv.status === 'rejected' && site.status === 'rejected') throw conv.reason;
    const brut = conv.status === 'fulfilled' ? conv.value.data : null;
    const liste = brut?.conversations || brut?.data || brut || [];
    return {
      conversations: Array.isArray(liste) ? liste : [],
      messagesSite: site.status === 'fulfilled' ? (site.value.data?.messages || []) : [],
    };
  }, []);

  const { data, loading } = usePageData(fetcher, 'Erreur lors du chargement des messages');
  const [messagesSite, setMessagesSite] = useState([]);
  useEffect(() => { if (data) setMessagesSite(data.messagesSite); }, [data]);

  const marquerLu = async (m) => {
    setMessagesSite((l) => l.map((x) => (x.id === m.id ? { ...x, lu: true } : x)));
    try {
      await marquerMessageSiteLu(m.id);
    } catch {
      setMessagesSite((l) => l.map((x) => (x.id === m.id ? { ...x, lu: false } : x)));
    }
  };

  const supprimer = async (m) => {
    const ok = await showConfirm({
      titre: 'Supprimer ce message ?',
      message: `Le message de ${m.nom || 'ce visiteur'} sera définitivement supprimé.`,
      confirmText: 'Supprimer',
      danger: true,
    });
    if (!ok) return;
    try {
      await supprimerMessageSite(m.id);
      setMessagesSite((l) => l.filter((x) => x.id !== m.id));
      toast.success('Message supprimé');
    } catch {
      toast.error('Suppression impossible. Réessayez.');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const conversations = data?.conversations || [];

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
          <p>{conversations.length} conversation{conversations.length > 1 ? 's' : ''} · {messagesSite.length} message{messagesSite.length > 1 ? 's' : ''} du site</p>
        </div>
      </div>

      <MessagesSite messages={messagesSite} onLu={marquerLu} onSupprimer={supprimer} />

      <div className="card">
        <div className="card-header"><span className="card-title">Conversations dans l’application</span></div>
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
