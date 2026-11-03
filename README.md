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

## Déploiement

L'application est servie en fichiers statiques par le Nginx du VPS qui héberge
l'API, sur `app.saambiz.com`. Aucun processus, aucun port : `npm run build`
produit `dist/`, et c'est tout le déploiement.

Pousser sur `main` suffit. [`deploy.yml`](.github/workflows/deploy.yml) lance
le lint et le build, et ne déploie que si les deux passent. Le déploiement se
connecte en SSH, met le dépôt à jour, reconstruit, repose
[`deploy/nginx.conf`](deploy/nginx.conf), puis vérifie que l'application
répond — accueil **et** `/connexion`, cette seconde étant le test du
`try_files`.

Secrets à configurer une fois dans ce dépôt (Settings → Secrets and variables
→ Actions) :

| Secret | Valeur |
|---|---|
| `VPS_HOST` | adresse du serveur |
| `VPS_USER` | utilisateur SSH |
| `VPS_SSH_KEY` | clé privée SSH, la publique étant dans `~/.ssh/authorized_keys` du serveur |

### À ne pas oublier côté backend

`CORS_ORIGIN` du backend **doit** lister `https://app.saambiz.com`. L'espace
vendeur et l'API sont deux origines distinctes : sans cette autorisation, le
navigateur bloque chaque appel et l'écran reste vide, sans message. C'est la
première chose à vérifier si la connexion « ne fait rien ».

### Première installation sur le serveur

Le workflow met à jour, il ne clone jamais : un premier passage à la main est
nécessaire.

```bash
mkdir -p /var/www/saambiz-vendeur
git clone https://github.com/Alassanegueye/Saambiz_Admin_Vendeur.git /var/www/saambiz-vendeur
cd /var/www/saambiz-vendeur
docker run --rm -v /var/www/saambiz-vendeur:/app -w /app node:22-slim \
  sh -c "npm ci --no-audit --no-fund && npm run build"
```

Le build tourne dans un conteneur jetable : le serveur n'a pas besoin de Node.

Puis Nginx, en deux temps — `deploy/nginx.conf` référence les certificats
Let's Encrypt, qui n'existent pas encore :

```bash
cp deploy/nginx-http.conf /etc/nginx/sites-available/saambiz-vendeur
sed -i "s/YOUR_DOMAIN/app.saambiz.com/g" /etc/nginx/sites-available/saambiz-vendeur
ln -sf /etc/nginx/sites-available/saambiz-vendeur /etc/nginx/sites-enabled/saambiz-vendeur
nginx -t && systemctl reload nginx
certbot --nginx -d app.saambiz.com
```

`nginx -t` avant chaque `reload`, sans exception : Nginx est partagé, et un
seul fichier invalide empêche de recharger **tous** les sites de la machine.

Ensuite, plus rien à faire à la main : le déploiement repose
`deploy/nginx.conf` à chaque poussée, en sauvegardant la version en place et
en la **restaurant avant d'échouer** si `nginx -t` ne passe pas.

### Si une route profonde répond 404

`/connexion` renvoie 404 après un rechargement : le `try_files` de la
configuration Nginx n'est pas actif. C'est le seul réglage sans lequel une
application React Router paraît fonctionner — jusqu'au premier
rafraîchissement.
