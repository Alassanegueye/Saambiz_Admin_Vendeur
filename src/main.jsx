import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { activerTablesMobiles } from './utils/tablesMobiles';
import { surveillerNouvelleVersion } from './utils/nouvelleVersion';

// Tableaux en cartes sur téléphone (voir utils/tablesMobiles).
activerTablesMobiles();

// Onglet ouvert avant un déploiement : recharger plutôt qu'afficher une page vide.
surveillerNouvelleVersion();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
