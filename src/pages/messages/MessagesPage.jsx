import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import {
  getConversations, getMessagesSite, marquerMessageSiteLu, supprimerMessageSite,
  getConversation, envoyerMessage, marquerMessageLu,
} from '../../service/vendeur.service';
import { showConfirm, toast } from '../../utils/alert';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { getUser } from '../../utils/storage';
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
 * Le fil avec un acheteur, et la réponse.
 *
 * Répondre depuis le web n'était pas possible : la page listait les
 * conversations et renvoyait le vendeur vers son téléphone. L'API, elle,
 * expose déjà tout ce qu'il faut — le fil par `GET /messages/:userId`,
 * l'envoi par `POST /messages`. L'acheteur reçoit la réponse par la socket
 * s'il est dans l'application, et par notification sinon : c'est le serveur
 * qui s'en charge, à l'identique de ce que fait le mobile.
 */
function FilConversation({ interlocuteur, nom, onFerme, onRepondu }) {
  const [messages, setMessages] = useState(null);
  const [texte, setTexte] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const moi = getUser()?.id;

  useEffect(() => {
    let vivant = true;
    (async () => {
      try {
        const res = await getConversation(interlocuteur);
        if (!vivant) return;
        const liste = res.data?.messages || [];
        setMessages(liste);
        // Ce que l'acheteur m'a écrit et que je viens de lire ne doit plus
        // compter comme non lu, ici comme sur son téléphone.
        liste
          .filter((m) => !m.lu && m.expediteurId === interlocuteur)
          .forEach((m) => marquerMessageLu(m.id).catch(() => {}));
      } catch {
        if (vivant) setMessages([]);
        toast.error('Conversation indisponible pour le moment.');
      }
    })();
    return () => { vivant = false; };
  }, [interlocuteur]);

  const repondre = async (e) => {
    e.preventDefault();
    const contenu = texte.trim();
    if (!contenu) return;
    setEnvoi(true);
    try {
      await envoyerMessage(interlocuteur, contenu);
      setMessages((l) => [...(l || []), {
        id: `local-${Date.now()}`, contenu, expediteurId: moi, createdAt: new Date().toISOString(),
      }]);
      setTexte('');
      onRepondu(contenu);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Message non envoyé. Réessayez.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <Modal isOpen onClose={onFerme} title={nom} description="Conversation dans l’application">
      {messages === null ? (
        <LoadingSpinner />
      ) : messages.length === 0 ? (
        <div className="empty-state"><p>Aucun message échangé</p></div>
      ) : (
        <ul className="fil-messages">
          {messages.map((m) => (
            <li key={m.id} className={`fil-messages__item${m.expediteurId === moi ? ' est-moi' : ''}`}>
              <p>{m.contenu}</p>
              <span className="td-muted">{formatDateTime(m.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}

      <form className="form-field" onSubmit={repondre} style={{ marginTop: 12 }}>
        <label className="form-label" htmlFor="reponse">Votre réponse</label>
        <textarea
          id="reponse"
          className="form-textarea"
          rows={3}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écrivez votre réponse…"
        />
        <button className="btn btn-primary" type="submit" disabled={envoi || !texte.trim()}>
          {envoi ? 'Envoi…' : 'Envoyer'}
        </button>
      </form>
    </Modal>
  );
}

/**
 * Conversations reçues : la liste, le fil de chacune et la réponse.
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
  const [conversations, setConversations] = useState([]);
  const [ouverte, setOuverte] = useState(null);
  useEffect(() => {
    if (!data) return;
    setMessagesSite(data.messagesSite);
    setConversations(data.conversations);
  }, [data]);

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {conversations.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <p>Aucune conversation pour l’instant</p>
                    </div>
                  </td>
                </tr>
              ) : conversations.map((c) => {
                const nonLus = c.nonLus ?? c.messagesNonLus ?? 0;
                // L'API ne donne pas d'identifiant de conversation : elle les
                // groupe par interlocuteur, et c'est lui la clé — c'est aussi
                // lui que `GET /messages/:userId` attend.
                const interlocuteur = c.interlocuteur?.id;
                return (
                  <tr key={interlocuteur || nomClient(c)}>
                    <td className="td-bold">{nomClient(c)}</td>
                    <td className="td-muted" style={{ maxWidth: 420 }}>
                      {c.dernierMessage?.contenu || c.dernierMessage || '—'}
                    </td>
                    <td className="td-muted">
                      {/* Le serveur nomme ce champ `date`. En lisant
                          `createdAt`, la colonne restait vide. */}
                      {formatDateTime(c.dernierMessage?.date || c.dernierMessage?.createdAt || c.updatedAt)}
                    </td>
                    <td>
                      <Badge variant={nonLus > 0 ? 'warning' : 'default'}>
                        {nonLus > 0 ? `${nonLus} non lu${nonLus > 1 ? 's' : ''}` : 'À jour'}
                      </Badge>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={!interlocuteur}
                        title={interlocuteur ? undefined : 'Interlocuteur inconnu'}
                        onClick={() => setOuverte({ id: interlocuteur, nom: nomClient(c) })}
                      >
                        Ouvrir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {ouverte && (
        <FilConversation
          interlocuteur={ouverte.id}
          nom={ouverte.nom}
          onFerme={() => setOuverte(null)}
          onRepondu={(contenu) => {
            // La liste reflète la réponse sans recharger : dernier message à
            // jour, et plus rien de non lu dans cette conversation.
            setConversations((l) => l.map((c) => (c.interlocuteur?.id === ouverte.id
              ? { ...c, nonLus: 0, dernierMessage: { contenu, date: new Date().toISOString() } }
              : c)));
          }}
        />
      )}
    </div>
  );
}
