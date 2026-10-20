import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { ROUTES } from '../../constants/routes';
import CartePartage from './components/CartePartage';
import ApercuVitrine from './components/ApercuVitrine';
import useVitrine, { MODELES, COULEURS } from './useVitrine';
import '../../styles/vitrine.css';

/**
 * « Mon site » — le site web public de la boutique, celui que le vendeur
 * partage à ses propres clients.
 *
 * Distinct de la page « Ma boutique », qui porte les informations de la
 * boutique (nom, logo, téléphone, adresse) partagées avec l'application. Ici,
 * on ne règle que ce qui n'existe que sur le web : l'adresse du site, son
 * apparence, ce qu'il montre, et s'il prend les commandes.
 */
export default function VitrinePage() {
  const v = useVitrine();

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

  /* ── Le site n'a pas encore été créé ───────────────────────────────
     La composition du site se fait dans l'application mobile : c'est là que
     le vendeur téléverse son logo, répond sur son activité, et voit sa
     proposition. Reproduire ce parcours ici donnerait deux assistants à
     tenir à jour, et deux façons de composer un même site.

     Le tableau de bord web sert donc à REPRENDRE un site existant, jamais à
     l'ouvrir — et il le dit clairement plutôt que d'afficher un formulaire
     de réglages sur quelque chose qui n'existe pas. */
  /* ── Le site n'a pas encore été créé ───────────────────────────────
     Un clic suffit : le site part avec la mise en page par défaut et les
     informations de la boutique (nom, logo, produits). Le vendeur peut
     ensuite l'ajuster ici, ou le composer depuis l'application. */
  if (!v.configuree) {
    return (
      <div>
        <Helmet><title>Mon site — SaamBiz Vendeur</title></Helmet>

        <div className="page-header">
          <div className="page-header-left">
            <h1>Mon site</h1>
            <p>Le site web de votre boutique, pour vos clients</p>
          </div>
          <Badge variant="default">Hors ligne</Badge>
        </div>

        <div className="card vitrine-invitation">
          <div className="card-body">
            <span className="vitrine-invitation__picto" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.7">
                <circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
              </svg>
            </span>

            <h2>Votre site n'est pas encore en ligne</h2>

            <p>
              Activez-le en un clic : il reprend le nom, le logo et les produits
              de votre boutique. Vous obtenez une adresse à partager à vos
              clients sur WhatsApp ou sur vos cartes.
            </p>

            <button
              type="button"
              className="btn btn-primary vitrine-marge-haut"
              onClick={() => v.basculerEnLigne(true)}
              disabled={v.bascule}
            >
              {v.bascule ? 'Activation…' : 'Mettre mon site en ligne'}
            </button>

            <p className="vitrine-invitation__note">
              Vous pourrez ensuite changer ses couleurs, sa mise en page et ses
              textes ici, ou le composer à partir de votre logo dans
              l'application (Menu → Ma boutique → Mon site web).
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { valeurs, majChamp, majSection, majReseau } = v;

  return (
    <div>
      <Helmet><title>Mon site — SaamBiz Vendeur</title></Helmet>

      <div className="page-header">
        <div className="page-header-left">
          <h1>Mon site</h1>
          <p>L'adresse web de votre boutique, à partager à vos clients</p>
        </div>
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
      </div>

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

      <CartePartage url={v.url} nomBoutique={v.boutique?.nom || 'ma-boutique'} actif={valeurs.active} />

      {v.vues > 0 && (
        <p className="vitrine-vues">
          Votre site a été consulté <strong>{v.vues}</strong> fois.
        </p>
      )}

      <div className="vitrine-colonnes">
        <div className="vitrine-reglages">

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

          {/* ── Mise en page ─────────────────────────────────────── */}
          <div className="card carte-espacee">
            <div className="card-header"><h3 className="card-title">Mise en page</h3></div>
            <div className="card-body">
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

          {/* ── Contenus ─────────────────────────────────────────── */}
          <div className="card carte-espacee">
            <div className="card-header"><h3 className="card-title">Contenus</h3></div>
            <div className="card-body">
              <div className="form-field">
                <label className="form-label" htmlFor="v-annonce">Bandeau d'annonce</label>
                <input
                  id="v-annonce"
                  className="form-input"
                  value={valeurs.annonce}
                  maxLength={180}
                  onChange={(e) => majChamp('annonce', e.target.value)}
                  placeholder="Livraison offerte à Dakar cette semaine"
                />
                <p className="form-hint">
                  Affiché tout en haut de chaque page. Laissez vide pour ne rien afficher.
                </p>
              </div>

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

          {/* ── Sections ─────────────────────────────────────────── */}
          <div className="card carte-espacee">
            <div className="card-header"><h3 className="card-title">Sections affichées</h3></div>
            <div className="card-body">
              {[
                ['categories', 'Les rayons', 'Vos catégories de produits, en haut du site.'],
                ['apropos', 'À propos', 'Le texte de présentation ci-dessus.'],
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

          {/* ── Réseaux ──────────────────────────────────────────── */}
          <div className="card carte-espacee">
            <div className="card-header"><h3 className="card-title">Réseaux sociaux</h3></div>
            <div className="card-body">
              {[
                ['facebook', 'Facebook', 'https://facebook.com/ma-page'],
                ['instagram', 'Instagram', 'https://instagram.com/mon-compte'],
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
              </p>
            </div>
          </div>

          <div className="vitrine-barre-enregistrer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={v.enregistrer}
              disabled={v.saving}
            >
              {v.saving ? 'Enregistrement…' : 'Enregistrer mon site'}
            </button>
          </div>
        </div>

        {/* L'aperçu suit le défilement : le vendeur voit sa couleur et sa mise
            en page changer pendant qu'il règle, sans remonter la page. */}
        <aside className="vitrine-apercu-colonne">
          <h3 className="vitrine-apercu-titre">Aperçu</h3>
          <ApercuVitrine valeurs={valeurs} boutique={v.boutique} />
          <p className="form-hint">
            Rendu simplifié. Ouvrez votre site pour le voir en vrai — après
            enregistrement.
          </p>
        </aside>
      </div>
    </div>
  );
}
