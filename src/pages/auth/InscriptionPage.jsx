import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '../../utils/alert';
import { Helmet } from 'react-helmet';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import PanneauMarque from '../../components/auth/PanneauMarque';
import useCategories from '../../hooks/useCategories';
import {
  envoyerCodeInscription,
  verifierCodeInscription,
  inscrireVendeur,
} from '../../service/auth.service';

/**
 * Création d'un compte vendeur depuis le site.
 *
 * Même parcours et mêmes routes que l'application mobile : le compte créé ici
 * sert tel quel dans l'application, et inversement (connexion par email ou
 * téléphone + mot de passe). L'adresse est confirmée par un code AVANT la
 * création du compte, qui naît donc vérifié.
 *
 *   1. Vous          prénom, nom, email, WhatsApp
 *   2. Sécurité      mot de passe
 *   3. Boutique      nom de la boutique
 *   4. Catégories    catégories, ville
 *   5. Vérification  code reçu par email → compte + boutique créés → connexion
 */

const ETAPES = ['Vous', 'Sécurité', 'Boutique', 'Catégories', 'Vérification'];
const VILLES = ['Dakar', 'Thiès', 'Saint-Louis', 'Touba', 'Mbour', 'Ziguinchor', 'Kaolack', 'Rufisque', 'Diourbel', 'Autre'];
const MAX_CATEGORIES = 3;
const DELAI_RENVOI = 30;

const REGLES = [
  ['8 caractères', (v) => v.length >= 8],
  ['Une majuscule', (v) => /[A-Z]/.test(v)],
  ['Un chiffre', (v) => /[0-9]/.test(v)],
  ['Un caractère spécial', (v) => /[^A-Za-z0-9]/.test(v)],
];

const messageErreur = (err, defaut) => {
  if (!err?.response) return 'Serveur injoignable. Réessayez dans un instant.';
  const d = err.response.data || {};
  if (Array.isArray(d.errors) && d.errors.length) {
    return d.errors.map((e) => e.message || e.msg || e).join(' ');
  }
  return d.message || defaut;
};

const telNormalise = (t) => t.replace(/[\s.-]/g, '');

function Icone({ children }) {
  return (
    <span className="cnx-saisie-icone" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9"
           strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </span>
  );
}

function Champ({ id, label, icone, aide, ...props }) {
  return (
    <div className="cnx-champ">
      <label className="cnx-label" htmlFor={id}>{label}</label>
      <div className="cnx-saisie">
        {icone && <Icone>{icone}</Icone>}
        <input id={id} {...props} />
      </div>
      {aide && <p className="ins-aide">{aide}</p>}
    </div>
  );
}

export default function InscriptionPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [etape, setEtape] = useState(0);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  // Étape 1
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  // Étape 2
  const [motDePasse, setMotDePasse] = useState('');
  const [voirMdp, setVoirMdp] = useState(false);
  // Étape 3
  const [nomBoutique, setNomBoutique] = useState('');
  const { categories, etat: etatCategories, recharger: rechargerCategories } = useCategories();
  const [choix, setChoix] = useState([]);
  const [ville, setVille] = useState(VILLES[0]);
  // Étape 4
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [renvoiDans, setRenvoiDans] = useState(0);
  const cases = useRef([]);

  useEffect(() => {
    if (renvoiDans <= 0) return undefined;
    const t = setTimeout(() => setRenvoiDans((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [renvoiDans]);

  const emailPropre = email.trim().toLowerCase();

  // ─── Validation par étape ────────────────────────────────────────────────
  const valider = () => {
    if (etape === 0) {
      if (prenom.trim().length < 2 || nom.trim().length < 2) return 'Indiquez votre prénom et votre nom.';
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(emailPropre)) return 'Adresse email invalide.';
      if (!/^\+?\d{8,15}$/.test(telNormalise(telephone))) return 'Numéro WhatsApp invalide.';
    }
    if (etape === 1) {
      const manque = REGLES.find(([, ok]) => !ok(motDePasse));
      if (manque) return `Mot de passe : ${manque[0].toLowerCase()} au minimum.`;
    }
    if (etape === 2) {
      if (nomBoutique.trim().length < 2) return 'Donnez un nom à votre boutique.';
      if (!/^\p{L}/u.test(nomBoutique.trim())) return 'Le nom de la boutique doit commencer par une lettre.';
    }
    if (etape === 3) {
      if (choix.length === 0) return 'Choisissez au moins une catégorie.';
    }
    return '';
  };

  const envoyerCode = async () => {
    await envoyerCodeInscription(emailPropre, prenom.trim());
    setRenvoiDans(DELAI_RENVOI);
    setCode(['', '', '', '', '', '']);
  };

  const suivant = async (e) => {
    e.preventDefault();
    const probleme = valider();
    setErreur(probleme);
    if (probleme) return;

    if (etape < 3) { setEtape(etape + 1); return; }

    // Fin de l'étape « Boutique » : le code part maintenant, pour ne pas
    // expirer pendant que la personne remplit le reste.
    setChargement(true);
    try {
      await envoyerCode();
      setEtape(4);
      setTimeout(() => cases.current[0]?.focus(), 50);
    } catch (err) {
      setErreur(messageErreur(err, "Le code n'a pas pu être envoyé."));
    } finally {
      setChargement(false);
    }
  };

  const renvoyer = async () => {
    if (renvoiDans > 0 || chargement) return;
    setErreur('');
    try {
      await envoyerCode();
      toast.info('Un nouveau code vient de partir.');
    } catch (err) {
      setErreur(messageErreur(err, "Le code n'a pas pu être envoyé."));
    }
  };

  const terminer = async (e) => {
    e?.preventDefault();
    const saisi = code.join('');
    if (saisi.length < 6) { setErreur('Saisissez les 6 chiffres du code.'); return; }
    setErreur('');
    setChargement(true);
    try {
      const { data } = await verifierCodeInscription(emailPropre, saisi);
      const jetonEmail = data?.jetonEmail;
      if (!jetonEmail) throw new Error('jeton absent');

      const whatsapp = telNormalise(telephone);
      await inscrireVendeur({
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: emailPropre,
        mot_de_passe: motDePasse,
        telephone: whatsapp,
        role: 'Vendeur',
        jetonEmail,
        nomBoutique: nomBoutique.trim(),
        description: `Boutique à ${ville}`,
        localisation: ville,
        categories: choix,
        telephoneBoutique: whatsapp,
      });

      await login(emailPropre, motDePasse);
      toast.success('Votre boutique est créée. Bienvenue sur SaamBiz !');
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (err) {
      setErreur(messageErreur(err, 'Code incorrect ou expiré.'));
    } finally {
      setChargement(false);
    }
  };

  // ─── Saisie du code ──────────────────────────────────────────────────────
  const saisirChiffre = (i, valeur) => {
    const chiffres = valeur.replace(/\D/g, '');
    const suivantCode = [...code];
    if (chiffres.length > 1) {
      // Collage du code complet depuis l'email.
      chiffres.slice(0, 6).split('').forEach((c, k) => { suivantCode[k] = c; });
      setCode(suivantCode);
      cases.current[Math.min(chiffres.length, 5)]?.focus();
      return;
    }
    suivantCode[i] = chiffres;
    setCode(suivantCode);
    if (chiffres && i < 5) cases.current[i + 1]?.focus();
  };

  const toucheCase = (i, e) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) cases.current[i - 1]?.focus();
  };

  const basculerCategorie = (slug) => {
    setChoix((c) => {
      if (c.includes(slug)) return c.filter((s) => s !== slug);
      if (c.length >= MAX_CATEGORIES) {
        toast.info(`${MAX_CATEGORIES} catégories au maximum.`);
        return c;
      }
      return [...c, slug];
    });
  };

  const regleMdp = REGLES.map(([libelle, ok]) => [libelle, ok(motDePasse)]);

  const titres = [
    ['Créer votre boutique', 'Gratuit, en quelques minutes.'],
    ['Votre mot de passe', 'Il servira aussi dans l\'application.'],
    ['Votre boutique', 'Le nom que verront vos clients.'],
    ['Ce que vous vendez', 'Tout reste modifiable ensuite.'],
    ['Vérifiez votre email', <>Code envoyé à <strong>{emailPropre}</strong></>],
  ];

  return (
    <>
      <Helmet><title>Créer ma boutique — SaamBiz</title></Helmet>

      <div className="cnx cnx--defile">
        <PanneauMarque />

        <main className="cnx-droite">
          <button
            type="button"
            className="cnx-retour"
            onClick={() => (etape > 0 && !chargement ? (setErreur(''), setEtape(etape - 1)) : navigate(ROUTES.LOGIN))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {etape > 0 ? 'Retour' : 'Connexion'}
          </button>

          <div className="cnx-carte">
            {/* Progression */}
            <div className="ins-etapes" aria-label={`Étape ${etape + 1} sur ${ETAPES.length}`}>
              {ETAPES.map((libelle, i) => (
                <span key={libelle} className={`ins-segment${i < etape ? ' fait' : ''}${i === etape ? ' actif' : ''}`} />
              ))}
            </div>
            <p className="ins-etape-texte">
              <strong>ÉTAPE {etape + 1} SUR {ETAPES.length}</strong> · {ETAPES[etape]}
            </p>

            <h2 className="cnx-carte-titre">{titres[etape][0]}</h2>
            <p className="cnx-carte-sous">{titres[etape][1]}</p>

            {erreur && <div className="ins-erreur" role="alert">{erreur}</div>}

            {etape < 4 && (
              <form onSubmit={suivant} noValidate>
                {etape === 0 && (
                  <>
                    <div className="ins-deux">
                      <Champ id="prenom" label="Prénom" placeholder="Awa" value={prenom}
                             onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" autoFocus
                             icone={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>} />
                      <Champ id="nom" label="Nom" placeholder="Diop" value={nom}
                             onChange={(e) => setNom(e.target.value)} autoComplete="family-name" />
                    </div>
                    <Champ id="email" label="Email" type="email" placeholder="votre@email.com" value={email}
                           onChange={(e) => setEmail(e.target.value)} autoComplete="email"
                           icone={<><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" /></>} />
                    <Champ id="tel" label="WhatsApp" type="tel" placeholder="77 123 45 67" value={telephone}
                           onChange={(e) => setTelephone(e.target.value.replace(/[^0-9+ ]/g, ''))} autoComplete="tel"
                           aide="Vos clients vous écriront sur ce numéro."
                           icone={<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />} />
                  </>
                )}

                {etape === 1 && (
                  <>
                    <div className="cnx-champ">
                      <label className="cnx-label" htmlFor="mdp">Mot de passe</label>
                      <div className="cnx-saisie">
                        <Icone><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icone>
                        <input id="mdp" type={voirMdp ? 'text' : 'password'} placeholder="••••••••" value={motDePasse}
                               onChange={(e) => setMotDePasse(e.target.value)} autoComplete="new-password" autoFocus />
                        <button type="button" className="cnx-oeil" onClick={() => setVoirMdp((v) => !v)}
                                aria-label={voirMdp ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                            {voirMdp && <line x1="3" y1="21" x2="21" y2="3" />}
                          </svg>
                        </button>
                      </div>
                    </div>
                    <ul className="ins-regles">
                      {regleMdp.map(([libelle, ok]) => (
                        <li key={libelle} className={ok ? 'ok' : ''}>{libelle}</li>
                      ))}
                    </ul>
                  </>
                )}

                {etape === 2 && (
                  <>
                    <Champ id="boutique" label="Nom de la boutique" placeholder="Boutique Awa" value={nomBoutique}
                           onChange={(e) => setNomBoutique(e.target.value)} autoFocus
                           icone={<><path d="M3 9l1.5-5h15L21 9" /><path d="M4 9v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" /><path d="M9 21v-6h6v6" /></>}
                           aide="Il doit commencer par une lettre. Vous pourrez le changer plus tard." />
                  </>
                )}

                {etape === 3 && (
                  <>
                    <div className="cnx-champ">
                      <span className="cnx-label">Catégories <small className="ins-discret">(1 à {MAX_CATEGORIES})</small></span>
                      <div className="ins-puces">
                        {etatCategories === 'chargement' && <span className="ins-discret">Chargement des catégories…</span>}
                        {etatCategories === 'erreur' && (
                          <span className="ins-discret">
                            Impossible de charger les catégories.{' '}
                            <button type="button" className="ins-lien" onClick={rechargerCategories}>Réessayer</button>
                          </span>
                        )}
                        {etatCategories === 'ok' && categories.length === 0 && (
                          <span className="ins-discret">Aucune catégorie disponible pour l&apos;instant.</span>
                        )}
                        {categories.map((c) => {
                          const slug = c.slug || c.id || c.nom;
                          const actif = choix.includes(slug);
                          return (
                            <button key={slug} type="button" className={`ins-puce${actif ? ' actif' : ''}`}
                                    onClick={() => basculerCategorie(slug)} aria-pressed={actif}>
                              {c.nom}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="cnx-champ">
                      <label className="cnx-label" htmlFor="ville">Ville</label>
                      <div className="cnx-saisie">
                        <Icone><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></Icone>
                        <select id="ville" className="ins-select" value={ville} onChange={(e) => setVille(e.target.value)}>
                          {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <button className="cnx-bouton" type="submit" disabled={chargement}>
                  {chargement && <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />}
                  {etape < 3 ? 'Continuer' : chargement ? 'Envoi du code…' : 'Recevoir mon code'}
                </button>
              </form>
            )}

            {etape === 4 && (
              <form onSubmit={terminer} noValidate>
                <div className="ins-code">
                  {code.map((c, i) => (
                    <input
                      key={i}
                      ref={(el) => { cases.current[i] = el; }}
                      value={c}
                      onChange={(e) => saisirChiffre(i, e.target.value)}
                      onKeyDown={(e) => toucheCase(i, e)}
                      inputMode="numeric"
                      autoComplete={i === 0 ? 'one-time-code' : 'off'}
                      maxLength={i === 0 ? 6 : 1}
                      aria-label={`Chiffre ${i + 1}`}
                      className={c ? 'rempli' : ''}
                    />
                  ))}
                </div>

                <button className="cnx-bouton" type="submit" disabled={chargement}>
                  {chargement && <div className="spinner spinner-sm" style={{ borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />}
                  {chargement ? 'Création de votre boutique…' : 'Créer ma boutique'}
                </button>

                <p className="ins-renvoi">
                  {renvoiDans > 0
                    ? `Renvoyer le code dans ${renvoiDans} s`
                    : <button type="button" className="ins-lien" onClick={renvoyer}>Renvoyer le code</button>}
                </p>
                <p className="ins-discret ins-centre">Pensez à vérifier vos spams.</p>
              </form>
            )}

            {etape === 0 && (
              <p className="ins-bas">
                Déjà un compte ? <Link to={ROUTES.LOGIN}>Se connecter</Link>
              </p>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
