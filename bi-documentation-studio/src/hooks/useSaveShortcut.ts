import { useEffect, useRef } from 'react';

/**
 * Registra o atalho Ctrl+S (e Cmd+S no macOS) para acionar onSave.
 * Usa ref para sempre chamar a versão mais recente do callback
 * sem re-registrar o listener a cada render.
 */
export function useSaveShortcut(onSave: () => void): void {
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  });

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSaveRef.current();
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []); // registrado uma única vez
}