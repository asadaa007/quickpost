import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-jet py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-sm text-zinc-500 md:flex-row md:text-left md:px-6">
        <p>© {new Date().getFullYear()} QuickPost. Premium product journalism.</p>
        <div className="flex gap-6">
          <Link to="/" className="hover:text-gold">
            Home
          </Link>
          <Link to="/categories" className="hover:text-gold">
            Categories
          </Link>
        </div>
      </div>
    </footer>
  );
}
