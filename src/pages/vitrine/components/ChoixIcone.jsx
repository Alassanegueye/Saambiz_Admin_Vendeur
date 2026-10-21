import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import IconeVitrine from './IconeVitrine';

/** Un bouton qui montre l'icône choisie et ouvre la liste des icônes. */
export default function ChoixIcone({ valeur, options, onChange, libelle }) {
  const [ouvert, setOuvert] = useState(false);
  const fermer = () => setOuvert(false);

  return (
    <>
      <button type="button" className="vitrine-icone-bouton" onClick={() => setOuvert(true)}
        aria-label={`Changer l'icône${libelle ? ` de ${libelle}` : ''}`} title="Changer l'icône">
        <IconeVitrine cle={valeur} size={24} />
        <span>Changer</span>
      </button>

      <Modal isOpen={ouvert} onClose={fermer} title="Choisissez une icône"
        description={libelle ? `Pour « ${libelle} »` : undefined}>
        <div className="vitrine-icones-grille">
          {options.map(([cle, nom]) => (
            <button key={cle} type="button"
              className={`vitrine-icone-option ${valeur === cle ? 'est-actif' : ''}`}
              onClick={() => { onChange(cle); fermer(); }} aria-pressed={valeur === cle}>
              <IconeVitrine cle={cle} size={26} />
              <span>{nom}</span>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
}
