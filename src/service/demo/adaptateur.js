import {
  VENDEUR_DEMO, BOUTIQUE_DEMO, DASHBOARD_DEMO, PRODUITS_DEMO, CATEGORIES_DEMO,
  COMMANDES_DEMO, PROMOTIONS_DEMO, CONVERSATIONS_DEMO, ABONNEMENT_DEMO, VERIFICATION_DEMO,
} from './donnees';

/**
 * Mode démo — l'espace vendeur tourne sans backend.
 *
 * Pensé pour travailler le design avant le déploiement : l'application se
 * comporte normalement (connexion, navigation, chargements, formulaires),
 * mais les requêtes sont servies par un jeu de données local.
 *
 * Activation, au choix :
 *   • VITE_DEMO=1 dans le .env
 *   • ?demo=1 dans l'URL (retenu ensuite pour la session)
 *
 * Rien n'est activé par défaut : sans l'un de ces deux signaux, le code
 * ci-dessous n'est jamais branché et l'application parle au vrai backend.
 */

const CLE = 'saambiz_mode_demo';

export function modeDemoActif() {
  if (import.meta.env.VITE_DEMO === '1') return true;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
      localStorage.setItem(CLE, '1');
      return true;
    }
    if (params.get('demo') === '0') {
      localStorage.removeItem(CLE);
      return false;
    }
    return localStorage.getItem(CLE) === '1';
  } catch {
    return false;
  }
}

// Le stock vit en mémoire : les créations et suppressions se voient à
// l'écran le temps de la session, ce qui suffit à juger les états d'une
// liste (vide, un élément, beaucoup).
let produits = [...PRODUITS_DEMO];
let promotions = [...PROMOTIONS_DEMO];
let commandes = [...COMMANDES_DEMO];
let boutique = { ...BOUTIQUE_DEMO };

const nouvelId = () => `demo-${Math.random().toString(36).slice(2, 9)}`;

/** Lit un FormData ou un corps JSON indifféremment. */
function corps(config) {
  const d = config.data;
  if (!d) return {};
  if (typeof FormData !== 'undefined' && d instanceof FormData) {
    return Object.fromEntries(d.entries());
  }
  try { return typeof d === 'string' ? JSON.parse(d) : d; } catch { return {}; }
}

/**
 * Table de routage : [méthode, expression du chemin, fabrique de réponse].
 * L'ordre compte, la première correspondance gagne.
 */
const ROUTES = [
  // ── Authentification ──
  ['POST', /\/auth\/login$/, (c) => {
    const { email } = corps(c);
    // Toute adresse contenant « admin » ouvre l'administration, les autres
    // l'espace vendeur : de quoi parcourir les deux sans backend.
    const estAdmin = String(email || '').toLowerCase().includes('admin');
    return {
      token: 'demo.' + btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 86400 })) + '.demo',
      utilisateur: estAdmin
        ? { ...VENDEUR_DEMO, id: 'demo-admin', prenom: 'Alassane', nom: 'Gueye',
            email: email || 'admin@saambiz.sn', role: 'Admin' }
        : { ...VENDEUR_DEMO, email: email || VENDEUR_DEMO.email },
      menus: estAdmin ? MENUS_DEMO : [],
    };
  }],
  ['POST', /\/auth\/logout$/, () => ({ message: 'Déconnecté' })],
  ['GET',  /\/account\/me$/, () => ({ utilisateur: VENDEUR_DEMO })],
  ['PUT',  /\/account\/modifier-profil$/, (c) => ({ message: 'Profil mis à jour', utilisateur: { ...VENDEUR_DEMO, ...corps(c) } })],

  // ── Tableau de bord ──
  ['GET', /\/vendeur\/dashboard$/, () => ({ data: { ...DASHBOARD_DEMO, boutique } })],
  ['GET', /\/vendeur\/statistiques(-vues)?$/, () => ({ data: DASHBOARD_DEMO.stats })],

  // ── Produits ──
  ['GET',    /\/vendeur\/liste-produits$/, () => ({ produits })],
  ['GET',    /\/vendeur\/recherche-produits/, (c) => {
    const q = String(c.params?.q || '').toLowerCase();
    return { produits: produits.filter((p) => p.nom.toLowerCase().includes(q)) };
  }],
  ['POST',   /\/vendeur\/ajout-produit$/, (c) => {
    const v = corps(c);
    const produit = {
      id: nouvelId(), nom: v.nom || 'Nouveau produit', prix: Number(v.prix) || 0,
      quantite: Number(v.quantite) || 0, disponible: true, description: v.description || '',
      categorie: CATEGORIES_DEMO.find((k) => k.id === v.categorieId) || CATEGORIES_DEMO[0],
      statutValidation: 'en_attente', vues: 0, createdAt: new Date().toISOString(),
    };
    produits = [produit, ...produits];
    return { message: 'Produit ajouté', produit };
  }],
  ['PUT',    /\/vendeur\/modifier-produit\//, (c) => {
    const id = c.url.split('/').pop();
    const v = corps(c);
    produits = produits.map((p) => (p.id === id ? { ...p, ...v, prix: Number(v.prix) || p.prix } : p));
    return { message: 'Produit modifié' };
  }],
  ['DELETE', /\/vendeur\/supprimer-produit\//, (c) => {
    const id = c.url.split('/').pop();
    produits = produits.filter((p) => p.id !== id);
    return { message: 'Produit supprimé' };
  }],
  ['PATCH',  /\/vendeur\/produit\/.+\/disponibilite$/, (c) => {
    const id = c.url.split('/')[3];
    produits = produits.map((p) => (p.id === id ? { ...p, disponible: !p.disponible } : p));
    return { message: 'Disponibilité mise à jour' };
  }],
  ['POST',   /\/vendeur\/produit\/.+\/dupliquer$/, (c) => {
    const id = c.url.split('/')[3];
    const source = produits.find((p) => p.id === id);
    if (source) produits = [{ ...source, id: nouvelId(), nom: `${source.nom} (copie)`, vues: 0 }, ...produits];
    return { message: 'Produit dupliqué' };
  }],

  // ── Boutique ──
  ['GET', /\/vendeur\/ma-boutique$/, () => ({ boutique })],
  ['PUT', /\/vendeur\/modifier-boutique$/, (c) => {
    boutique = { ...boutique, ...corps(c) };
    return { message: 'Boutique mise à jour', boutique };
  }],
  ['PUT', /\/vendeur\/boutique\/pause$/, () => { boutique = { ...boutique, statut: 'inactif' }; return { message: 'Boutique en pause' }; }],
  ['PUT', /\/vendeur\/boutique\/reactiver$/, () => { boutique = { ...boutique, statut: 'actif' }; return { message: 'Boutique réactivée' }; }],
  ['GET', /\/vendeur\/statut-verification$/, () => ({ verification: VERIFICATION_DEMO })],
  ['POST',/\/vendeur\/soumettre-verification$/, () => ({ message: 'Pièce transmise', verification: { ...VERIFICATION_DEMO, statutValidation: 'en_attente' } })],

  // ── Commandes ──
  ['GET', /\/commandes\/vendeur$/, () => ({ commandes })],
  ['PUT', /\/commandes\/.+\/statut$/, (c) => {
    const id = c.url.split('/')[2];
    const { statut } = corps(c);
    commandes = commandes.map((o) => (o.id === id ? { ...o, statut } : o));
    return { message: 'Statut mis à jour' };
  }],
  ['GET', /\/commandes\/[^/]+$/, (c) => {
    const id = c.url.split('/').pop();
    return { commande: commandes.find((o) => o.id === id) || commandes[0] };
  }],

  // ── Promotions ──
  ['GET',    /\/promotions/, () => ({ promotions })],
  ['POST',   /\/promotions$/, (c) => {
    const v = corps(c);
    promotions = [{ id: nouvelId(), active: true, ...v }, ...promotions];
    return { message: 'Promotion créée' };
  }],
  ['PUT',    /\/promotions\//, (c) => {
    const id = c.url.split('/').pop();
    promotions = promotions.map((p) => (p.id === id ? { ...p, ...corps(c) } : p));
    return { message: 'Promotion modifiée' };
  }],
  ['DELETE', /\/promotions\//, (c) => {
    const id = c.url.split('/').pop();
    promotions = promotions.filter((p) => p.id !== id);
    return { message: 'Promotion supprimée' };
  }],

  // ── Divers ──
  ['GET', /\/vendeur\/mes-conversations$/, () => ({ conversations: CONVERSATIONS_DEMO })],
  ['GET', /\/vendeur\/mon-abonnement$/, () => ({ data: ABONNEMENT_DEMO })],
  ['GET', /\/vendeur\/historique-paiements$/, () => ({ data: ABONNEMENT_DEMO.historique })],
  ['POST',/\/vendeur\/initier-renouvellement$/, () => ({ message: 'Paiement simulé — mode démo', url: null })],
  ['GET', /\/categories/, () => ({ categories: CATEGORIES_DEMO })],
];

// Menus de l'administration, pour que la barre de navigation ne soit pas vide
// si l'on se connecte avec une adresse contenant « admin ».
const MENUS_DEMO = [
  { code: 'DASHBOARD', name: "Vue d'ensemble", path: '/' },
  { code: 'VENDEURS', name: 'Vendeurs', path: '/vendeurs' },
  { code: 'VALIDATION_VENDEURS', name: 'Validation vendeurs', path: '/validation-vendeurs' },
  { code: 'PRODUITS', name: 'Produits', path: '/produits' },
  { code: 'COMMANDES', name: 'Commandes', path: '/commandes' },
  { code: 'ABONNEMENTS', name: 'Abonnements', path: '/abonnements' },
  { code: 'CONFIG', name: 'Configuration', path: '/config' },
];

/** Adaptateur axios : résout les requêtes sur le jeu de données local. */
export function adaptateurDemo(config) {
  const methode = (config.method || 'get').toUpperCase();
  const chemin = config.url || '';

  const route = ROUTES.find(([m, motif]) => m === methode && motif.test(chemin));

  // Une latence courte : sans elle, les états de chargement ne se voient
  // jamais et on ne peut pas les dessiner.
  const latence = 220 + Math.random() * 180;

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!route) {
        reject(Object.assign(new Error(`[démo] Route non simulée : ${methode} ${chemin}`), {
          config,
          response: { status: 404, data: { message: 'Non disponible en mode démo' }, config },
        }));
        return;
      }
      resolve({
        data: route[2](config),
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }, latence);
  });
}
