import { useState, useEffect } from 'react';
import { toast } from '../../utils/alert';
import { getMe } from '../../service/auth.service';
import { modifierProfil } from '../../service/compte.service';
import { changerMotDePasse } from '../../service/password.service';
import { useAuth } from '../../hooks/useAuth';

/**
 * Contrôleur de la page Profil.
 *
 * Deux formulaires indépendants : l'identité et le mot de passe. Ils sont
 * séparés jusque dans l'état, parce qu'une erreur sur l'un ne doit pas vider
 * l'autre — perdre son adresse en se trompant de mot de passe est agaçant.
 */

const PROFIL_VIDE = { nom: '', prenom: '', email: '', telephone: '', ville: '' };
const MDP_VIDE = { ancien: '', nouveau: '', confirmation: '' };

/** Longueur exigée par la politique du backend. */
const LONGUEUR_MIN_MDP = 12;

export default function useProfil() {
  const { user, majUtilisateur } = useAuth();

  const [chargement, setChargement] = useState(true);
  const [profil, setProfil] = useState(PROFIL_VIDE);
  const [enregistrement, setEnregistrement] = useState(false);

  const [mdp, setMdp] = useState(MDP_VIDE);
  const [changementMdp, setChangementMdp] = useState(false);
  const [erreurMdp, setErreurMdp] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMe();
        const u = res.data?.utilisateur || res.data?.user || res.data || {};
        setProfil({
          nom: u.nom || '',
          prenom: u.prenom || '',
          email: u.email || '',
          telephone: u.telephone || '',
          ville: u.ville || '',
        });
      } catch {
        // Le contexte d'authentification porte déjà l'essentiel : on s'en
        // sert de repli plutôt que d'afficher une page vide.
        setProfil({
          nom: user?.nom || '',
          prenom: user?.prenom || '',
          email: user?.email || '',
          telephone: user?.telephone || '',
          ville: user?.ville || '',
        });
      } finally {
        setChargement(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const majChamp = (champ) => (e) => setProfil((p) => ({ ...p, [champ]: e.target.value }));
  const majMdp = (champ) => (e) => setMdp((m) => ({ ...m, [champ]: e.target.value }));

  const enregistrerProfil = async (e) => {
    e.preventDefault();
    if (!profil.nom.trim() || !profil.prenom.trim()) {
      toast.error('Le nom et le prénom sont obligatoires');
      return;
    }
    setEnregistrement(true);
    try {
      await modifierProfil({
        nom: profil.nom.trim(),
        prenom: profil.prenom.trim(),
        email: profil.email.trim(),
        telephone: profil.telephone.trim(),
        ville: profil.ville.trim(),
      });
      // La barre de navigation affiche le nom : on rafraîchit le contexte
      // pour ne pas attendre une reconnexion.
      majUtilisateur?.(profil);
      toast.success('Profil mis à jour');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setEnregistrement(false);
    }
  };

  const enregistrerMdp = async (e) => {
    e.preventDefault();
    setErreurMdp(null);

    // Contrôles côté client d'abord : inutile d'envoyer une requête qu'on
    // sait refusée, et le message arrive sans attendre le réseau.
    if (mdp.nouveau !== mdp.confirmation) {
      setErreurMdp('La confirmation ne correspond pas au nouveau mot de passe.');
      return;
    }
    if (mdp.nouveau.length < LONGUEUR_MIN_MDP) {
      setErreurMdp(`Le nouveau mot de passe doit contenir au moins ${LONGUEUR_MIN_MDP} caractères.`);
      return;
    }

    setChangementMdp(true);
    try {
      // L'API attend aussi la confirmation : elle la revérifie côté serveur.
      await changerMotDePasse({
        ancienMotDePasse: mdp.ancien,
        nouveauMotDePasse: mdp.nouveau,
        confirmation: mdp.confirmation,
      });
      setMdp(MDP_VIDE);
      toast.success('Mot de passe modifié');
    } catch (err) {
      setErreurMdp(err?.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setChangementMdp(false);
    }
  };

  const initiales = `${(profil.prenom || '')[0] || ''}${(profil.nom || '')[0] || ''}`
    .toUpperCase() || 'V';

  return {
    user, chargement, initiales,
    profil, majChamp, enregistrement, enregistrerProfil,
    mdp, majMdp, changementMdp, erreurMdp, enregistrerMdp,
    LONGUEUR_MIN_MDP,
  };
}
