import {
  VENDEUR_DEMO, BOUTIQUE_DEMO, DASHBOARD_DEMO, PRODUITS_DEMO, CATEGORIES_DEMO,
  COMMANDES_DEMO, PROMOTIONS_DEMO, CONVERSATIONS_DEMO, FILS_DEMO, MESSAGES_SITE_DEMO,
  NOTIFICATIONS_DEMO, ABONNES_DEMO, CENTRE_AIDE_DEMO, ABONNEMENT_DEMO, VERIFICATION_DEMO,
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

// Le site de la boutique, réglé comme celui d'un vendeur qui l'a déjà
// publié. « Supprimer mon site » le remet à zéro : on voit alors l'écran
// d'un site jamais publié.
const SITE_VIERGE = {
  slug: BOUTIQUE_DEMO.slug, active: false, configuree: false, modele: 'classique', accent: '#0D1B3D',
  apropos: '', annonce: '', horaires: '', reseaux: {},
  sections: { apropos: true, categories: true, avis: true, contact: true, nouveautes: true, meilleures: true },
  commande: true, paiementLivraison: true, vues: 0, sectionsPerso: [], blocs: { icones: {}, avantages: [] },
  photos: [], photosMax: 10,
};
let site = {
  ...SITE_VIERGE,
  active: true,
  configuree: true,
  modele: 'galerie',
  apropos: 'Atelier de couture à Sacré-Cœur depuis 2015 : prêt-à-porter et sur-mesure en wax, bazin et lin.',
  horaires: 'Lundi à samedi, 9h — 20h',
  reseaux: { instagram: 'https://instagram.com/sanse.couture' },
  vues: 1240,
  sectionsPerso: [
    { id: 'snouveautes', titre: 'Nouveautés', produitIds: ['p5', 'p6', 'p2'] },
    { id: 'spromos', titre: 'Promotions', produitIds: [] },
  ],
  blocs: { icones: {}, avantages: [{ icone: 'livraison', titre: 'Livraison rapide', texte: 'Partout au Sénégal' }] },
};

/** Même forme que GET /vendeur/ma-vitrine : `{ data: { vitrine, boutique, nombreProduits } }`. */
const reponseSite = () => ({
  data: {
    vitrine: { ...site, url: `https://saambiz.com/b/${site.slug}` },
    boutique: {
      nom: boutique.nom, slogan: boutique.slogan, logo: boutique.logo, banniere: boutique.banniere,
      ville: boutique.ville, telephone: boutique.telephone, whatsapp: boutique.whatsapp,
    },
    nombreProduits: produits.filter((p) => (p.statut || 'approuve') === 'approuve').length,
    modelesDisponibles: ['classique', 'galerie', 'catalogue'],
  },
});

/** Les catégories de la boutique telles que l'API les rend, à partir des valeurs du formulaire. */
const categoriesDe = (valeur) => {
  let liste = valeur;
  try { liste = typeof valeur === 'string' ? JSON.parse(valeur) : valeur; } catch { liste = [valeur]; }
  return (Array.isArray(liste) ? liste : [])
    .map((v) => CATEGORIES_DEMO.find((c) => [c.id, c.slug, c.nom].includes(v)))
    .filter(Boolean);
};

const erreurDemo = (status, message) => Object.assign(new Error(message), { status, message });

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
            email: email || 'admin@saambiz.com', role: 'Admin' }
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
  // Avec ses produits et ses catégories, comme l'API : la page en déduit la
  // pause (aucun produit disponible) et affiche les catégories.
  ['GET', /\/vendeur\/ma-boutique$/, () => ({
    boutique: { ...boutique, produits, categories: boutique.categories || categoriesDe([CATEGORIES_DEMO[0].id]) },
  })],
  ['PUT', /\/vendeur\/modifier-boutique$/, (c) => {
    const { categories, logo, ...champs } = corps(c);
    boutique = { ...boutique, ...champs };
    if (categories) boutique.categories = categoriesDe(categories);
    // Le logo choisi s'affiche le temps de la session.
    if (logo instanceof Blob) boutique.logo = URL.createObjectURL(logo);
    return { message: 'Boutique mise à jour', boutique };
  }],
  ['POST', /\/vendeur\/creer-boutique$/, (c) => {
    const { categories, ...champs } = corps(c);
    boutique = { ...BOUTIQUE_DEMO, ...champs, categories: categoriesDe(categories) };
    return { message: 'Boutique créée', boutique };
  }],
  // PATCH, comme l'API : la pause rend tous les produits indisponibles, la
  // réactivation les rend tous disponibles.
  ['PATCH', /\/vendeur\/boutique\/pause$/, () => {
    produits = produits.map((p) => ({ ...p, disponible: false }));
    return { message: 'Boutique mise en pause' };
  }],
  ['PATCH', /\/vendeur\/boutique\/reactiver$/, () => {
    produits = produits.map((p) => ({ ...p, disponible: true }));
    return { message: 'Boutique réactivée' };
  }],

  // ── Le site de la boutique ──
  ['GET', /\/vendeur\/ma-vitrine$/, reponseSite],
  ['GET', /\/vendeur\/ma-vitrine\/apercu$/, () => ({
    data: { boutique: { ...boutique }, catalogue: produits.filter((p) => (p.statut || 'approuve') === 'approuve') },
  })],
  ['PUT', /\/vendeur\/ma-vitrine$/, (c) => {
    const v = corps(c);
    if (v.slug !== undefined && !/^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/.test(v.slug)) {
      throw erreurDemo(400, "L'adresse doit faire entre 3 et 60 caractères : lettres sans accent, chiffres et tirets.");
    }
    site = { ...site, ...v };
    if (v.active && !site.configuree) site.configuree = true;
    return reponseSite();
  }],
  ['DELETE', /\/vendeur\/ma-vitrine$/, () => { site = { ...SITE_VIERGE }; return reponseSite(); }],
  ['POST', /\/vendeur\/ma-vitrine\/photos$/, (c) => {
    const fichiers = c.data instanceof FormData ? c.data.getAll('photos') : [];
    const nouvelles = fichiers.map((f) => ({ id: nouvelId(), url: URL.createObjectURL(f) }));
    site = { ...site, photos: [...site.photos, ...nouvelles].slice(0, site.photosMax) };
    return { ...reponseSite(), message: nouvelles.length > 1 ? `${nouvelles.length} photos ajoutées à votre site.` : 'Photo ajoutée à votre site.' };
  }],
  ['PUT', /\/vendeur\/ma-vitrine\/photos\/ordre$/, (c) => {
    const { ids = [] } = corps(c);
    const parId = new Map(site.photos.map((p) => [p.id, p]));
    const enTete = ids.map((id) => parId.get(id)).filter(Boolean);
    site = { ...site, photos: [...enTete, ...site.photos.filter((p) => !enTete.includes(p))] };
    return reponseSite();
  }],
  ['DELETE', /\/vendeur\/ma-vitrine\/photos\/[^/]+$/, (c) => {
    const id = (c.url || '').split('/').pop();
    site = { ...site, photos: site.photos.filter((p) => p.id !== id) };
    return reponseSite();
  }],
  ['GET', /\/vendeur\/statut-verification$/, () => ({ verification: VERIFICATION_DEMO })],
  ['POST',/\/vendeur\/soumettre-verification$/, () => ({ message: 'Pièce transmise', verification: { ...VERIFICATION_DEMO, statutValidation: 'en_attente' } })],

  // ── Commandes ──
  ['GET', /\/commandes\/vendeur$/, () => ({ commandes })],
  // Commande saisie par le vendeur : enregistrée confirmée, comme le serveur.
  ['POST', /\/commandes\/vendeur$/, (c) => {
    const { client, items } = corps(c);
    const lignes = items.map((i) => {
      const p = produits.find((x) => x.id === i.produitId) || {};
      return { produit: { nom: p.nom }, quantite: i.quantite, prix: p.prix || 0, options: i.options || null };
    });
    const montantTotal = lignes.reduce((s, l) => s + l.prix * l.quantite, 0);
    const reference = `#${1025 + commandes.length - 5}`;
    const commande = {
      id: `cmd-${Date.now()}`, reference, statut: 'confirmee', statutPaiement: 'en_attente',
      montantTotal, acompte: 0, createdAt: new Date().toISOString(), origine: 'dashboard',
      client: { prenom: client.prenom, nom: client.nom, telephone: client.telephone }, lignes,
    };
    commandes = [commande, ...commandes];
    return { commande };
  }],
  // Le service passe le statut en PATCH (voir changerStatutCommande).
  ['PATCH', /\/commandes\/.+\/statut$/, (c) => {
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
  // Le fil d'une conversation, et la réponse : le mode démo montre la
  // messagerie entière, pas seulement la liste.
  ['GET', /\/messages\/(?!site|conversations|non-lus)([^/]+)$/,
    (c) => ({ messages: FILS_DEMO[(c.url || '').split('/').pop()] || [] })],
  ['POST', /\/messages$/, () => ({ success: true, message: 'Message envoyé' })],
  ['PUT', /\/messages\/(?!site)[^/]+\/lire$/, () => ({ success: true })],
  // Notifications, abonnés et centre d'aide : les trois écrans portés depuis
  // l'application mobile.
  ['GET', /\/notifications$/, () => ({ notifications: NOTIFICATIONS_DEMO, total: NOTIFICATIONS_DEMO.length })],
  ['GET', /\/notifications\/non-lues$/, () => ({ nonLues: NOTIFICATIONS_DEMO.filter((n) => !n.lue).length })],
  ['PUT', /\/notifications\/toutes-lues$/, () => ({ success: true })],
  ['PUT', /\/notifications\/[^/]+\/lire$/, () => ({ success: true })],
  ['GET', /\/vendeur\/abonnes$/, () => ({
    total: ABONNES_DEMO.length,
    avecCloche: ABONNES_DEMO.filter((a) => a.clocheActive).length,
    abonnes: ABONNES_DEMO,
  })],
  ['GET', /\/vendeur\/abonnes\/[^/]+$/, (c) => {
    const id = (c.url || '').split('/').pop();
    return {
      abonne: ABONNES_DEMO.find((a) => a.id === id) || ABONNES_DEMO[0],
      activite: {
        commandes: 4,
        produitsCommandes: 7,
        derniereCommande: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      fidelite: 'Client fidèle',
    };
  }],
  ['GET', /\/centre-aide$/, () => CENTRE_AIDE_DEMO],
  ['GET', /\/prix-abonnement$/, () => ({ prix: 2000, devise: 'FCFA' })],
  ['GET', /\/messages\/site$/, () => ({ messages: MESSAGES_SITE_DEMO, total: MESSAGES_SITE_DEMO.length })],
  ['PUT', /\/messages\/site\/[^/]+\/lire$/, () => ({ success: true, message: 'Message marqué comme lu' })],
  ['DELETE', /\/messages\/site\/[^/]+$/, () => ({ success: true, message: 'Message supprimé' })],
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
      // Un gestionnaire qui lève laisserait la promesse sans suite : la
      // page resterait en « Chargement… » pour toujours, sans message ni
      // erreur. On le traite comme un échec ordinaire.
      let donnees;
      try {
        donnees = route[2](config);
      } catch (erreur) {
        // Une erreur prévue (erreurDemo) garde son statut et son message,
        // écrit pour le vendeur ; une autre est une panne de la démo.
        const prevue = Boolean(erreur.status);
        reject(Object.assign(erreur, {
          config,
          response: {
            status: erreur.status || 500,
            data: { message: prevue ? erreur.message : '[démo] ' + erreur.message },
            config,
          },
        }));
        return;
      }
      resolve({
        data: donnees,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }, latence);
  });
}
