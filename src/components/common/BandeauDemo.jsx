import { modeDemoActif } from '../../service/demo/adaptateur';

/**
 * Bandeau permanent du mode démo.
 *
 * Sans lui, rien ne distingue à l'écran des chiffres inventés de vraies
 * ventes — le risque n'est pas théorique dès qu'on fait une capture pour la
 * montrer à quelqu'un.
 */
export default function BandeauDemo() {
  if (!modeDemoActif()) return null;

  return (
    <div className="bandeau-demo" role="status">
      <strong>Mode démo</strong>
      <span>Données fictives, aucune connexion au serveur</span>
      <a href="?demo=0">Quitter</a>
    </div>
  );
}
