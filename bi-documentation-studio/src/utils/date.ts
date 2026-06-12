import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatarData(isoString: string): string {
  try {
    return format(parseISO(isoString), 'dd/MM/yyyy', { locale: ptBR });
  } catch {
    return isoString;
  }
}

export function formatarDataHora(isoString: string): string {
  try {
    return format(parseISO(isoString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return isoString;
  }
}

/**
 * Sufixo para pastas/arquivos de snapshot, incluindo data e hora
 * para permitir múltiplas exportações no mesmo dia.
 * Ex: "12-06-2026_14-35"
 */
export function gerarSufixoSnapshot(): string {
  return format(new Date(), 'dd-MM-yyyy_HH-mm');
}

export function agora(): string {
  return new Date().toISOString();
}