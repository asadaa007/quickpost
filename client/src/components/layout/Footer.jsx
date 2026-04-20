import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function Footer() {
  const year = new Date().getFullYear();

  const col = (title, links) => (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h3>
      <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link to={to} className="transition hover:text-gold">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-gradient-to-b from-jet to-zinc-950 py-14">
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 text-lg font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-gold shadow-[0_0_12px_rgba(212,175,55,0.7)]" />
              QuickPost
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-zinc-500">
              Premium product journalism—honest pros and cons, clear comparisons, and layouts built for readers who want
              to buy with confidence.
            </p>
          </motion.div>

          {col("Explore", [
            { to: "/", label: "Home" },
            { to: "/categories", label: "Categories" },
            { to: "/search", label: "Search" },
          ])}

          {col("Reading", [
            { to: "/#featured", label: "Featured" },
            { to: "/#latest-posts", label: "Latest posts" },
          ])}

          {col("Account", [
            { to: "/dev-post/login", label: "Admin login" },
            { to: "/dev-post/register", label: "Register" },
          ])}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-800/80 pt-8 text-center text-xs text-zinc-600 md:flex-row md:text-left">
          <p>© {year} QuickPost. Dark & gold — built for clarity and calm reading.</p>
          <p className="max-w-md md:text-right">
            Some retailer links may earn us a small commission at no extra cost to you. We only recommend products we
            genuinely rate.
          </p>
        </div>
      </div>
    </footer>
  );
}
