import { useState, useMemo } from 'react';

/**
 * Hook genérico de filtro por texto.
 * Recebe a lista original e uma função que define quais campos
 * de cada item devem ser comparados com o termo digitado.
 */
export function useSearchFilter<T>(
  items: T[],
  getTermos: (item: T) => (string | null | undefined)[],
) {
  const [busca, setBusca] = useState('');

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return items;
    return items.filter((item) =>
      getTermos(item).some((campo) =>
        campo?.toLowerCase().includes(termo),
      ),
    );
  }, [items, busca, getTermos]);

  function limpar() { setBusca(''); }

  return { busca, setBusca, limpar, itensFiltrados };
}