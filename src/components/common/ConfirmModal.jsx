import { memo } from 'react';
import Modal from './Modal';

const ConfirmModal = memo(function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer',
  message,
  confirmLabel = 'Confirmer',
  variant = 'danger',
}) {
  const btnClass = variant === 'danger' ? 'btn btn-danger' : 'btn btn-warning';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Annuler</button>
          <button className={btnClass} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="message-confirmation">{message}</p>
    </Modal>
  );
});

export default ConfirmModal;
