import { completerLien } from '../../boutique/outilsSite';

const RESEAUX = [
  ['facebook', 'Facebook', 'facebook.com/ma-page'],
  ['instagram', 'Instagram', '@mon-compte'],
  ['tiktok', 'TikTok', '@mon-compte'],
  ['snapchat', 'Snapchat', '@mon-compte'],
  ['site', 'Autre site', 'www.mon-site.com'],
];

const BAS_DE_PAGE = [
  ['apropos', 'À propos', 'Votre texte de présentation, ci-dessus.'],
  ['avis', 'Les avis clients', 'Les notes laissées par vos acheteurs.'],
  ['contact', 'Nous joindre', 'Téléphone, WhatsApp, adresse et horaires.'],
];

/**
 * Ce que le site dit de la boutique : horaires, présentation, réseaux
 * sociaux, et les blocs du bas de page. Le téléphone et l'adresse viennent
 * des infos de la boutique — un seul endroit à tenir à jour.
 */
export default function EtapeInfos({ valeurs, onChamp, onReseau, onSection, onOuvrirInfos }) {
  return (
    <>
      <div className="form-field">
        <label className="form-label" htmlFor="v-horaires">Horaires d'ouverture</label>
        <input
          id="v-horaires"
          className="form-input"
          value={valeurs.horaires}
          maxLength={160}
          onChange={(e) => onChamp('horaires', e.target.value)}
          placeholder="Lundi à samedi, 9h — 20h"
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor="v-apropos">Présentation (« À propos »)</label>
        <textarea
          id="v-apropos"
          className="form-textarea"
          rows={4}
          value={valeurs.apropos}
          maxLength={2000}
          onChange={(e) => onChamp('apropos', e.target.value)}
          placeholder="Qui vous êtes, depuis quand, ce qui vous distingue…"
        />
        <p className="form-hint">
          Quelques lignes suffisent : c'est ce qui rassure un client qui ne vous connaît pas encore.
        </p>
      </div>

      <p className="form-label">Vos réseaux sociaux</p>
      <div className="etape-site__grille">
        {RESEAUX.map(([cle, libelle, exemple]) => (
          <div className="form-field" key={cle}>
            <label className="form-hint etape-site__petit-libelle" htmlFor={`v-${cle}`}>{libelle}</label>
            <input
              id={`v-${cle}`}
              className="form-input"
              value={valeurs.reseaux[cle]}
              onChange={(e) => onReseau(cle, e.target.value)}
              // Le serveur n'accepte que des adresses en https:// ; on la
              // complète dès que le vendeur quitte le champ.
              onBlur={(e) => onReseau(cle, completerLien(cle, e.target.value))}
              placeholder={exemple}
              inputMode="url"
              spellCheck="false"
              autoCapitalize="none"
            />
          </div>
        ))}
      </div>
      <p className="form-hint etape-site__note">
        Tapez votre nom de compte (@…) ou l'adresse de votre page : le lien est complété tout seul.
        Le bouton WhatsApp du site utilise le numéro de votre boutique —{' '}
        <button type="button" className="bouton-lien lien-voir-tout" onClick={onOuvrirInfos}>
          modifier les infos de la boutique
        </button>.
      </p>

      <p className="form-label vitrine-marge-haut">En bas de votre site</p>
      {BAS_DE_PAGE.map(([cle, titre, aide]) => (
        <label key={cle} className="vitrine-bascule">
          <input
            type="checkbox"
            checked={valeurs.sections[cle]}
            onChange={(e) => onSection(cle, e.target.checked)}
          />
          <span><strong>{titre}</strong>{aide}</span>
        </label>
      ))}
    </>
  );
}
