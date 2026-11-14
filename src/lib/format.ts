/** Formatea un entero de pesos colombianos: 35000 -> "$35.000" */
export function formatCOP(value: number): string {
  return "$" + value.toLocaleString("es-CO");
}

/** Normaliza texto para búsqueda: minúsculas, sin tildes. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Convierte un nombre de tienda en slug de URL: "Mi Tienda" -> "mi-tienda" */
export function slugify(text: string): string {
  return normalize(text)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Limpia un número de WhatsApp a solo dígitos con indicativo. */
export function cleanWhatsapp(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Si tiene 10 dígitos (celular colombiano), antepone 57.
  if (digits.length === 10) return "57" + digits;
  return digits;
}
