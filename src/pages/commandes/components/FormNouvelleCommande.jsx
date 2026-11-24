import { Minus, Plus, Search, Trash2, Store, Truck, ImageOff } from 'lucide-react';
import { formatMontant } from '../../../utils/formatters';

/**
 * Le formulaire « Nouvelle commande » : une commande prise par téléphone,
 * sur WhatsApp ou en boutique, que le vendeur enregistre pour la suivre
 * comme les autres. `n` vient de useNouvelleCommande.
 */
function Vignette({ src, alt }) {
  return src
    ? <img src={src} alt={alt} className="nc-vignette" loading="lazy" />
    : <span className="nc-vignette nc-vignette--vide" aria-hidden="true"><ImageOff size={16} /></span>;
}

export default function FormNouvelleCommande({ n }) {
  const { form, changer, erreurs } = n;

  return (
    <div className="nc">
      {/* ── Client ─────────────────────────────────────── */}
      <section className="nc-bloc">
        <h3 className="nc-titre"><span>1</span> Le client</h3>
        <div className="form-duo">
          <div className="form-field">
            <label className="form-label" htmlFor="nc-prenom">Prénom</label>
            <input id="nc-prenom" className={`form-input ${erreurs.prenom ? 'is-invalid' : ''}`} value={form.prenom}
              onChange={(e) => changer('prenom', e.target.value)} autoComplete="off" />
            {erreurs.prenom && <span className="form-error">{erreurs.prenom}</span>}
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="nc-nom">Nom <small className="nc-facultatif">facultatif</small></label>
            <input id="nc-nom" className="form-input" value={form.nom} onChange={(e) => changer('nom', e.target.value)} autoComplete="off" />
          </div>
        </div>
        <div className="form-duo">
          <div className="form-field">
            <label className="form-label" htmlFor="nc-tel">Téléphone</label>
            <input id="nc-tel" className={`form-input ${erreurs.telephone ? 'is-invalid' : ''}`} value={form.telephone}
              inputMode="tel" placeholder="77 123 45 67" onChange={(e) => changer('telephone', e.target.value)} />
            {erreurs.telephone && <span className="form-error">{erreurs.telephone}</span>}
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="nc-email">Email <small className="nc-facultatif">facultatif</small></label>
            <input id="nc-email" type="email" className={`form-input ${erreurs.email ? 'is-invalid' : ''}`} value={form.email}
              onChange={(e) => changer('email', e.target.value)} />
            {erreurs.email && <span className="form-error">{erreurs.email}</span>}
          </div>
        </div>
      </section>

      {/* ── Produits ───────────────────────────────────── */}
      <section className="nc-bloc">
        <h3 className="nc-titre"><span>2</span> Les produits</h3>

        <div className="nc-recherche">
          <Search size={16} aria-hidden="true" />
          <input className="form-input" type="search" placeholder="Chercher un produit à ajouter…"
            value={n.recherche} onChange={(e) => n.setRecherche(e.target.value)} aria-label="Chercher un produit" />
        </div>

        <ul className="nc-catalogue" aria-label="Vos produits">
          {n.chargementProduits && <li className="nc-catalogue__info">Chargement de vos produits…</li>}
          {!n.chargementProduits && n.resultats.length === 0 && (
            <li className="nc-catalogue__info">
              {n.produits?.length ? 'Aucun produit ne correspond.' : 'Vous n’avez pas encore de produit.'}
            </li>
          )}
          {n.resultats.map((p) => {
            const epuise = p.disponible === false || Number(p.quantite) === 0;
            return (
              <li key={p.id}>
                <button type="button" className="nc-produit" onClick={() => n.ajouterProduit(p)} disabled={epuise}>
                  <Vignette src={p.image || p.images?.[0]?.url} alt="" />
                  <span className="nc-produit__nom">{p.nom}</span>
                  <span className="nc-produit__prix">{epuise ? 'Épuisé' : formatMontant(p.prix_promo > 0 && p.prix_promo < p.prix ? p.prix_promo : p.prix)}</span>
                  {!epuise && <span className="nc-produit__ajout" aria-hidden="true"><Plus size={15} strokeWidth={2.6} /></span>}
                </button>
              </li>
            );
          })}
        </ul>

        {n.lignes.length > 0 && (
          <ul className="nc-lignes">
            {n.lignes.map((l) => (
              <li key={l.uid} className="nc-ligne">
                <div className="nc-ligne__haut">
                  <Vignette src={l.image} alt="" />
                  <div className="nc-ligne__texte">
                    <strong>{l.nom}</strong>
                    <span>{formatMontant(l.prix)} l’unité{l.stock != null ? ` · ${l.stock} en stock` : ''}</span>
                  </div>
                  <button type="button" className="nc-ligne__retirer" onClick={() => n.retirerLigne(l.uid)} aria-label={`Retirer ${l.nom}`}>
                    <Trash2 size={16} />
                  </button>
                </div>

                {l.options.map((o) => (
                  <div key={o.cle} className="nc-option">
                    <span className={`nc-option__titre ${!l.choix[o.cle] && erreurs.lignes ? 'is-manquante' : ''}`}>
                      {o.libelle}{l.choix[o.cle] ? ` : ${l.choix[o.cle]}` : ''}
                    </span>
                    <div className="nc-option__valeurs">
                      {o.valeurs.map((v) => (
                        <button key={v.valeur} type="button"
                          className={`nc-puce ${l.choix[o.cle] === v.valeur ? 'is-active' : ''}`}
                          onClick={() => n.choisirOption(l.uid, o.cle, v.valeur)} aria-pressed={l.choix[o.cle] === v.valeur}>
                          {v.code && <span className="nc-puce__teinte" style={{ background: v.code }} aria-hidden="true" />}
                          {v.valeur}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="nc-ligne__bas">
                  <div className="nc-quantite" role="group" aria-label={`Quantité de ${l.nom}`}>
                    <button type="button" onClick={() => n.changerLigne(l.uid, { quantite: Math.max(1, l.quantite - 1) })}
                      disabled={l.quantite <= 1} aria-label="Diminuer"><Minus size={14} strokeWidth={2.6} /></button>
                    <span>{l.quantite}</span>
                    <button type="button" onClick={() => n.changerLigne(l.uid, { quantite: Math.min(99, l.quantite + 1) })}
                      disabled={l.quantite >= 99} aria-label="Augmenter"><Plus size={14} strokeWidth={2.6} /></button>
                  </div>
                  <strong className="nc-ligne__total">{formatMontant(l.prix * l.quantite)}</strong>
                </div>
              </li>
            ))}
          </ul>
        )}
        {erreurs.lignes && <span className="form-error">{erreurs.lignes}</span>}
      </section>

      {/* ── Livraison ──────────────────────────────────── */}
      <section className="nc-bloc">
        <h3 className="nc-titre"><span>3</span> Remise au client</h3>
        <div className="nc-modes" role="radiogroup" aria-label="Mode de remise">
          {[
            { v: 'retrait', icone: Store, titre: 'Retrait en boutique', texte: 'Le client passe récupérer' },
            { v: 'livraison', icone: Truck, titre: 'Livraison', texte: 'Vous livrez à son adresse' },
          ].map(({ v, icone, titre, texte }) => {
            const Icone = icone;
            return (
            <button key={v} type="button" role="radio" aria-checked={form.modeLivraison === v}
              className={`nc-mode ${form.modeLivraison === v ? 'is-active' : ''}`} onClick={() => changer('modeLivraison', v)}>
              <Icone size={18} aria-hidden="true" />
              <span><strong>{titre}</strong><small>{texte}</small></span>
            </button>
            );
          })}
        </div>
        {form.modeLivraison === 'livraison' && (
          <div className="form-field">
            <label className="form-label" htmlFor="nc-adresse">Adresse de livraison</label>
            <input id="nc-adresse" className={`form-input ${erreurs.adresseLivraison ? 'is-invalid' : ''}`}
              value={form.adresseLivraison} placeholder="Quartier, rue, point de repère…"
              onChange={(e) => changer('adresseLivraison', e.target.value)} />
            {erreurs.adresseLivraison && <span className="form-error">{erreurs.adresseLivraison}</span>}
          </div>
        )}
        <div className="form-field">
          <label className="form-label" htmlFor="nc-note">Note <small className="nc-facultatif">facultatif</small></label>
          <textarea id="nc-note" className="form-textarea" rows={2} maxLength={500} value={form.note}
            placeholder="Acompte reçu, heure de passage…" onChange={(e) => changer('note', e.target.value)} />
        </div>
        <p className="nc-aide">Le client règle de la main à la main (espèces, Wave, Orange Money). La commande est enregistrée comme confirmée et votre stock est mis à jour.</p>
      </section>
    </div>
  );
}
