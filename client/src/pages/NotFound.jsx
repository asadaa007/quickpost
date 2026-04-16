import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

export function NotFound() {
  return (
    <>
      <Helmet><title>404 — Page not found · QuickPost</title></Helmet>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.06),_transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative"
        >
          <p className="bg-gradient-to-r from-gold via-amber-300 to-gold bg-clip-text text-[120px] font-black leading-none text-transparent md:text-[160px]">
            404
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white md:text-3xl">
            Page not found
          </h1>
          <p className="mx-auto mt-4 max-w-md text-zinc-400">
            The page you're looking for doesn't exist, was moved, or the URL is incorrect.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/"
              className="rounded-2xl bg-gradient-to-r from-gold to-amber-500 px-6 py-2.5 text-sm font-medium text-jet shadow-lg shadow-gold/20 transition hover:shadow-gold/40"
            >
              Back to Home
            </Link>
            <Link
              to="/categories"
              className="rounded-2xl border border-zinc-700 px-6 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-gold/50 hover:text-gold"
            >
              Browse categories
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
}
