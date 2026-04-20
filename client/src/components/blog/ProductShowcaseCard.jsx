import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { extractAsinFromUrl } from "../../utils/amazon";

function isAmazonUrl(url) {
  if (!url) return false;
  try {
    const h = new URL(url).hostname.toLowerCase();
    return h.includes("amazon.");
  } catch {
    return false;
  }
}

function StarRating({ value }) {
  const v = Math.max(0, Math.min(5, Number(value) || 0));
  const full = Math.floor(v);
  const half = v - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating ${v} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= full || (i === full + 1 && half);
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${filled ? "fill-gold text-gold" : "text-zinc-600"}`}
            strokeWidth={filled ? 0 : 1.5}
          />
        );
      })}
      <span className="ml-2 text-sm font-medium text-zinc-300">{v.toFixed(1)}</span>
    </div>
  );
}

export default function ProductShowcaseCard({ product, index = 0 }) {
  if (!product) return null;
  const amazon = isAmazonUrl(product.affiliateLink);
  const ctaLabel = amazon ? "Buy on Amazon" : "View Product";
  const asin = extractAsinFromUrl(product.affiliateLink);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="overflow-hidden rounded-3xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/95 to-zinc-950 shadow-xl shadow-black/50"
    >
      <div className="grid gap-0 lg:grid-cols-[minmax(0,340px)_1fr]">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-950 lg:aspect-auto lg:min-h-[280px]">
          {product.image ? (
            <img src={product.image} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 text-sm text-zinc-600">
              No image
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent lg:bg-gradient-to-r" />
          {(product.bestFor || "").trim() && (
            <span className="absolute bottom-4 left-4 inline-flex max-w-[90%] items-center gap-1.5 rounded-full border border-gold/35 bg-black/55 px-3 py-1 text-xs font-medium text-gold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              Best for: {(product.bestFor || "").trim()}
            </span>
          )}
        </div>
        <div className="flex flex-col gap-5 p-6 md:p-8">
          <div className="flex flex-col gap-2 border-b border-zinc-800/80 pb-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-white md:text-2xl">{product.title}</h3>
              {asin && (
                <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">ASIN {asin}</p>
              )}
            </div>
            {product.rating != null && product.rating !== "" && <StarRating value={product.rating} />}
          </div>

          {product.price && (
            <p className="text-sm text-zinc-400">
              Price: <span className="font-semibold text-white">{product.price}</span>
            </p>
          )}

          {product.features?.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Key features</h4>
              <ul className="space-y-2 text-sm text-zinc-300">
                {product.features.map((f, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/80" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {product.pros?.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-400/90">Pros</h4>
                <ul className="space-y-1.5 text-sm text-emerald-100/90">
                  {product.pros.map((p, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-400">+</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {product.cons?.length > 0 && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-red-400/90">Cons</h4>
                <ul className="space-y-1.5 text-sm text-red-100/90">
                  {product.cons.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-red-400">−</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {product.affiliateLink && (
            <a
              href={product.affiliateLink}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="group/btn relative mt-auto inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-gold to-gold-dim px-6 py-3.5 text-center text-sm font-semibold text-black shadow-lg shadow-gold/25 transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <span className="absolute inset-0 translate-y-full bg-white/25 transition duration-300 group-hover/btn:translate-y-0" />
              <span className="relative">{ctaLabel}</span>
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
