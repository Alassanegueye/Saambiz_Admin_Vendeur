/**
 * Avatar d'un compte, ou ses initiales quand aucune photo n'est enregistrée.
 * Partagé par toutes les listes de personnes (acheteurs, vendeurs, admins).
 */
export default function AvatarPersonne({ personne, grand = false }) {
  const initiales = `${personne?.prenom?.[0] || ''}${personne?.nom?.[0] || ''}`;
  const classe = grand ? 'avatar-grand' : '';

  return personne?.photoProfil
    ? <img className={`avatar ${classe}`} src={personne.photoProfil} alt={personne.nom} />
    : <div className={`avatar-placeholder ${classe}`}>{initiales}</div>;
}
