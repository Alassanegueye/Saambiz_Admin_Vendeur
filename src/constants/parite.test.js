import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ENDPOINTS } from './endpoints';

/**
 * « Tout ce qui est dans le mobile doit être dans le web. »
 *
 * Ce test tient cette promesse sur les adresses d'API : il lit le catalogue
 * de l'application mobile (`api_endpoints.dart`) quand le dépôt est à côté sur
 * le disque, en retire ce qui ne concerne pas un vendeur, et vérifie que le
 * reste est déclaré ici.
 *
 * Il ne dit rien de l'écran qui l'utilise — une adresse déclarée et jamais
 * appelée passerait. Il attrape en revanche le cas qui s'est produit : une
 * fonctionnalité existante sur le téléphone et absente du tableau de bord,
 * faute d'avoir été portée.
 */

const MOBILE = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../Saambiz_Mobile/lib/core/constants/api_endpoints.dart',
);

/**
 * Ce qu'un vendeur n'atteint jamais : le parcours d'achat, les favoris de
 * boutique, le catalogue public, les signalements et les jetons de
 * notification du téléphone. Chaque exclusion est un choix, pas un oubli.
 */
const HORS_PERIMETRE_VENDEUR = [
  /^\/acheteurs\//,          // navigation de l'acheteur
  /^\/favoris/,              // boutiques suivies par un acheteur
  /^\/categories\/.+/,       // fiches de catégorie, côté acheteur
  /^\/avis/,                 // avis laissés par les acheteurs
  /^\/signalements/,         // signalement d'un produit par un acheteur
  /^\/device-token\//,       // jetons FCM, propres au téléphone
  /^\/app\/config$/,         // mise à jour forcée de l'application
  /^\/commandes$/,           // création d'une commande par l'acheteur
  /^\/commandes\/:id\/(annuler|payer|paiement|demande-retour)$/,
  /^\/paiement(\/:id)?$/,    // historique de paiement de l'acheteur
  /^\/promotions\/actives$/, // promotions affichées à l'acheteur
  /^\/auth\/(register|verify-email|inscription\/.+)$/, // inscription mobile
];

/**
 * Déclarées ailleurs que dans `endpoints.js`, ou volontairement absentes.
 * La génération du site en fait partie : le commentaire de `VitrineEndpoints`
 * dit que la création se fait dans l'application, le web ne faisant que
 * reprendre un site déjà composé.
 */
const ADMIS_AILLEURS = {
  '/auth/login': 'déclaré dans AUTH',
  '/account/me': 'COMPTE.SUPPRIMER et le profil',
  '/account/modifier-profil': 'COMPTE.MODIFIER_PROFIL',
  '/account/change-password': 'AUTH.CHANGER_MOT_DE_PASSE',
  '/account/forgot-password': 'AUTH, mot de passe oublié',
  '/account/reset-password': 'AUTH, réinitialisation',
  '/messages/conversations': 'le web passe par /vendeur/mes-conversations',
  '/vendeur/vitrine/secteurs': 'création du site : mobile seulement, par conception',
  '/vendeur/vitrine/analyser-logo': 'création du site : mobile seulement, par conception',
  '/vendeur/vitrine/generer': 'création du site : mobile seulement, par conception',
};

/** Toutes les adresses déclarées par le web, avec leurs paramètres neutralisés. */
function adressesDuWeb() {
  const sorties = new Set();
  const parcourir = (valeur) => {
    if (typeof valeur === 'string') { sorties.add(valeur.replace(/\/$/, '')); return; }
    if (typeof valeur === 'function') { sorties.add(valeur(':id', ':id2')); return; }
    if (valeur && typeof valeur === 'object') Object.values(valeur).forEach(parcourir);
  };
  parcourir(ENDPOINTS);
  return new Set([...sorties].map((c) => c.replace(/\/:[a-zA-Z0-9_]+/g, '/:id')));
}

/** Toutes les adresses déclarées par le mobile, mêmes conventions. */
function adressesDuMobile() {
  const source = readFileSync(MOBILE, 'utf8');
  const brutes = [...source.matchAll(/'(\/[^']*)'/g)].map((m) => m[1]);
  return [...new Set(brutes.map((c) => c
    .replace(/\$\{Uri\.encodeComponent\([a-zA-Z]+\)\}/g, ':id')
    .replace(/\$[a-zA-Z]+/g, ':id')
    .replace(/\/:id\/:id/g, '/:id/:id2')
    .replace(/\/$/, '')))];
}

describe('parité des API entre l’application mobile et l’espace vendeur web', () => {
  it.runIf(existsSync(MOBILE))('déclare toutes les adresses qu’un vendeur atteint sur mobile', () => {
    const web = adressesDuWeb();
    const manquantes = adressesDuMobile()
      .filter((c) => !HORS_PERIMETRE_VENDEUR.some((r) => r.test(c)))
      .filter((c) => !ADMIS_AILLEURS[c])
      .filter((c) => !web.has(c) && !web.has(c.replace('/:id2', '/:id')));

    expect(manquantes, `Adresses présentes côté mobile et absentes du web :\n  ${manquantes.join('\n  ')}`)
      .toEqual([]);
  });

  it('garde une trace écrite de ce qui est volontairement mobile seulement', () => {
    // Si cette liste change, c'est une décision de produit : elle doit être
    // relue, pas corrigée en silence.
    expect(Object.keys(ADMIS_AILLEURS)).toContain('/vendeur/vitrine/generer');
    expect(ADMIS_AILLEURS['/vendeur/vitrine/generer']).toMatch(/conception/);
  });
});
