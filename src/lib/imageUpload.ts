import { createClient } from "./supabase/client";

/**
 * Comprime una imagen en el navegador antes de subirla.
 * Redimensiona a máx. 1000px por lado y la exporta como JPEG de calidad media,
 * reduciendo mucho el peso sin dañar la calidad visible. Clave para celulares
 * sencillos y planes de datos limitados.
 */
export async function compressImage(file: File, maxSize = 1000): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  let { width, height } = img;
  if (width > height && width > maxSize) {
    height = Math.round((height * maxSize) / width);
    width = maxSize;
  } else if (height > maxSize) {
    width = Math.round((width * maxSize) / height);
    height = maxSize;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo procesar la imagen.");
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Fallo al comprimir")),
      "image/jpeg",
      0.8,
    );
  });
}

/** Comprime y sube la imagen al bucket "media", devuelve la URL pública. */
export async function uploadProductImage(file: File): Promise<string> {
  const blob = await compressImage(file);
  const supabase = createClient();
  const path = `products/${crypto.randomUUID()}.jpg`;

  const { error } = await supabase.storage
    .from("media")
    .upload(path, blob, { contentType: "image/jpeg", upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}
