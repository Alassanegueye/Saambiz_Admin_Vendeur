import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // En développement, l'API est servie par le même hôte que l'application :
  // le navigateur ne voit qu'une seule origine, donc aucun CORS à configurer
  // côté backend. En production, VITE_API_BASE_URL pointe sur l'API réelle et
  // ce proxy n'existe pas.
  // Le port vit ici et non dans le script npm : les trois interfaces le
  // déclarent au même endroit, et `strictPort` évite un glissement silencieux
  // sur 5191 qui ferait tomber le proxy hors de l'origine attendue.
  server: {
    port: 5190,
    strictPort: true,
    proxy: {
      '/saambiz': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'vendor';
          }
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router/')) {
            return 'router';
          }
          if (id.includes('node_modules/react-toastify')) {
            return 'toast';
          }
          if (id.includes('node_modules/axios')) {
            return 'http';
          }
        },
      },
    },
  },
})
