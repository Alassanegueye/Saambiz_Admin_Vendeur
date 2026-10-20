import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '../utils/alert';

/**
 * Chargement d'une page : données, état de chargement, erreur, rechargement.
 *
 * Le premier appel ne repasse pas `loading` à true — il l'est déjà — et pose
 * une garde d'annulation : si l'utilisateur quitte la page avant la fin de la
 * requête, la réponse est ignorée au lieu d'écrire dans un composant démonté.
 */
export default function usePageData(fetcher, errorMessage = 'Erreur lors du chargement') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const vivantRef = useRef(true);

  const load = useCallback(async ({ initial = false } = {}) => {
    if (!initial) setLoading(true);
    try {
      const result = await fetcher();
      if (!vivantRef.current) return;
      setData(result);
      setError(null);
    } catch (err) {
      if (!vivantRef.current) return;
      setError(err);
      toast.error(errorMessage);
    } finally {
      if (vivantRef.current) setLoading(false);
    }
  }, [fetcher, errorMessage]);

  useEffect(() => {
    vivantRef.current = true;
    load({ initial: true });
    return () => { vivantRef.current = false; };
  }, [load]);

  return { data, loading, error, reload: load };
}
