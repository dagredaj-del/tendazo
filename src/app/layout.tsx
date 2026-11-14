import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tendazo — Catálogos que venden por WhatsApp",
    template: "%s | Tendazo",
  },
  description:
    "Encuentra tiendas y emprendimientos locales. Arma tu pedido y cómpralo directo por WhatsApp, sin crear cuenta.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
