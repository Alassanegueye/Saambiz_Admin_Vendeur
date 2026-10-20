import { memo, useEffect } from 'react';

/**
 * Fenêtre modale au style du dashboard Yobante Boutique : fond assombri qui
 * recouvre toute la page (barre de navigation comprise), carte blanche
 * arrondie, titre en gras, boutons alignés à droite. Sur mobile, la carte
 * remonte du bas de l'écran.
 *
 * Pendant l'ouverture, la page derrière ne défile plus : seule la modale
 * défile, sans barre de défilement visible.
 */
const Modal = memo(function Modal({
  isOpen, onClose, title, description, children, footer, large = false,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    const precedent = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = precedent;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label={typeof title === 'string' ? title : undefined}>
      <div className={large ? 'modal modal-large' : 'modal'} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{title}</h2>
            {description && <p className="modal-description">{description}</p>}
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
});

export default Modal;
