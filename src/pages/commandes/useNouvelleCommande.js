import { useCallback, useMemo, useState } from 'react';
import { toast } from '../../utils/alert';
import { creerCommandeVendeur, getTousMesProduits } from '../../service/vendeur.service';
import {
  FORM_VIDE, nouvelleLigne, totalLignes, verifierCommande, versRequete,
} from './nouvelleCommande';

/**
 * La fenêtre « Nouvelle commande » : le client, les produits choisis dans le
 * catalogue du vendeur (avec taille, couleur, quantité), la livraison.
 * Le catalogue n'est chargé qu'à la première ouverture.
 */
export default function useNouvelleCommande({ onCreee }) {
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState(FORM_VIDE);
  const [lignes, setLignes] = useState([]);
  const [erreurs, setErreurs] = useState({});
  const [saving, setSaving] = useState(false);

  const [produits, setProduits] = useState(null);
  const [chargementProduits, setChargementProduits] = useState(false);
  const [recherche, setRecherche] = useState('');

  const ouvrir = useCallback(async () => {
    setOuvert(true);
    if (produits !== null) return;
    setChargementProduits(true);
    try {
      setProduits(await getTousMesProduits());
    } catch {
      setProduits([]);
      toast.error('Impossible de charger vos produits.');
    } finally {
      setChargementProduits(false);
    }
  }, [produits]);

  const reinitialiser = () => {
    setForm(FORM_VIDE);
    setLignes([]);
    setErreurs({});
    setRecherche('');
  };

  const fermer = () => { if (!saving) setOuvert(false); };

  const changer = (champ, valeur) => {
    setForm((f) => ({ ...f, [champ]: valeur }));
    setErreurs((e) => (e[champ] ? { ...e, [champ]: undefined } : e));
  };

  const ajouterProduit = (produit) => {
    setLignes((ls) => {
      // Un produit sans option déjà présent : on augmente sa quantité plutôt
      // que d'ajouter une seconde ligne identique.
      const existante = ls.find((l) => l.produitId === produit.id && !l.options.length);
      if (existante) return ls.map((l) => (l === existante ? { ...l, quantite: Math.min(99, l.quantite + 1) } : l));
      return [...ls, nouvelleLigne(produit)];
    });
    setErreurs((e) => ({ ...e, lignes: undefined }));
  };
  const changerLigne = (uid, modif) => setLignes((ls) => ls.map((l) => (l.uid === uid ? { ...l, ...modif } : l)));
  const choisirOption = (uid, cle, valeur) => setLignes((ls) => ls.map((l) => (
    l.uid === uid ? { ...l, choix: { ...l.choix, [cle]: valeur } } : l)));
  const retirerLigne = (uid) => setLignes((ls) => ls.filter((l) => l.uid !== uid));

  const resultats = useMemo(() => {
    const liste = produits || [];
    const q = recherche.trim().toLowerCase();
    const filtres = q ? liste.filter((p) => String(p.nom || '').toLowerCase().includes(q)) : liste;
    return filtres.slice(0, 40);
  }, [produits, recherche]);

  const enregistrer = async () => {
    const e = verifierCommande(form, lignes);
    if (Object.keys(e).length) {
      setErreurs(e);
      toast.error(Object.values(e)[0]);
      return;
    }
    setSaving(true);
    try {
      const res = await creerCommandeVendeur(versRequete(form, lignes));
      const commande = res?.data?.commande || res?.data?.data?.commande || null;
      toast.success(`Commande ${commande?.reference || ''} enregistrée`.replace('  ', ' '));
      setOuvert(false);
      reinitialiser();
      onCreee?.(commande);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'La commande n’a pas pu être enregistrée.');
    } finally {
      setSaving(false);
    }
  };

  return {
    ouvert, ouvrir, fermer,
    form, changer, erreurs, saving, enregistrer,
    lignes, ajouterProduit, changerLigne, choisirOption, retirerLigne,
    total: totalLignes(lignes),
    produits, chargementProduits, recherche, setRecherche, resultats,
  };
}
