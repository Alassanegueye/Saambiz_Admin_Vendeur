// ─────────────────────────────────────────────────────────────────────────
// utils/alert.js — Notifications et confirmations (SweetAlert2)
//
// Même présentation que le dashboard Yobante Boutique : petites alertes en
// haut à droite (icône animée, barre de temps), aux couleurs SaamBiz.
// Fichier unique pour TOUTES les alertes de l'application.
//
// `toast` reprend l'API de react-toastify (toast.success / error / info /
// warning) : les écrans existants l'appellent sans changement.
// ─────────────────────────────────────────────────────────────────────────
import Swal from 'sweetalert2';

const COULEURS = {
  confirm: '#0D1B3D', // bleu marine SaamBiz
  danger: '#C62828',
  neutre: '#6B7280',
};

const BASE = {
  background: '#ffffff',
  color: '#0D1B3D',
  confirmButtonColor: COULEURS.confirm,
  cancelButtonColor: COULEURS.neutre,
  confirmButtonText: 'OK',
  cancelButtonText: 'Annuler',
  buttonsStyling: true,
  reverseButtons: true,
  customClass: {
    popup: 'swal2-saambiz',
    title: 'swal2-saambiz__titre',
    htmlContainer: 'swal2-saambiz__corps',
  },
};

/** Texte lisible depuis une chaîne, une erreur Axios ou une erreur JS. */
const texte = (valeur, defaut) => {
  if (typeof valeur === 'string' && valeur.trim()) return valeur;
  if (valeur && typeof valeur === 'object') {
    const m = valeur.response?.data?.message || valeur.message || valeur.error;
    if (typeof m === 'string' && m.trim()) return m;
  }
  return defaut;
};

// ⚠️ XSS : les messages peuvent reprendre des saisies (nom de produit, de
// boutique…). Ils passent toujours par `titleText`, affiché en texte brut.
const alerte = (icon, message, defaut, duree, options = {}) =>
  Swal.fire({
    ...BASE,
    icon,
    titleText: texte(message, defaut),
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    // `autoClose` (ancienne API react-toastify) reste accepté.
    timer: options.autoClose ?? options.timer ?? duree,
    timerProgressBar: true,
    didOpen: (popup) => {
      // Une pause au survol, comme les notifications précédentes.
      popup.addEventListener('mouseenter', Swal.stopTimer);
      popup.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

export const showSuccess = (message, defaut = 'Opération réussie', options) =>
  alerte('success', message, defaut, 2500, options);
export const showError = (erreur, defaut = 'Une erreur est survenue', options) =>
  alerte('error', erreur, defaut, 3500, options);
export const showInfo = (message, defaut = 'Information', options) =>
  alerte('info', message, defaut, 3000, options);
export const showWarning = (message, defaut = 'Attention', options) =>
  alerte('warning', message, defaut, 3000, options);

/**
 * Modale de confirmation : résout `true` si l'utilisateur confirme.
 * À utiliser avant toute action destructive.
 */
export const showConfirm = ({
  titre = 'Confirmer',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  danger = false,
}) =>
  Swal.fire({
    ...BASE,
    icon: danger ? 'warning' : 'question',
    title: titre,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: danger ? COULEURS.danger : COULEURS.confirm,
    showCloseButton: true,
  }).then((r) => r.isConfirmed);

/** Compatibilité avec l'API de react-toastify utilisée dans les écrans. */
export const toast = {
  success: (m, options) => showSuccess(m, undefined, options),
  error: (m, options) => showError(m, undefined, options),
  info: (m, options) => showInfo(m, undefined, options),
  warning: (m, options) => showWarning(m, undefined, options),
  warn: (m, options) => showWarning(m, undefined, options),
  dismiss: () => Swal.close(),
};

export default toast;
