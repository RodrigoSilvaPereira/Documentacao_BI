import { useState, useEffect } from 'react';
import { convertFileSrc } from '@tauri-apps/api/core';
import { join } from '@tauri-apps/api/path';
import { useAppStore } from '@store/useAppStore';
import type { Imagem } from '@models/schema';

export function useImagePath(imagem: Imagem | null | undefined): string | null {
  const projetoAberto = useAppStore((s) => s.projetoAberto);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!imagem?.caminho || !projetoAberto) { setSrc(null); return; }
    join(projetoAberto.caminho, imagem.caminho).then((abs) => setSrc(convertFileSrc(abs)));
  }, [imagem, projetoAberto]);

  return src;
}