/**
 * Tableaux lisibles sur téléphone, sans défilement horizontal.
 *
 * Sur petit écran, la feuille de style présente chaque ligne d'un
 * `table.data-table` comme une carte : une valeur par ligne, précédée du
 * titre de sa colonne. Ce titre est lu dans l'en-tête du tableau et recopié
 * dans l'attribut `data-label` de chaque cellule — ici, une fois pour tous
 * les tableaux de l'application, présents et à venir, plutôt que dans
 * chacun des composants.
 */
function etiqueter(table) {
  const titres = Array.from(table.querySelectorAll('thead th')).map((th) => th.textContent.trim());
  if (titres.length === 0) return;
  table.querySelectorAll('tbody tr').forEach((tr) => {
    let colonne = 0;
    Array.from(tr.children).forEach((td) => {
      const titre = titres[colonne] || '';
      if (td.getAttribute('data-label') !== titre) td.setAttribute('data-label', titre);
      colonne += Number(td.getAttribute('colspan')) || 1;
    });
  });
}

export function activerTablesMobiles() {
  if (typeof window === 'undefined' || !('MutationObserver' in window)) return;
  let prevu = false;
  const tout = () => {
    prevu = false;
    document.querySelectorAll('table.data-table').forEach(etiqueter);
  };
  const planifier = () => {
    if (prevu) return;
    prevu = true;
    requestAnimationFrame(tout);
  };
  new MutationObserver(planifier).observe(document.body, { childList: true, subtree: true });
  planifier();
}
