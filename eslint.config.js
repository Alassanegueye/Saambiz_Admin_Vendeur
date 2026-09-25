import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],

      // Cette règle signale tout appel, dans un effet, à une fonction qui
      // finit par écrire dans l'état. Elle ne distingue pas ce qui est
      // synchrone de ce qui suit un `await` : le chargement des données au
      // montage — `useEffect(() => { load(); }, [load])`, où `load` est une
      // fonction asynchrone — est donc signalé alors qu'aucun rendu en
      // cascade ne se produit. Les gardes utiles (pas de `setLoading(true)`
      // redondant, annulation au démontage) sont en place dans usePageData
      // et dans les pages.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
