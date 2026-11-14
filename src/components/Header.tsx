import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-brand">
            Tendazo
          </span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            href="/vender"
            className="rounded-full bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-dark"
          >
            Abrir mi tienda
          </Link>
        </nav>
      </div>
    </header>
  );
}
