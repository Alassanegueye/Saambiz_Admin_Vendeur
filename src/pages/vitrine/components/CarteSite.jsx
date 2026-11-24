import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { Check, Copy, ExternalLink, QrCode, Share2, Store } from 'lucide-react';
import Badge from '../../../components/common/Badge';
import Modal from '../../../components/common/Modal';
import { ROUTES } from '../../../constants/routes';
import { pluriel } from '../../boutique/outilsSite';

/** Le QR code de l'adresse, en grand, prêt à télécharger. Monté à l'ouverture. */
function FenetreQr({ url, nomBoutique, onClose }) {
  const [qr, setQr] = useState(null);

  useEffect(() => {
    let annule = false;
    QRCode.toDataURL(url, {
      width: 640,
      margin: 2,
      // Correction haute : un QR imprimé finit corné, sali ou décollé, et
      // doit rester lisible malgré ça.
      errorCorrectionLevel: 'H',
      color: { dark: '#0D1B3D', light: '#FFFFFF' },
    })
      .then((image) => { if (!annule) setQr(image); })
      .catch(() => { if (!annule) setQr(null); });
    return () => { annule = true; };
  }, [url]);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Le QR code de votre site"
      description="À imprimer et coller sur votre devanture, ou à glisser dans vos colis : vos clients le scannent avec leur téléphone."
      footer={(
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Fermer</button>
          {qr && (
            // Un téléchargement direct plutôt qu'un clic droit : le vendeur
            // travaille souvent depuis un téléphone.
            <a className="btn btn-primary" href={qr} download={`qr-${nomBoutique}.png`}>Télécharger le QR code</a>
          )}
        </>
      )}
    >
      <div className="carte-site__qr">
        {qr ? <img src={qr} alt={`QR code vers le site de ${nomBoutique}`} /> : <p className="form-hint">Préparation du QR code…</p>}
        <p className="vitrine-url">{url}</p>
      </div>
    </Modal>
  );
}

/** Initiales de la boutique, quand elle n'a pas encore de logo. */
const initiales = (nom) => String(nom || '?').trim().split(/\s+/).slice(0, 2).map((m) => m[0]).join('').toUpperCase();

/**
 * Le haut de la page « Ma boutique » : qui est la boutique, et où en est son
 * site.
 *
 * Jamais publié, le site se crée en trois étapes visibles d'un coup d'œil
 * (des produits, des sections, la publication). Publié, la carte sert à le
 * faire connaître : l'adresse, et de quoi la partager — WhatsApp d'abord,
 * le lien copié ensuite, le QR code enfin.
 */
export default function CarteSite({
  boutique, verifie, enPause, url, configuree, enLigne, vues, nombreProduits, sectionsOk,
  onOuvrirInfos, onOuvrirEtape, onPublier, onBasculerEnLigne, bascule, saving,
}) {
  const [copie, setCopie] = useState(false);
  const [qrOuvert, setQrOuvert] = useState(false);
  const nom = boutique?.nom || 'Ma boutique';
  const adresseCourte = url.replace(/^https?:\/\//i, '');

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Presse-papier refusé : l'adresse reste sélectionnable juste au-dessus.
    }
  };

  const messageWhatsapp = encodeURIComponent(`Découvrez la boutique ${nom} en ligne : ${url}`);

  return (
    <div className="card carte-site">
      <div className="carte-site__haut">
        <button type="button" className="carte-site__identite" onClick={onOuvrirInfos} title="Voir ou modifier les infos de la boutique">
          {boutique?.logo
            ? <img src={boutique.logo} alt="" className="carte-site__logo" />
            : <span className="carte-site__logo carte-site__logo--vide" aria-hidden="true">{initiales(nom)}</span>}
          <span className="carte-site__noms">
            <strong>{nom}</strong>
            <span>{boutique?.slogan || 'Ajoutez un slogan dans les infos de la boutique'}</span>
          </span>
        </button>
        <div className="carte-site__badges">
          {verifie && <Badge variant="success">Profil vérifié</Badge>}
          {enPause && <Badge variant="warning">Boutique en pause</Badge>}
          {!configuree
            ? <Badge variant="warning">Site pas encore publié</Badge>
            : <Badge variant={enLigne ? 'success' : 'default'}>{enLigne ? 'Site en ligne' : 'Site hors ligne'}</Badge>}
        </div>
      </div>

      {!configuree ? (
        <div className="carte-site__corps">
          <p className="carte-site__titre">Créez le site de votre boutique en 3 étapes</p>
          <ol className="carte-site__guide">
            <li className={nombreProduits > 0 ? 'est-fait' : ''}>
              <span className="carte-site__puce" aria-hidden="true">{nombreProduits > 0 ? <Check size={14} strokeWidth={3} /> : 1}</span>
              <span className="carte-site__etape">
                <strong>Ajoutez vos produits</strong>
                <span>
                  {nombreProduits > 0
                    ? `${pluriel(nombreProduits, 'produit validé', 'produits validés')}, prêts pour votre site.`
                    : 'Ils apparaissent sur le site une fois validés par SaamBiz.'}
                </span>
              </span>
              {nombreProduits === 0 && (
                <Link className="btn btn-secondary btn-sm" to={`${ROUTES.PRODUITS}?nouveau=1`}>Ajouter un produit</Link>
              )}
            </li>
            <li className={sectionsOk ? 'est-fait' : ''}>
              <span className="carte-site__puce" aria-hidden="true">{sectionsOk ? <Check size={14} strokeWidth={3} /> : 2}</span>
              <span className="carte-site__etape">
                <strong>Choisissez les produits à montrer</strong>
                <span>Rangez-les en sections : Nouveautés, Promotions…</span>
              </span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => onOuvrirEtape('sections')}>
                {sectionsOk ? 'Modifier' : 'Choisir'}
              </button>
            </li>
            <li>
              <span className="carte-site__puce" aria-hidden="true">3</span>
              <span className="carte-site__etape">
                <strong>Publiez votre site</strong>
                <span>Vérifiez l'aperçu, puis mettez votre site en ligne.</span>
              </span>
              <button type="button" className="btn btn-accent btn-sm" onClick={onPublier} disabled={saving}>
                {saving ? 'Un instant…' : 'Publier mon site'}
              </button>
            </li>
          </ol>
          <p className="form-hint">
            Le reste — couleur, photos, avantages, horaires — se règle plus bas, quand vous voulez.
          </p>
        </div>
      ) : (
        <div className="carte-site__corps">
          <span className="carte-site__libelle">L'adresse de votre site</span>
          <a className="carte-site__url" href={url} target="_blank" rel="noopener noreferrer">{adresseCourte}</a>

          {!enLigne && (
            <p className="carte-site__alerte">
              Votre site est hors ligne : cette adresse affiche « boutique introuvable » à vos clients.
            </p>
          )}

          <div className="carte-site__actions">
            {enLigne ? (
              <>
                <a className="btn btn-primary" href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink aria-hidden="true" /> Voir mon site
                </a>
                <a className="btn btn-secondary" href={`https://wa.me/?text=${messageWhatsapp}`} target="_blank" rel="noopener noreferrer">
                  <Share2 aria-hidden="true" /> Partager sur WhatsApp
                </a>
                <button type="button" className="btn btn-secondary" onClick={copier}>
                  {copie ? <><Check aria-hidden="true" /> Lien copié</> : <><Copy aria-hidden="true" /> Copier le lien</>}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setQrOuvert(true)}>
                  <QrCode aria-hidden="true" /> QR code
                </button>
              </>
            ) : (
              <button type="button" className="btn btn-primary" onClick={() => onBasculerEnLigne(true)} disabled={bascule}>
                {bascule ? 'Un instant…' : 'Remettre mon site en ligne'}
              </button>
            )}
          </div>

          {nombreProduits === 0 && (
            <p className="carte-site__alerte">
              Aucun produit validé : vos visiteurs voient une page qui annonce des produits à venir.{' '}
              <Link to={`${ROUTES.PRODUITS}?nouveau=1`}>Ajouter un produit</Link>
            </p>
          )}
          {nombreProduits > 0 && !sectionsOk && (
            <p className="carte-site__alerte">
              Votre site ne montre encore aucun produit.{' '}
              <button type="button" className="bouton-lien carte-site__lien" onClick={() => onOuvrirEtape('sections')}>
                Choisir les produits à afficher
              </button>
            </p>
          )}

          <div className="carte-site__pied">
            {vues > 0 ? <span>Votre site a été consulté <strong>{vues.toLocaleString('fr-FR')}</strong> fois.</span> : <span />}
            {enLigne && (
              <button type="button" className="bouton-lien carte-site__hors-ligne" onClick={() => onBasculerEnLigne(false)} disabled={bascule}>
                Mettre mon site hors ligne
              </button>
            )}
          </div>
        </div>
      )}

      {!boutique?.logo && (
        <button type="button" className="carte-site__conseil" onClick={onOuvrirInfos}>
          <Store size={16} aria-hidden="true" />
          Ajoutez votre logo : il s'affiche en haut de votre site et dans l'application.
        </button>
      )}

      {qrOuvert && <FenetreQr url={url} nomBoutique={nom} onClose={() => setQrOuvert(false)} />}
    </div>
  );
}
