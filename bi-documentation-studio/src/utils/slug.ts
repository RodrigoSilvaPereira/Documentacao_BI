/**
 * Converte um texto em slug seguro para nome de arquivo:
 * remove acentos, espaços e caracteres especiais.
 * Ex: "Resumo Executivo" → "resumo-executivo"
 */
export function slugify(texto: string): string {
  const limpo = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // remove acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')       // tudo que não for letra/número → "-"
    .replace(/^-+|-+$/g, '');          // remove "-" das pontas

  return limpo || 'sem-titulo';
}