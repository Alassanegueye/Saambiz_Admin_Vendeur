/**
 * Le message à montrer au vendeur quand un enregistrement échoue : celui du
 * serveur s'il en donne un, sinon la vraie raison (serveur injoignable,
 * délai dépassé, erreur serveur) plutôt qu'un « a échoué » sans indice.
 */
export function messageErreur(e, defaut) {
  const message = e?.response?.data?.message;
  if (message) return message;
  if (e?.code === 'ECONNABORTED') return 'Le serveur met trop de temps à répondre. Réessayez dans un instant.';
  const statut = e?.response?.status;
  if (!e?.response || [502, 503, 504].includes(statut) || (statut === 500 && !e.response.data)) {
    return 'Serveur injoignable : vérifiez votre connexion (en local, que le backend est bien lancé), puis réessayez.';
  }
  return statut ? `${defaut} (erreur ${statut}).` : defaut;
}
