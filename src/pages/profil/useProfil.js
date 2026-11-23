import { useState, useEffect } from 'react';
import { toast, showConfirm, demanderTexte } from '../../utils/alert';
import { getMe } from '../../service/auth.service';
import { modifierProfil, supprimerMonCompte } from '../../service/compte.service';
import { changerMotDePasse } from '../../service/password.service';
import { useAuth } from '../../hooks/useAuth';
import { erreurMotDePasse } from '../../utils/motDePasse';

/**
 * Contrôleur de la page Profil.
 *
 * Deux formulaires indépendants : l'identité et le mot de passe. Ils sont
 * séparés jusque dans l'état, parce qu'une erreur sur l'un ne doit pas vider
 * l'autre — perdre son adresse en se trompant de mot de passe est agaçant.
 */

const PROFIL_VIDE = { nom: '', prenom: '', email: '', telephone: '', ville: '' };
const MDP_VIDE = { ancien: '', nouveau: '', confirmation: '' };



export default function useProfil() {
  const { user, majUtilisateur, logout } = useAuth();

  const [chargement, setChargement] = useState(true);
  const [profil, setProfil] = useState(PROFIL_VIDE);
  const [enregistrement, setEnregistrement] = useState(false);

  const [mdp, setMdp] = useState(MDP_VIDE);
  const [changementMdp, setChangementMdp] = useState(false);
  const [suppression, setSuppression] = useState(false);
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
    // Les règles exactes du serveur, nommées une par une : « au moins 12
    // caractères » était faux, et ne disait rien des majuscules ni des
    // caractères spéciaux que le serveur exige pourtant.
    const manque = erreurMotDePasse(mdp.nouveau);
    if (manque) {
      setErreurMdp(manque);
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

  /**
   * Suppression du compte. Deux confirmations plutôt qu'une : c'est définitif,
   * et la seconde demande le motif que le serveur enregistre — l'application
   * mobile procède de la même façon.
   */
  const supprimerCompte = async () => {
    const certain = await showConfirm({
      titre: 'Supprimer votre compte ?',
      message: 'Votre compte, votre boutique et vos produits seront supprimés. Cette action est définitive.',
      confirmText: 'Continuer',
      danger: true,
    });
    if (!certain) return;

    const motif = await demanderTexte({
      titre: 'Pourquoi partez-vous ?',
      message: 'Quelques mots nous aident à comprendre. Vous pouvez aussi laisser vide.',
      placeholder: 'Ex. je ne vends plus en ligne.',
      confirmText: 'Supprimer définitivement',
      obligatoire: false,
    });
    if (motif === null) return;

    setSuppression(true);
    try {
      await supprimerMonCompte(motif);
      toast.success('Votre compte a été supprimé.');
      await logout();
    } catch (err) {
      // 409 : une commande en cours empêche la suppression. Le message du
      // serveur dit laquelle, il vaut mieux que le nôtre.
      toast.error(err?.response?.data?.message || 'Suppression impossible pour le moment.');
      setSuppression(false);
    }
  };

  return {
    user, chargement, initiales,
    suppression, supprimerCompte,
    profil, majChamp, enregistrement, enregistrerProfil,
    mdp, majMdp, changementMdp, erreurMdp, enregistrerMdp,
  };
}
