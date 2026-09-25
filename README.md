# SaamBiz — Espace vendeur (web)

Application web par laquelle un vendeur gère sa boutique depuis un ordinateur :
produits, commandes, promotions, vitrine, messages, abonnement. Les mêmes
possibilités que dans l'application mobile, sur un plus grand écran.

Distincte de `Dashboard/`, qui est l'**administration** SaamBiz : deux publics,
deux jeux de droits, deux déploiements.

## Démarrer

```bash
npm install
npm run dev          # http://localhost:5190
```

Le backend doit tourner en parallèle :

```bash
cd ../Backend && docker compose up -d
```

## Configuration

Copier `.env.example` en `.env`. Trois variables :

| Variable | Rôle |
|---|---|
| `VITE_API_BASE_URL` | Adresse de l'API. En développement, la valeur `/saambiz` passe par le proxy de Vite. |
| `VITE_SITE_URL` | Site vitrine, pour les liens de retour depuis l'écran de connexion. |
| `VITE_DEMO` | À `1`, l'application tourne sur un jeu de données local sans appeler l'API. |

### Le proxy de développement

`vite.config.js` renvoie `/saambiz` vers `http://localhost:5000`. Le navigateur
ne voit donc qu'une seule origine et **il n'y a aucun CORS à autoriser côté
backend**. Sans ce proxy il faudrait ajouter `http://localhost:5190` à
`CORS_ORIGIN` dans `Backend/.env`.

En production, `VITE_API_BASE_URL` doit porter l'adresse complète de l'API, et
cette origine doit alors être autorisée par le backend.

### Le mode démo

Pour travailler l'interface sans backend : `VITE_DEMO=1`, ou `?demo=1` dans
l'URL (`?demo=0` pour en sortir). Les requêtes sont servies par
`src/api/demo/`, un bandeau permanent rappelle que les données sont fictives.
N'importe quel identifiant est accepté.

## Structure

```
src/
  api/          axios + endpoints du vendeur, et l'adaptateur du mode démo
  components/   briques partagées, barre de navigation, mise en page
  contexts/     session (AuthContext)
  pages/
    auth/       écran de connexion
    vendeur/    les huit pages de l'espace
  routes/       routage et gardes
  styles/       variables, styles communs, écran de connexion
```

## Accès

L'écran de connexion n'accepte que les comptes de rôle `Vendeur`. Un compte
d'administration est refusé : son application est `Dashboard/`.
