import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from '../utils/alert';
import { useAuth } from './useAuth';

const FREEZE_SECONDS = 30;
// Le serveur répond 400 à un mot de passe faux, 401 à un jeton refusé.
const IDENTIFIANTS_REFUSES = [400, 401];

const HTTP_ERRORS = {
  400: 'Données de connexion invalides.',
  401: 'Email ou mot de passe incorrect.',
  403: 'Accès refusé.',
  404: 'Service introuvable.',
  429: 'Trop de tentatives. Réessayez plus tard.',
  500: 'Erreur serveur. Réessayez dans quelques instants.',
};

/**
 * Mécanique commune aux deux écrans de connexion (administration et espace
 * vendeur) : saisie, gel optionnel, traduction des erreurs HTTP.
 *
 * Le serveur est la seule source de vérité sur les « trop de tentatives » :
 * son message (avec le temps d'attente réel) est affiché tel quel. Le gel
 * local n'existe que si l'écran le demande (`gelApres`), et seuls les mots de
 * passe refusés le font avancer — pas une panne, ni un refus de rôle.
 *
 * Les deux écrans restent deux pages distinctes — publics, discours et
 * destinations n'ont rien à voir — mais rien ne justifie de dupliquer ce
 * garde-fou, qui est une mesure de sécurité.
 *
 * @param onConnecte  reçoit l'utilisateur authentifié ; renvoie un message
 *                    d'erreur si son rôle n'a pas sa place sur cet écran,
 *                    sinon effectue la redirection et ne renvoie rien.
 */
export default function useLoginForm(onConnecte, { gelApres = null } = {}) {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [frozen, setFrozen] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const startFreeze = useCallback(() => {
    setFrozen(true);
    setCountdown(FREEZE_SECONDS);
    let restant = FREEZE_SECONDS;
    timerRef.current = setInterval(() => {
      restant -= 1;
      setCountdown(restant);
      if (restant <= 0) {
        clearInterval(timerRef.current);
        setFrozen(false);
        setAttempts(0);
        setCountdown(0);
      }
    }, 1000);
  }, []);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (frozen) return;
    if (!email.trim()) { toast.error("L'email est requis"); return; }
    if (!password) { toast.error('Le mot de passe est requis'); return; }

    setLoading(true);
    try {
      const utilisateur = await login(email.trim(), password);
      const refus = onConnecte(utilisateur);
      if (refus) toast.error(refus);
    } catch (err) {
      // Pas de réponse du tout : serveur éteint, mauvaise adresse d'API, ou
      // origine refusée par le CORS. Le dire explicitement évite de chercher
      // du côté du mot de passe pendant une heure.
      if (!err?.response) {
        toast.error(
          "Serveur injoignable. Vérifiez que l'API tourne et que cette adresse "
          + 'est autorisée par le CORS.',
          { autoClose: 8000 }
        );
        return;
      }
      const status = err.response.status;
      toast.error(err.response.data?.message || HTTP_ERRORS[status] || 'Erreur de connexion.');
      if (!IDENTIFIANTS_REFUSES.includes(status) || !gelApres) return;
      const essais = attempts + 1;
      setAttempts(essais);
      if (essais >= gelApres) {
        toast.warning(`Trop de tentatives. Attente de ${FREEZE_SECONDS} secondes.`);
        startFreeze();
      }
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, loading, frozen, countdown, handleSubmit };
}
