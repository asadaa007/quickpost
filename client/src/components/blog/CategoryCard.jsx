import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getHomeCategoryMeta } from "../../data/homeCategoryMeta";

export default function CategoryCard({ category, index = 0 }) {
  if (!category) return null;
  const { Icon, accent, bg, border } = getHomeCategoryMeta(category.slug);
  const count = category.postCount ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/category/${category.slug}`}
        className={`group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 transition-all duration-300 ${border} hover:border-gold/50 hover:shadow-[0_0_32px_-8px_rgba(212,175,55,0.35)] hover:shadow-gold/20`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.08),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className={`relative flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`h-6 w-6 ${accent}`} />
        </div>
        <div className="relative">
          <h3 className="text-base font-semibold text-white transition group-hover:text-gold">{category.name}</h3>
          <p className="mt-1 text-sm text-zinc-500">
            {count} {count === 1 ? "post" : "posts"}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
