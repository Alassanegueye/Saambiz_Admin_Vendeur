import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/**
 * L'adresse du site, et de quoi la diffuser.
 *
 * C'est le bloc le plus utile de la page : un site que personne ne connaît ne
 * vend rien. Trois canaux, dans l'ordre où un commerçant sénégalais les
 * utilise — WhatsApp d'abord, le lien copié ensuite, le QR code enfin, à
 * imprimer et coller sur la devanture ou à glisser dans un colis.
 */
export default function CartePartage({ url, nomBoutique, actif }) {
  const [qr, setQr] = useState(null);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!url) return undefined;

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

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Presse-papier refusé : l'adresse reste sélectionnable juste à côté.
    }
  };

  const messageWhatsapp = encodeURIComponent(
    `Découvrez la boutique ${nomBoutique} en ligne : ${url}`
  );

  return (
    <div className="card">
      <div className="card-header"><h3 className="card-title">L'adresse de votre site</h3></div>
      <div className="card-body vitrine-partage">
        <div className="vitrine-partage__gauche">
          <p className="vitrine-url" title={url}>{url}</p>

          {!actif && (
            <p className="form-hint vitrine-hors-ligne">
              Votre site est actuellement hors ligne : cette adresse affiche une
              page « boutique introuvable » à vos clients.
            </p>
          )}

          <div className="vitrine-actions">
            <a
              className="btn btn-primary"
              href={`https://wa.me/?text=${messageWhatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Partager sur WhatsApp
            </a>

            <button type="button" className="btn btn-secondary" onClick={copier}>
              {copie ? 'Adresse copiée' : "Copier l'adresse"}
            </button>

            <a className="btn btn-secondary" href={url} target="_blank" rel="noopener noreferrer">
              Voir mon site
            </a>
          </div>

          <p className="form-hint">
            Cette adresse ne change que si vous la modifiez. Une fois imprimée
            sur vos cartes, mieux vaut ne plus y toucher : les anciens liens
            cesseraient de fonctionner.
          </p>
        </div>

        {qr && (
          <div className="vitrine-qr">
            <img src={qr} alt={`QR code vers le site de ${nomBoutique}`} />
            {/* Un téléchargement direct plutôt qu'un clic droit : le vendeur
                travaille souvent depuis un téléphone, où « enregistrer
                l'image » n'est pas à portée de main. */}
            <a className="btn btn-secondary" href={qr} download={`qr-${nomBoutique}.png`}>
              Télécharger le QR
            </a>
            <p className="form-hint">À imprimer et coller dans votre boutique.</p>
          </div>
        )}
      </div>
    </div>
  );
}
