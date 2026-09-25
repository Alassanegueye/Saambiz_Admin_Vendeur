/**
 * Jeu de données factices de l'espace vendeur — mode démo uniquement.
 *
 * Sert à travailler le design sans backend. Les valeurs sont réalistes
 * (prix en FCFA, noms sénégalais, catégories du catalogue) plutôt que
 * remplies de « Lorem » : une maquette ne se juge qu'avec du contenu
 * plausible — longueurs de libellés, montants à 6 chiffres, listes vides.
 */

const jours7 = () => {
  const montants = [45000, 0, 128000, 76500, 92000, 31000, 154000];
  return montants.map((montant, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString().slice(0, 10), montant };
  });
};

const ilYA = (jours) => {
  const d = new Date();
  d.setDate(d.getDate() - jours);
  return d.toISOString();
};

export const VENDEUR_DEMO = {
  id: 'demo-vendeur',
  nom: 'Ndiaye',
  prenom: 'Aïssatou',
  email: 'aissatou@boutique-demo.sn',
  telephone: '+221 77 123 45 67',
  ville: 'Dakar',
  role: 'Vendeur',
  statutValidation: 'approuve',
};

export const BOUTIQUE_DEMO = {
  id: 'demo-boutique',
  nom: 'Sañse Couture',
  slug: 'sanse-couture',
  description:
    'Prêt-à-porter et sur-mesure en wax, bazin et lin. Confection à Dakar, livraison dans tout le Sénégal.',
  slogan: 'Le sur-mesure, sans le délai',
  categorie: 'Mode',
  localisation: 'Sacré-Cœur, Dakar',
  ville: 'Dakar',
  telephone: '+221 77 123 45 67',
  whatsapp: '+221 77 123 45 67',
  statut: 'actif',
  logo: null,
  banniere: null,
  couleur_theme: '#F2B705',
  nombreFavoris: 312,
};

export const DASHBOARD_DEMO = {
  boutique: BOUTIQUE_DEMO,
  abonnement: {
    actif: true,
    formule: 'Premium',
    montant: 3000,
    dateFin: (() => { const d = new Date(); d.setDate(d.getDate() + 18); return d.toISOString(); })(),
    joursRestants: 18,
  },
  stats: {
    totalVues: 4820,
    nombreProduits: 34,
    nombreAbonnes: 312,
    chiffreAffaires: 1245000,
    nombreCommandes: 87,
    commandesEnAttente: 5,
  },
  revenus7Jours: jours7(),
  messagesNonLus: 3,
  notificationsNonLues: 7,
  // `vues` et `ventes` : le tableau de bord affiche les vues, d'autres vues
  // du produit s'appuient sur les ventes — on fournit les deux.
  topProduits: [
    { id: 'p1', nom: 'Ensemble bazin brodé', prix: 45000, vues: 842, ventes: 23, image: null },
    { id: 'p2', nom: 'Robe wax cintrée', prix: 28000, vues: 631, ventes: 19, image: null },
    { id: 'p3', nom: 'Chemise lin homme', prix: 18500, vues: 455, ventes: 14, image: null },
    { id: 'p4', nom: 'Boubou grand modèle', prix: 62000, vues: 389, ventes: 11, image: null },
    { id: 'p5', nom: 'Jupe pagne tissé', prix: 15000, vues: 267, ventes: 8, image: null },
  ],
};

export const PRODUITS_DEMO = [
  { id: 'p1', nom: 'Ensemble bazin brodé', prix: 45000, quantite: 6, disponible: true,
    categorie: { id: 'c1', nom: 'Mode' }, description: 'Bazin riche brodé main, coupe ajustée.',
    statutValidation: 'approuve', vues: 842, createdAt: ilYA(41) },
  { id: 'p2', nom: 'Robe wax cintrée', prix: 28000, quantite: 12, disponible: true,
    categorie: { id: 'c1', nom: 'Mode' }, description: 'Wax authentique, doublure coton.',
    statutValidation: 'approuve', vues: 631, createdAt: ilYA(33) },
  { id: 'p3', nom: 'Chemise lin homme', prix: 18500, quantite: 0, disponible: false,
    categorie: { id: 'c1', nom: 'Mode' }, description: 'Lin lavé, coupe droite. Rupture de stock.',
    statutValidation: 'approuve', vues: 455, createdAt: ilYA(28) },
  { id: 'p4', nom: 'Boubou grand modèle', prix: 62000, quantite: 3, disponible: true,
    categorie: { id: 'c1', nom: 'Mode' }, description: 'Grand boubou brodé, finitions dorées.',
    statutValidation: 'approuve', vues: 389, createdAt: ilYA(19) },
  { id: 'p5', nom: 'Jupe pagne tissé', prix: 15000, quantite: 9, disponible: true,
    categorie: { id: 'c1', nom: 'Mode' }, description: 'Pagne tissé Thiès, taille haute.',
    statutValidation: 'en_attente', vues: 112, createdAt: ilYA(4) },
  { id: 'p6', nom: 'Sac à main cuir', prix: 34000, quantite: 4, disponible: true,
    categorie: { id: 'c2', nom: 'Accessoires' }, description: 'Cuir tanné, bandoulière amovible.',
    statutValidation: 'approuve', vues: 267, createdAt: ilYA(12) },
];

export const CATEGORIES_DEMO = [
  { id: 'c1', nom: 'Mode' },
  { id: 'c2', nom: 'Accessoires' },
  { id: 'c3', nom: 'Beauté' },
  { id: 'c4', nom: 'Maison' },
  { id: 'c5', nom: 'Alimentation' },
];

export const COMMANDES_DEMO = [
  { id: 'cmd-1024', reference: '#1024', statut: 'en_attente', statutPaiement: 'paye',
    montantTotal: 45000, acompte: 13500, createdAt: ilYA(0),
    acheteur: { id: 'a1', prenom: 'Moussa', nom: 'Fall', telephone: '+221 78 222 11 00' },
    lignes: [{ produit: { nom: 'Ensemble bazin brodé' }, quantite: 1, prix: 45000 }] },
  { id: 'cmd-1023', reference: '#1023', statut: 'confirmee', statutPaiement: 'paye',
    montantTotal: 56000, acompte: 16800, createdAt: ilYA(1),
    acheteur: { id: 'a2', prenom: 'Fatou', nom: 'Diop', telephone: '+221 76 555 44 33' },
    lignes: [{ produit: { nom: 'Robe wax cintrée' }, quantite: 2, prix: 28000 }] },
  { id: 'cmd-1022', reference: '#1022', statut: 'expediee', statutPaiement: 'paye',
    montantTotal: 62000, acompte: 62000, createdAt: ilYA(3),
    acheteur: { id: 'a3', prenom: 'Ibrahima', nom: 'Sarr', telephone: '+221 70 111 22 33' },
    lignes: [{ produit: { nom: 'Boubou grand modèle' }, quantite: 1, prix: 62000 }] },
  { id: 'cmd-1021', reference: '#1021', statut: 'livree', statutPaiement: 'paye',
    montantTotal: 18500, acompte: 5550, createdAt: ilYA(6),
    acheteur: { id: 'a4', prenom: 'Awa', nom: 'Ba', telephone: '+221 77 888 99 00' },
    lignes: [{ produit: { nom: 'Chemise lin homme' }, quantite: 1, prix: 18500 }] },
  { id: 'cmd-1020', reference: '#1020', statut: 'annulee', statutPaiement: 'rembourse',
    montantTotal: 15000, acompte: 0, createdAt: ilYA(9),
    acheteur: { id: 'a5', prenom: 'Khady', nom: 'Sow', telephone: '+221 78 333 22 11' },
    lignes: [{ produit: { nom: 'Jupe pagne tissé' }, quantite: 1, prix: 15000 }] },
];

export const PROMOTIONS_DEMO = [
  { id: 'promo-1', titre: 'Tabaski −20 %', description: 'Sur tout le bazin brodé.',
    pourcentage: 20, active: true, dateDebut: ilYA(5),
    dateFin: (() => { const d = new Date(); d.setDate(d.getDate() + 9); return d.toISOString(); })() },
  { id: 'promo-2', titre: 'Nouvelle collection', description: 'Wax et pagne tissé, −10 %.',
    pourcentage: 10, active: true, dateDebut: ilYA(2),
    dateFin: (() => { const d = new Date(); d.setDate(d.getDate() + 21); return d.toISOString(); })() },
  { id: 'promo-3', titre: 'Déstockage lin', description: 'Terminée.',
    pourcentage: 30, active: false, dateDebut: ilYA(40), dateFin: ilYA(12) },
];

export const CONVERSATIONS_DEMO = [
  { interlocuteur: { id: 'a1', prenom: 'Moussa', nom: 'Fall', photoProfil: null, role: 'Acheteur' },
    dernierMessage: { contenu: 'Bonjour, le bazin est disponible en bleu ?', date: ilYA(0), lu: false }, nonLus: 2 },
  { interlocuteur: { id: 'a2', prenom: 'Fatou', nom: 'Diop', photoProfil: null, role: 'Acheteur' },
    dernierMessage: { contenu: 'Merci beaucoup, la robe est parfaite !', date: ilYA(1), lu: true }, nonLus: 0 },
  { interlocuteur: { id: 'a3', prenom: 'Ibrahima', nom: 'Sarr', photoProfil: null, role: 'Acheteur' },
    dernierMessage: { contenu: 'Je passe récupérer la commande demain matin.', date: ilYA(2), lu: false }, nonLus: 1 },
];

export const ABONNEMENT_DEMO = {
  abonnement: DASHBOARD_DEMO.abonnement,
  historique: [
    { id: 'pay-3', montant: 3000, moyen: 'Wave', statut: 'paye', createdAt: ilYA(12) },
    { id: 'pay-2', montant: 3000, moyen: 'Orange Money', statut: 'paye', createdAt: ilYA(42) },
    { id: 'pay-1', montant: 3000, moyen: 'Wave', statut: 'paye', createdAt: ilYA(72) },
  ],
};

export const VERIFICATION_DEMO = {
  statutValidation: 'approuve',
  dateSoumission: ilYA(60),
  dateValidation: ilYA(58),
  motifRejet: null,
  pieceIdentite: 'cni-recto.jpg',
  typePiece: 'CNI',
};
