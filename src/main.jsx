import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { activerTablesMobiles } from './utils/tablesMobiles';

// Tableaux en cartes sur téléphone (voir utils/tablesMobiles).
activerTablesMobiles();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
