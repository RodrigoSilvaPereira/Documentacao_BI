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

/** Gera sufixo de snapshot: "05-06" */
export function gerarSufixoSnapshot(): string {
  return format(new Date(), 'dd-MM');
}

export function agora(): string {
  return new Date().toISOString();
}