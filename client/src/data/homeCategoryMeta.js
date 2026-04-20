import { Cpu, Headphones, Smartphone, Laptop, Home, Tag } from "lucide-react";

/** Icon + accent for known category slugs (homepage + cards). */
export const HOME_CATEGORY_META = {
  "tech-gadgets": { Icon: Cpu, accent: "text-blue-400", bg: "bg-blue-400/10", border: "hover:border-blue-400/40" },
  "audio-sound": { Icon: Headphones, accent: "text-purple-400", bg: "bg-purple-400/10", border: "hover:border-purple-400/40" },
  smartphones: { Icon: Smartphone, accent: "text-emerald-400", bg: "bg-emerald-400/10", border: "hover:border-emerald-400/40" },
  "laptops-pcs": { Icon: Laptop, accent: "text-cyan-400", bg: "bg-cyan-400/10", border: "hover:border-cyan-400/40" },
  "home-office": { Icon: Home, accent: "text-amber-400", bg: "bg-amber-400/10", border: "hover:border-amber-400/40" },
  uncategorized: { Icon: Tag, accent: "text-zinc-400", bg: "bg-zinc-500/10", border: "hover:border-zinc-500/40" },
};

export function getHomeCategoryMeta(slug) {
  return (
    HOME_CATEGORY_META[slug] || {
      Icon: Tag,
      accent: "text-gold",
      bg: "bg-gold/10",
      border: "hover:border-gold/40",
    }
  );
}
