import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { ROUTES } from '../../constants/routes';
import CartePartage from './components/CartePartage';
import { useState } from 'react';
import ApercuSite from './components/ApercuSite';
import SectionsPerso from './components/SectionsPerso';
import EtapeAvantages from './etapes/EtapeAvantages';
import useVitrine, { MODELES, COULEURS } from './useVitrine';
import '../../styles/vitrine.css';

/** Les étapes de la personnalisation, dans l'ordre du site. */
const ETAPES = [
  { cle: 'style', nom: 'Style' },
  { cle: 'sections', nom: 'Sections' },
  { cle: 'avantages', nom: 'Avantages' },
  { cle: 'infos', nom: 'Infos' },
  { cle: 'publication', nom: 'Publication' },
];

/**
 * « Mon site » — le site web public de la boutique, celui que le vendeur
 * partage à ses propres clients. La personnalisation se fait en plusieurs
 * étapes ; sur grand écran, le vrai site s'affiche à côté et suit chaque
 * changement.
 *
 * Distinct de la page « Ma boutique », qui porte les informations de la
 * boutique (nom, logo, téléphone, adresse) partagées avec l'application. Ici,
 * on ne règle que ce qui n'existe que sur le web : l'adresse du site, son
 * apparence, ce qu'il montre, et s'il prend les commandes.
 */
export default function VitrinePage() {
  const v = useVitrine();
  const [etape, setEtape] = useState(0);

  if (v.loading) return <LoadingSpinner fullPage />;

  // Pas de boutique : le site n'a rien à montrer. On l'explique et on renvoie
  // là où c'est réparable, plutôt que d'afficher un formulaire sans objet.
  if (v.erreur || !v.donnees) {
    return (
      <div>
        <Helmet><title>Mon site — SaamBiz Vendeur</title></Helmet>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Mon site</h1>
            <p>Le site web de votre boutique, pour vos clients</p>
          </div>
        </div>
        <div className="card card-info">
          <div className="card-body">
            <p>{v.erreur}</p>
            <Link to={ROUTES.BOUTIQUE} className="btn btn-primary vitrine-marge-haut">
              Ouvrir ma boutique
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { valeurs, majChamp, majSection, majReseau, majBloc } = v;
  const cle = ETAPES[etape].cle;
  const aller = (i) => { setEtape(i); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  // Jamais publié : le vendeur personnalise d'abord son site, puis le publie.
  const premiere = !v.configuree;

  return (
    <div>
      <Helmet><title>Mon site — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Mon site</h1>
          <p>L'adresse web de votre boutique, à partager à vos clients</p>
        </div>
        {premiere ? (
          <Badge variant="warning">Pas encore publié</Badge>
        ) : (
          <div className="actions-rapides">
            <Badge variant={valeurs.active ? 'success' : 'default'}>
              {valeurs.active ? 'En ligne' : 'Hors ligne'}
            </Badge>
            <button
              type="button"
              className={`btn ${valeurs.active ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => v.basculerEnLigne(!valeurs.active)}
              disabled={v.bascule}
            >
              {v.bascule ? 'Un instant…' : valeurs.active ? 'Mettre hors ligne' : 'Mettre en ligne'}
            </button>
          </div>
        )}
      </div>

      {/* Première fois : on personnalise avant de publier. */}
      {premiere && (
        <div className="card card-info vitrine-etapes">
          <div className="card-body">
            <strong>Personnalisez votre site avant de le publier</strong>
            <ol>
              <li>Suivez les étapes : style, sections, avantages, infos.</li>
              <li>Regardez le résultat dans l'aperçu, à droite, à chaque changement.</li>
              <li>À la dernière étape, cliquez sur <strong>« Publier mon site »</strong>.</li>
            </ol>
          </div>
        </div>
      )}

      {/* Un site sans produit ne vend rien : le dire ici évite qu'un vendeur
          partage son adresse à toute sa clientèle avant d'avoir saisi
          quoi que ce soit. */}
      {v.nombreProduits === 0 && (
        <div className="card card-info">
          <div className="card-body">
            <p>
              Votre catalogue est vide : vos visiteurs verront une page qui
              annonce des produits à venir. Ajoutez au moins un article avant de
              diffuser l'adresse de votre site.
            </p>
            <Link to={ROUTES.PRODUITS} className="btn btn-primary vitrine-marge-haut">
              Ajouter un produit
            </Link>
          </div>
        </div>
      )}

      {!premiere && (
        <CartePartage url={v.url} nomBoutique={v.boutique?.nom || 'ma-boutique'} actif={valeurs.active} />
      )}

      {v.vues > 0 && (
        <p className="vitrine-vues">
          Votre site a été consulté <strong>{v.vues}</strong> fois.
        </p>
      )}

      <div className="vitrine-colonnes">
        <div className="vitrine-reglages">
          {/* ── Étapes ─────────────────────────────────────────────── */}
          <nav className="vitrine-etapes-nav" aria-label="Étapes de personnalisation">
            {ETAPES.map((e, i) => (
              <button key={e.cle} type="button" className={`vitrine-etape ${i === etape ? 'est-active' : ''} ${i < etape ? 'est-faite' : ''}`}
                onClick={() => aller(i)} aria-current={i === etape ? 'step' : undefined}>
                <span className="vitrine-etape__num">{i + 1}</span>
                <span className="vitrine-etape__nom">{e.nom}</span>
              </button>
            ))}
          </nav>
          <p className="vitrine-etape-texte">Étape {etape + 1} sur {ETAPES.length} · <strong>{ETAPES[etape].nom}</strong></p>

          {cle === 'style' && (
            <>
            {/* ── Mise en page ─────────────────────────────────────── */}
            <div className="card">
              <div className="card-header"><h3 className="card-title">Mise en page</h3></div>
              <div className="card-body">
                <p className="form-hint" style={{ marginTop: 0, marginBottom: 12 }}>
                  Choisissez comment vos produits s'affichent sur le site.
                </p>
                <div className="vitrine-modeles">
                  {MODELES.map((m) => (
                    <button
                      key={m.cle}
                      type="button"
                      className={`vitrine-modele ${valeurs.modele === m.cle ? 'est-actif' : ''}`}
                      onClick={() => majChamp('modele', m.cle)}
                      aria-pressed={valeurs.modele === m.cle}
                    >
                      {/* Quatre blocs, disposés différemment selon le modèle : le
                          quatrième ne sert qu'au croquis « Catalogue », qui a
                          besoin d'une rangée de plus pour se lire comme une
                          liste et non comme une grille. */}
                      <span className={`vitrine-modele__croquis vitrine-modele__croquis--${m.cle}`} aria-hidden="true">
                        <i /><i /><i /><i />
                      </span>
                      <strong>{m.nom}</strong>
                      <span className="vitrine-modele__resume">{m.resume}</span>
                      <span className="vitrine-modele__pour">{m.pourQui}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Couleur ──────────────────────────────────────────── */}
            <div className="card carte-espacee">
              <div className="card-header"><h3 className="card-title">Couleur</h3></div>
              <div className="card-body">
                <p className="form-hint vitrine-marge-bas">
                  Une seule couleur à choisir : le site en déduit tout le reste —
                  boutons, bandeaux, bordures — en gardant le texte lisible.
                </p>

                <div className="vitrine-couleurs">
                  {COULEURS.map((c) => (
                    <button
                      key={c.valeur}
                      type="button"
                      className={`vitrine-couleur ${valeurs.accent.toLowerCase() === c.valeur.toLowerCase() ? 'est-actif' : ''}`}
                      style={{ '--pastille': c.valeur }}
                      onClick={() => majChamp('accent', c.valeur)}
                      title={c.nom}
                      aria-label={c.nom}
                      aria-pressed={valeurs.accent.toLowerCase() === c.valeur.toLowerCase()}
                    />
                  ))}

                  <label className="vitrine-couleur-libre">
                    <input
                      type="color"
                      value={valeurs.accent}
                      onChange={(e) => majChamp('accent', e.target.value)}
                      aria-label="Choisir une autre couleur"
                    />
                    <span>Autre</span>
                  </label>
                </div>
              </div>
            </div>

            </>
          )}

          {cle === 'sections' && (
            <SectionsPerso
              sections={valeurs.sectionsPerso}
              onChange={(liste) => majChamp('sectionsPerso', liste)}
            />
          )}

          {cle === 'avantages' && (
            <EtapeAvantages avantages={valeurs.blocs.avantages} onChange={(l) => majBloc('avantages', l)} />
          )}

          {cle === 'infos' && (
            <>
            {/* ── Contenus ─────────────────────────────────────────── */}
            <div className="card">
              <div className="card-header"><h3 className="card-title">Contenus</h3></div>
              <div className="card-body">
                <div className="form-field">
                  <label className="form-label" htmlFor="v-horaires">Horaires</label>
                  <input
                    id="v-horaires"
                    className="form-input"
                    value={valeurs.horaires}
                    maxLength={160}
                    onChange={(e) => majChamp('horaires', e.target.value)}
                    placeholder="Lundi à samedi, 9h — 20h"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label" htmlFor="v-apropos">À propos</label>
                  <textarea
                    id="v-apropos"
                    className="form-textarea"
                    rows={5}
                    value={valeurs.apropos}
                    maxLength={2000}
                    onChange={(e) => majChamp('apropos', e.target.value)}
                    placeholder="Qui vous êtes, depuis quand, ce qui vous distingue…"
                  />
                  <p className="form-hint">
                    Quelques lignes suffisent. C'est ce qui rassure un client qui ne
                    vous connaît pas encore.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Réseaux ──────────────────────────────────────────── */}
            <div className="card carte-espacee">
              <div className="card-header"><h3 className="card-title">Réseaux sociaux</h3></div>
              <div className="card-body">
                {[
                  ['facebook', 'Facebook', 'https://facebook.com/ma-page'],
                  ['instagram', 'Instagram', 'https://instagram.com/mon-compte'],
                  ['snapchat', 'Snapchat', 'https://snapchat.com/add/mon-compte'],
                  ['tiktok', 'TikTok', 'https://tiktok.com/@mon-compte'],
                  ['site', 'Autre site', 'https://…'],
                ].map(([cle, libelle, exemple]) => (
                  <div className="form-field" key={cle}>
                    <label className="form-label" htmlFor={`v-${cle}`}>{libelle}</label>
                    <input
                      id={`v-${cle}`}
                      className="form-input"
                      type="url"
                      value={valeurs.reseaux[cle]}
                      onChange={(e) => majReseau(cle, e.target.value)}
                      placeholder={exemple}
                    />
                  </div>
                ))}
                <p className="form-hint">
                  L'adresse complète, en commençant par https:// — sinon le lien ne
                  sera pas enregistré.
                  WhatsApp : le bouton du site utilise le numéro de votre boutique
                  (page « Infos de la boutique »).
                </p>
              </div>
            </div>

            {/* ── Sections ─────────────────────────────────────────── */}
            <div className="card carte-espacee">
              <div className="card-header"><h3 className="card-title">En bas du site</h3></div>
              <div className="card-body">
                {[
                  ['apropos', 'À propos', 'Votre texte de présentation (étape « Infos »).'],
                  ['avis', 'Les avis clients', 'Les notes laissées par vos acheteurs.'],
                  ['contact', 'Nous joindre', 'Téléphone, WhatsApp, adresse et horaires, en bas de page.'],
                ].map(([cle, titre, aide]) => (
                  <label key={cle} className="vitrine-bascule">
                    <input
                      type="checkbox"
                      checked={valeurs.sections[cle]}
                      onChange={(e) => majSection(cle, e.target.checked)}
                    />
                    <span><strong>{titre}</strong>{aide}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* ── Adresse ──────────────────────────────────────────── */}
            <div className="card carte-espacee">
              <div className="card-header"><h3 className="card-title">Adresse du site</h3></div>
              <div className="card-body">
                <div className="form-field">
                  <label className="form-label" htmlFor="v-slug">Nom dans l'adresse</label>
                  <div className="vitrine-slug">
                    <span>saambiz.com/b/</span>
                    <input
                      id="v-slug"
                      className="form-input"
                      value={valeurs.slug}
                      onChange={(e) => majChamp('slug', e.target.value.toLowerCase())}
                      placeholder="chez-fatou"
                      spellCheck="false"
                      autoCapitalize="none"
                    />
                  </div>
                  <p className="form-hint">
                    Lettres sans accent, chiffres et tirets. C'est ce que vos clients
                    taperont ou liront sur votre devanture — court et simple vaut mieux.
                  </p>
                </div>
              </div>
            </div>

            </>
          )}

          {cle === 'publication' && (
            <>
            {/* ── Publication ──────────────────────────────────────── */}
            <div className="card">
              <div className="card-header"><h3 className="card-title">Publication</h3></div>
              <div className="card-body">
                <label className="vitrine-bascule">
                  <input
                    type="checkbox"
                    checked={valeurs.commande}
                    onChange={(e) => majChamp('commande', e.target.checked)}
                  />
                  <span>
                    <strong>Accepter les commandes en ligne</strong>
                    Vos clients commandent directement depuis le site, sans créer de compte.
                    Décochez pour n'afficher que votre catalogue et être contacté sur WhatsApp.
                  </span>
                </label>

                <label className="vitrine-bascule">
                  <input
                    type="checkbox"
                    checked={valeurs.paiementLivraison}
                    disabled={!valeurs.commande}
                    onChange={(e) => majChamp('paiementLivraison', e.target.checked)}
                  />
                  <span>
                    <strong>Paiement à la livraison</strong>
                    Le client règle en espèces à la réception. C'est ce que la plupart
                    attendent ; le décocher réduit fortement les commandes.
                  </span>
                </label>
              </div>
            </div>

            </>
          )}

          {/* ── Navigation et enregistrement ───────────────────────── */}
          <div className="vitrine-barre-enregistrer">
            {etape > 0 && (
              <button type="button" className="btn btn-secondary vitrine-precedent" onClick={() => aller(etape - 1)}>
                ← Précédent
              </button>
            )}
            {premiere ? (
              <button type="button" className="btn btn-secondary" onClick={v.enregistrer} disabled={v.saving}>
                Enregistrer sans publier
              </button>
            ) : (
              <button type="button" className={`btn ${cle === 'publication' ? 'btn-primary' : 'btn-secondary'}`} onClick={v.enregistrer} disabled={v.saving}>
                {v.saving ? 'Enregistrement…' : 'Enregistrer mon site'}
              </button>
            )}
            {etape < ETAPES.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={() => aller(etape + 1)}>
                Suivant : {ETAPES[etape + 1].nom} →
              </button>
            ) : premiere && (
              <button type="button" className="btn btn-primary" onClick={v.publier} disabled={v.saving}>
                {v.saving ? 'Un instant…' : 'Publier mon site'}
              </button>
            )}
          </div>

          {/* ── Supprimer le site ─────────────────────────────── */}
          {cle === 'publication' && !premiere && (
              <div className="card carte-espacee carte-danger">
                <div className="card-header"><h3 className="card-title">Supprimer mon site</h3></div>
                <div className="card-body">
                  <p className="form-hint">
                    Votre site disparaît d'Internet et ses réglages sont effacés.
                    <strong> Vos produits, vos commandes et votre boutique dans l'application ne sont pas touchés.</strong>{' '}
                    Vous pourrez recréer un site plus tard.
                  </p>
                  <button type="button" className="btn btn-danger vitrine-marge-haut" onClick={v.supprimerSite} disabled={v.saving}>
                    Supprimer mon site
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* Le vrai site, en direct, sur grand écran. */}
        <aside className="vitrine-apercu-colonne">
          <ApercuSite url={v.url} donnees={v.apercu} brouillon={valeurs} cible={cle} />
        </aside>
      </div>
    </div>
  );
}
