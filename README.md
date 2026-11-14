# Tendazo

Marketplace de tiendas locales en Colombia. Los compradores arman su pedido sin
crear cuenta y lo cierran directo por **WhatsApp**. Los emprendedores abren su
vitrina con URL propia en minutos. Modelo de negocio: "arriendo virtual" mensual
tras 30 días gratis.

Construido con **Next.js (App Router) + Supabase + Tailwind CSS**.

---

## ⚠️ Importante antes de empezar

Este proyecto se generó en un entorno **sin acceso a internet**, por lo que las
dependencias **no están instaladas** y el build no se verificó aquí. Debes
instalarlas y ejecutarlo en tu máquina (que sí tiene internet) siguiendo los
pasos de abajo.

---

## 1. Requisitos

- Node.js 18+ (recomendado 20 o 22)
- Una cuenta gratuita en [Supabase](https://supabase.com)

## 2. Instalar dependencias

```bash
npm install
```

## 3. Configurar Supabase

1. Crea un proyecto nuevo en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta el contenido de [`supabase/schema.sql`](./supabase/schema.sql).
   Esto crea las tablas, políticas de seguridad (RLS), la función de contador de
   pedidos y el bucket de imágenes `media`.
3. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`

### Login con Google (opcional pero pedido)

1. En Supabase: **Authentication → Providers → Google** → actívalo.
2. Crea credenciales OAuth en [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - URI de redirección autorizado:
     `https://<TU-PROYECTO>.supabase.co/auth/v1/callback`
3. Pega el *Client ID* y *Client Secret* en Supabase.

### Magic link (correo)

Viene activado por defecto en Supabase. En **Authentication → URL Configuration**
agrega tu `Site URL` (ej. `http://localhost:3000`) y a *Redirect URLs*
`http://localhost:3000/auth/callback`.

## 4. Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 5. Ejecutar en local

```bash
npm run dev
```

Abre http://localhost:3000.

---

## Qué incluye este MVP

**Comprador**
- Buscador por ciudad, categoría y modalidad detal / por mayor.
- Búsqueda tolerante a errores y sinónimos (buso/hoodie, tenis/zapatillas…).
- Vitrina individual con URL propia: `tendazo.com/nombre-tienda`.
- Indicador "Abierto ahora", métodos de pago, envíos.
- Selección de variantes (talla, color, sabor), notas y cantidades.
- Carrito multi-producto **sin cuenta** (se guarda en el celular).
- Botón **"Pedir por WhatsApp"** con el mensaje pre-armado y ordenado.

**Vendedor** (`/vender` → `/panel`)
- Login sin contraseñas: magic link por correo + Google.
- Configuración guiada en 3 pasos.
- Subida de productos con **compresión automática de imágenes** en el navegador.
- Doble precio: detal y mayorista.
- Variantes, etiquetas (nuevo / oferta / últimas unidades), precio anterior.
- Interruptor **Disponible / Agotado** de un toque.
- **Contador de impacto**: pedidos y valor total recibidos en el mes.
- **Kit de publicidad**: enlace para compartir + QR descargable.

**Admin / crecimiento**
- SEO automático por tienda (metadatos + `sitemap.xml` dinámico + `robots.txt`).
- Registro de búsquedas sin resultado (`search_misses`) para el radar de demanda.

### Pendiente para fases siguientes (estructura ya preparada)

- Login por OTP de WhatsApp (requiere WhatsApp Business API).
- Panel de super-administrador, cobro de arriendo y "Modo Vitrina Básico".
- Sello "Tienda Verificada", calificaciones y reportes.
- Asistente por voz, generador de imágenes para estados, favoritos.

---

## Despliegue

Recomendado en [Vercel](https://vercel.com): importa el repo, agrega las tres
variables de entorno y despliega. Ajusta `NEXT_PUBLIC_SITE_URL` a tu dominio y
añade esa URL a las *Redirect URLs* de Supabase.
