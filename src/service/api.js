import axios from 'axios';
import { modeDemoActif, adaptateurDemo } from './demo/adaptateur';
import {
  getToken, setToken, removeToken,
  getRefreshToken, setRefreshToken,
  clearAuth,
} from '../utils/storage';

/**
 * Module réseau unique de l'application.
 *
 * Aucun composant n'importe axios : tout passe par cette instance, qui porte
 * l'adresse de l'API, le jeton, et la prolongation silencieuse de session.
 */
const api = axios.create({
  // Repli explicite sur le chemin relatif versionné : en développement, le
  // proxy de Vite renvoie /saambiz vers le backend local (vite.config.js).
  baseURL: import.meta.env.VITE_API_BASE_URL || '/saambiz/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Mode démo : les requêtes sont servies par un jeu de données local, le
// backend n'est jamais appelé. Sans le drapeau, rien ne change.
if (modeDemoActif()) {
  api.defaults.adapter = adaptateurDemo;
}

// ─── Prolongation silencieuse de session ────────────────────────────────────
//
// Le jeton d'accès vaut une heure. Sans ce mécanisme, l'application
// déconnectait sèchement au bout d'une heure, en pleine saisie d'un produit,
// alors que le backend émet un jeton de rafraîchissement prévu pour ça.
//
// La file d'attente est le point délicat : quand une page lance six requêtes
// en parallèle et que le jeton vient d'expirer, les six reçoivent un 401. Sans
// file, on déclenche six rafraîchissements concurrents — dont cinq échouent,
// puisque le backend fait tourner le jeton à chaque usage — et l'utilisateur
// est déconnecté malgré tout. On ne rafraîchit donc qu'une fois, les autres
// attendent le résultat.
let rafraichissementEnCours = null;
let fileDAttente = [];

function libererLaFile(nouveauToken, erreur) {
  fileDAttente.forEach(({ resoudre, rejeter }) => {
    if (erreur) rejeter(erreur);
    else resoudre(nouveauToken);
  });
  fileDAttente = [];
}

async function rafraichirSession() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('Aucun jeton de rafraîchissement');

  // Instance nue : passer par `api` relancerait l'intercepteur et, sur un
  // refresh refusé, boucler indéfiniment.
  const reponse = await axios.post(
    `${api.defaults.baseURL}/auth/refresh`,
    { refreshToken: refresh },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
  );

  const { token, refreshToken: nouveauRefresh } = reponse.data || {};
  if (!token) throw new Error('Réponse de rafraîchissement invalide');

  setToken(token);
  // Le backend fait tourner le refresh à chaque usage : ne pas enregistrer le
  // nouveau condamnerait la prolongation suivante.
  if (nouveauRefresh) setRefreshToken(nouveauRefresh);

  return token;
}

function deconnecter() {
  clearAuth();
  if (window.location.pathname !== '/connexion') {
    window.location.href = '/connexion';
  }
}

/**
 * Prénoms et noms toujours affichés selon la règle SaamBiz (« Awa DIOP »),
 * y compris pour un compte enregistré avant que le serveur ne l'applique.
 * Ne touche qu'aux objets qui portent un `prenom` (personnes) : le `nom`
 * d'un produit ou d'une catégorie reste intact.
 */
const formaterPrenom = (v) => (typeof v === 'string'
  ? v.replace(/\s+/g, ' ').trim().toLocaleLowerCase('fr-FR')
    .split(' ').map((m) => m.split('-').map((x) => (x ? x.charAt(0).toLocaleUpperCase('fr-FR') + x.slice(1) : x)).join('-')).join(' ')
  : v);
const formaterNom = (v) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().toLocaleUpperCase('fr-FR') : v);

function normaliserNoms(donnee, profondeur = 0) {
  if (!donnee || typeof donnee !== 'object' || profondeur > 8) return;
  if (Array.isArray(donnee)) { donnee.forEach((d) => normaliserNoms(d, profondeur + 1)); return; }
  if ('prenom' in donnee) {
    donnee.prenom = formaterPrenom(donnee.prenom);
    if ('nom' in donnee) donnee.nom = formaterNom(donnee.nom);
  }
  if ('clientPrenom' in donnee) donnee.clientPrenom = formaterPrenom(donnee.clientPrenom);
  if ('clientNom' in donnee) donnee.clientNom = formaterNom(donnee.clientNom);
  Object.values(donnee).forEach((v) => normaliserNoms(v, profondeur + 1));
}

api.interceptors.response.use(
  (reponse) => { normaliserNoms(reponse.data); return reponse; },
  async (erreur) => {
    const requete = erreur.config;
    const statut = erreur.response?.status;

    // On ne tente la prolongation que sur un 401, une seule fois par requête,
    // et jamais sur la route de rafraîchissement elle-même.
    const rejouable =
      statut === 401
      && requete
      && !requete._rejouee
      && !requete.url?.includes('/auth/refresh')
      && !requete.url?.includes('/auth/login');

    if (!rejouable) {
      if (statut === 401) deconnecter();
      return Promise.reject(erreur);
    }

    requete._rejouee = true;

    if (!getRefreshToken()) {
      deconnecter();
      return Promise.reject(erreur);
    }

    // Un rafraîchissement est déjà parti : on attend son résultat.
    if (rafraichissementEnCours) {
      return new Promise((resoudre, rejeter) => {
        fileDAttente.push({
          resoudre: (token) => {
            requete.headers.Authorization = `Bearer ${token}`;
            resoudre(api(requete));
          },
          rejeter,
        });
      });
    }

    rafraichissementEnCours = rafraichirSession();

    try {
      const token = await rafraichissementEnCours;
      libererLaFile(token, null);
      requete.headers.Authorization = `Bearer ${token}`;
      return api(requete);
    } catch (echec) {
      libererLaFile(null, echec);
      removeToken();
      deconnecter();
      return Promise.reject(erreur);
    } finally {
      rafraichissementEnCours = null;
    }
  }
);

export default api;
