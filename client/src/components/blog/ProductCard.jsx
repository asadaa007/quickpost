import { motion } from "framer-motion";
import { Button } from "../ui/Button";
import { Check } from "lucide-react";

export function ProductCard({ product }) {
  const features = product.features?.length
    ? product.features
    : ["Curated pick", "Verified link", "Editor's choice"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-jet/80 shadow-lg transition-all duration-300 hover:border-gold/25 hover:shadow-gold/5 md:flex-row"
    >
      <div className="aspect-video w-full shrink-0 overflow-hidden bg-zinc-900 md:max-w-xs">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full min-h-[200px] items-center justify-center text-zinc-600 text-sm">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="text-xl font-semibold text-white">{product.title}</h3>
          <ul className="mt-4 space-y-2 text-sm text-zinc-400">
            {features.slice(0, 6).map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {(product.pros?.length > 0 || product.cons?.length > 0) && (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {product.pros?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold/90">Pros</p>
                <ul className="mt-2 space-y-1 text-sm text-zinc-400">
                  {product.pros.map((x, i) => <li key={i}>• {x}</li>)}
                </ul>
              </div>
            )}
            {product.cons?.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Cons</p>
                <ul className="mt-2 space-y-1 text-sm text-zinc-500">
                  {product.cons.map((x, i) => <li key={i}>• {x}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {product.affiliateLink ? (
          <motion.a
            href={product.affiliateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Button type="button">
              {product.affiliateLink.toLowerCase().includes("amazon") ? "Buy on Amazon" : "View Product"}
            </Button>
          </motion.a>
        ) : (
          <p className="mt-6 text-sm text-zinc-500">Purchase link coming soon</p>
        )}
      </div>
    </motion.div>
  );
}
