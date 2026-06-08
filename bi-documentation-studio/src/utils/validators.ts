export function validarObrigatorio(valor: string): string | null {
  return valor.trim() ? null : 'Campo obrigatório';
}

export function validarDataMesAno(valor: string): string | null {
  if (!valor.trim()) return 'Campo obrigatório';
  return /^(0[1-9]|1[0-2])\/\d{4}$/.test(valor)
    ? null
    : 'Use o formato MM/AAAA';
}