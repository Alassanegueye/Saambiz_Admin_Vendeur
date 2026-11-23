import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';
import { getCentreAide } from '../../service/aide.service';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/**
 * Le centre d'aide : les questions fréquentes et les moyens de joindre
 * SaamBiz, tous deux rédigés depuis le back-office (`/centre-aide`).
 *
 * L'application mobile l'ouvre depuis le profil du vendeur ; sur le web, un
 * vendeur bloqué n'avait aucun moyen de demander de l'aide depuis son espace.
 * Le serveur répond toujours, avec des contacts par défaut s'il ne peut pas
 * lire les siens : cette page ne tombe donc jamais en panne.
 */

const lienWhatsapp = (numero) => {
  const chiffres = String(numero || '').replace(/\D/g, '');
  return `https://wa.me/${chiffres}?text=${encodeURIComponent('Bonjour, j’ai besoin d’aide sur mon espace vendeur SaamBiz.')}`;
};

export default function AidePage() {
  const fetcher = useCallback(async () => {
    const res = await getCentreAide();
    return {
      contacts: res.data?.contacts || {},
      questions: res.data?.questions || [],
    };
  }, []);

  const { data, loading } = usePageData(fetcher, 'Centre d’aide indisponible');
  const [ouverte, setOuverte] = useState(null);

  if (loading) return <LoadingSpinner fullPage />;

  const contacts = data?.contacts || {};
  const questions = data?.questions || [];

  return (
    <div>
      <Helmet><title>Aide — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Aide</h1>
          <p>Les réponses aux questions courantes, et comment nous joindre</p>
        </div>
      </div>

      <div className="card carte-espacee">
        <div className="card-header"><h3 className="card-title">Nous contacter</h3></div>
        <div className="card-body">
          <div className="table-actions">
            {contacts.whatsapp && (
              <a
                className="btn btn-primary"
                href={lienWhatsapp(contacts.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            )}
            {contacts.telephone && (
              <a className="btn btn-secondary" href={`tel:${contacts.telephone}`}>
                Appeler {contacts.telephone}
              </a>
            )}
            {contacts.email && (
              <a className="btn btn-secondary" href={`mailto:${contacts.email}`}>
                {contacts.email}
              </a>
            )}
          </div>
          {!contacts.whatsapp && !contacts.telephone && !contacts.email && (
            <p className="form-hint">Aucun contact n’est publié pour le moment.</p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Questions fréquentes</h3></div>
        {questions.length === 0 ? (
          <div className="empty-state"><p>Aucune question publiée pour l’instant.</p></div>
        ) : (
          <ul className="liste-questions">
            {questions.map((q, i) => {
              const id = q.id ?? i;
              const estOuverte = ouverte === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    className="question-titre"
                    aria-expanded={estOuverte}
                    onClick={() => setOuverte(estOuverte ? null : id)}
                  >
                    <span>{q.question || q.titre}</span>
                    <span aria-hidden="true">{estOuverte ? '−' : '+'}</span>
                  </button>
                  {estOuverte && <p className="question-reponse">{q.reponse}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
