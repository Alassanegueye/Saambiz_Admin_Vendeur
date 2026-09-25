import { useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../service/auth.service';
import {
  getToken, setToken, tokenExpire,
  getRefreshToken, setRefreshToken,
  getUser, setUser,
  getMenus, setMenus as ecrireMenus,
  clearAuth,
} from '../utils/storage';
import { AuthContext } from './authContexte';

// Application réservée aux vendeurs : un compte d'un autre rôle est rejeté à
// la connexion plutôt que d'entrer dans une interface qui ne lui correspond pas.
const ROLES_AUTORISES = ['Vendeur'];

/**
 * Source de vérité unique de la session côté client.
 *
 * L'autorité reste le backend : cet état sert à afficher la bonne interface,
 * pas à autoriser quoi que ce soit. Un utilisateur qui trafique son stockage
 * verra un menu d'administrateur et se fera refuser à chaque requête.
 */
export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menus, setMenusState] = useState(() => getMenus());

  const clearSession = useCallback(() => {
    clearAuth();
    setTokenState(null);
    setUserState(null);
    setMenusState([]);
  }, []);

  /** Met à jour l'utilisateur courant — page « Mon profil ». */
  const majUtilisateur = useCallback((champs) => {
    setUserState((precedent) => {
      const maj = { ...(precedent || {}), ...champs };
      setUser(maj);
      return maj;
    });
  }, []);

  useEffect(() => {
    const init = async () => {
      const jetonStocke = getToken();
      if (!jetonStocke) { setIsLoading(false); return; }

      // Expiration vérifiée côté client avant tout appel : inutile d'envoyer
      // une requête qu'on sait condamnée. L'intercepteur prendra le relais si
      // le jeton expire pendant la session.
      if (tokenExpire() && !getRefreshToken()) {
        clearSession();
        setIsLoading(false);
        return;
      }

      try {
        const res = await getMe();
        const utilisateur = res.data?.utilisateur || res.data?.data || res.data;
        if (utilisateur && ROLES_AUTORISES.includes(utilisateur.role)) {
          setUser(utilisateur);
          setTokenState(getToken());
          setUserState(utilisateur);
        } else {
          clearSession();
        }
      } catch {
        // Serveur injoignable : on repart de l'utilisateur mémorisé plutôt
        // que de déconnecter sur une coupure réseau passagère. L'intercepteur
        // a déjà tenté la prolongation si l'échec venait d'un 401.
        const memorise = getUser();
        if (memorise && ROLES_AUTORISES.includes(memorise.role)) {
          setTokenState(jetonStocke);
          setUserState(memorise);
        } else {
          clearSession();
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const reponse = await apiLogin(email, password);
    const { token: nouveauToken, refreshToken, utilisateur, menus: menusRecus } = reponse.data;

    setToken(nouveauToken);
    setUser(utilisateur);
    if (refreshToken) setRefreshToken(refreshToken);

    const menusResolus = menusRecus || [];
    ecrireMenus(menusResolus);

    setTokenState(nouveauToken);
    setUserState(utilisateur);
    setMenusState(menusResolus);
    return utilisateur;
  }, []);

  const logout = useCallback(async () => {
    // Le refresh part au serveur pour être révoqué : sans lui, la session
    // resterait reconstituable côté backend jusqu'à son expiration.
    try {
      await apiLogout(getRefreshToken());
    } catch { /* déconnexion locale malgré tout */ }
    clearSession();
    window.location.href = '/connexion';
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{ user, token, menus, isLoading, login, logout, majUtilisateur }}
    >
      {children}
    </AuthContext.Provider>
  );
}
