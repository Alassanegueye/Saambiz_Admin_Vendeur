import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import FormIdentite from './components/FormIdentite';
import FormMotDePasse from './components/FormMotDePasse';
import useProfil from './useProfil';

/**
 * Compte du vendeur, pas sa boutique : nom, email, téléphone, mot de passe.
 * Tout ce qui concerne la vitrine se règle dans « Boutique ».
 */
export default function ProfilPage() {
  const p = useProfil();

  if (p.chargement) return <LoadingSpinner fullPage />;

  return (
    <div>
      <Helmet><title>Mon profil — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Mon profil</h1>
          <p>Vos informations personnelles et votre mot de passe</p>
        </div>
      </div>

      <div className="profil-entete card">
        <div className="profil-avatar" aria-hidden="true">{p.initiales}</div>
        <div>
          <strong>{`${p.profil.prenom} ${p.profil.nom}`.trim() || 'Compte'}</strong>
          <span>{p.profil.email}</span>
        </div>
        <span className="profil-role">{p.user?.role}</span>
      </div>

      <div className="profil-grille">
        <FormIdentite
          profil={p.profil}
          majChamp={p.majChamp}
          enregistrement={p.enregistrement}
          onEnregistrer={p.enregistrerProfil}
        />
        <FormMotDePasse
          mdp={p.mdp}
          majMdp={p.majMdp}
          changementMdp={p.changementMdp}
          erreurMdp={p.erreurMdp}
          longueurMin={p.LONGUEUR_MIN_MDP}
          onEnregistrer={p.enregistrerMdp}
        />
      </div>
    </div>
  );
}
