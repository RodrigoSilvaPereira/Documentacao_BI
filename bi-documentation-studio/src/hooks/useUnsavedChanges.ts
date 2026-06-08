import { useEffect } from 'react';
import { useDocStore } from '@store/useDocStore';

export function useUnsavedChanges(): boolean {
  const temAlteracoes = useDocStore((s) => s.temAlteracoes);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (temAlteracoes) e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [temAlteracoes]);

  return temAlteracoes;
}