import { normalize } from "./format";

// Grupos de sinónimos: cualquier término del grupo expande a todos los demás.
const GROUPS: string[][] = [
  ["buso", "buzo", "saco", "hoodie", "sudadera", "chaqueta"],
  ["tenis", "zapatillas", "guayos", "zapatos deportivos"],
  ["camiseta", "camisa", "playera", "polo", "t-shirt"],
  ["jean", "jeans", "pantalon", "pantalones"],
  ["torta", "pastel", "ponque", "cake", "repostería", "reposteria"],
  ["celular", "telefono", "teléfono", "movil", "móvil", "smartphone"],
  ["tenis", "deportivos"],
  ["gorra", "cachucha"],
];

/**
 * Dado un término de búsqueda, devuelve el término + sus sinónimos conocidos.
 * Sirve para ampliar la consulta y tolerar sinónimos regionales.
 */
export function expandSynonyms(term: string): string[] {
  const n = normalize(term);
  const result = new Set<string>([n]);
  for (const group of GROUPS) {
    const normalizedGroup = group.map(normalize);
    if (normalizedGroup.includes(n)) {
      normalizedGroup.forEach((g) => result.add(g));
    }
  }
  return Array.from(result);
}
