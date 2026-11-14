import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-5xl font-extrabold text-brand">404</p>
      <h1 className="mt-4 text-xl font-bold">Página no encontrada</h1>
      <p className="mt-2 text-slate-500">
        Esta tienda o página no existe o fue movida.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-brand px-5 py-3 font-semibold text-white"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
