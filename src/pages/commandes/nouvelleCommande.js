/**
 * La commande saisie par le vendeur lui-même (prise par téléphone, sur
 * WhatsApp, en boutique). Fonctions sans dépendance, testées à part : le
 * formulaire ne fait qu'afficher ce qu'elles décident.
 *
 * Le serveur (POST /commandes/vendeur) revérifie tout : le téléphone, le
 * stock, le prix, et que chaque produit appartient bien au vendeur.
 */

/** Le prix payé aujourd'hui : la promo si elle est en cours, sinon le prix. */
export function prixActuel(produit) {
  const prix = Number(produit?.prix) || 0;
  const promo = Number(produit?.prix_promo ?? produit?.prixPromo);
  return promo > 0 && promo < prix ? promo : prix;
}

/** « tailles » → « Taille » ; « couleurs » → « Couleur ». */
function libelle(cle) {
  const sans = String(cle).replace(/_/g, ' ').trim();
  const singulier = /^(tailles|couleurs|pointures|modeles|modèles)$/i.test(sans) ? sans.replace(/s$/i, '') : sans;
  return singulier.charAt(0).toUpperCase() + singulier.slice(1);
}

/**
 * Les options entre lesquelles choisir, tirées des attributs du produit :
 * toute liste (tailles, couleurs, pointures…). Une couleur enregistrée avec
 * sa teinte ({ code, nom }) est ramenée à son nom — c'est ce que lit le
 * vendeur sur la commande.
 */
export function optionsDuProduit(produit) {
  const options = [];
  for (const [cle, valeurs] of Object.entries(produit?.attributs || {})) {
    if (!Array.isArray(valeurs) || !valeurs.length) continue;
    const vues = new Set();
    const liste = [];
    for (const v of valeurs) {
      const texte = String(v && typeof v === 'object' ? (v.nom || v.code || '') : (v ?? '')).trim();
      if (texte && !vues.has(texte)) { vues.add(texte); liste.push({ valeur: texte, code: v && typeof v === 'object' ? v.code || null : null }); }
    }
    if (liste.length) options.push({ cle, libelle: libelle(cle), valeurs: liste });
  }
  return options;
}

let compteur = 0;
/** Une ligne de commande, à partir d'un produit du catalogue. */
export function nouvelleLigne(produit) {
  compteur += 1;
  const options = optionsDuProduit(produit);
  // Une option à valeur unique est choisie d'office.
  const choix = {};
  for (const o of options) if (o.valeurs.length === 1) choix[o.cle] = o.valeurs[0].valeur;
  return {
    uid: `l${compteur}`,
    produitId: produit.id,
    nom: produit.nom,
    image: produit.image || produit.images?.[0]?.url || null,
    prix: prixActuel(produit),
    stock: Number.isFinite(Number(produit.quantite)) ? Number(produit.quantite) : null,
    options,
    choix,
    quantite: 1,
  };
}

export const totalLignes = (lignes) => lignes.reduce((s, l) => s + l.prix * l.quantite, 0);

export const FORM_VIDE = {
  prenom: '',
  nom: '',
  telephone: '',
  email: '',
  modeLivraison: 'retrait',
  adresseLivraison: '',
  note: '',
};

/**
 * Les erreurs à montrer avant d'envoyer : { champ: message }. Vide si la
 * commande peut partir.
 */
export function verifierCommande(form, lignes) {
  const erreurs = {};
  if (String(form.prenom || '').trim().length < 2) erreurs.prenom = 'Indiquez le prénom du client.';
  const chiffres = String(form.telephone || '').replace(/\D/g, '');
  if (chiffres.length < 9) erreurs.telephone = 'Indiquez un numéro valide, par exemple 77 123 45 67.';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(form.email).trim())) {
    erreurs.email = 'Adresse email invalide.';
  }
  if (form.modeLivraison === 'livraison' && !String(form.adresseLivraison || '').trim()) {
    erreurs.adresseLivraison = 'Indiquez l’adresse de livraison.';
  }
  if (!lignes.length) erreurs.lignes = 'Ajoutez au moins un produit.';
  else if (lignes.length > 30) erreurs.lignes = 'Trente produits au plus par commande.';
  else {
    const sansOption = lignes.find((l) => l.options.some((o) => !l.choix[o.cle]));
    if (sansOption) {
      const manque = sansOption.options.find((o) => !sansOption.choix[o.cle]);
      erreurs.lignes = `Choisissez : ${manque.libelle.toLowerCase()} pour « ${sansOption.nom} ».`;
    }
  }
  return erreurs;
}

/** Le corps attendu par POST /commandes/vendeur. */
export function versRequete(form, lignes) {
  const propre = (v) => String(v || '').trim();
  return {
    client: {
      prenom: propre(form.prenom),
      nom: propre(form.nom) || null,
      telephone: propre(form.telephone),
      email: propre(form.email) || null,
    },
    items: lignes.map((l) => ({
      produitId: l.produitId,
      quantite: l.quantite,
      ...(Object.keys(l.choix).length ? { options: { ...l.choix } } : {}),
    })),
    modeLivraison: form.modeLivraison === 'livraison' ? 'livraison' : 'retrait',
    adresseLivraison: form.modeLivraison === 'livraison' ? propre(form.adresseLivraison) : null,
    note: propre(form.note) || null,
  };
}
