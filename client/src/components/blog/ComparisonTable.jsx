import { motion } from "framer-motion";

export default function ComparisonTable({ products }) {
  if (!products?.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="mt-12 rounded-3xl border border-zinc-800/90 bg-zinc-900/40 p-6 md:p-8"
    >
      <h2 className="text-lg font-semibold text-white md:text-xl">Product comparison</h2>
      <p className="mt-1 text-sm text-zinc-500">Side-by-side snapshot of the picks in this guide.</p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-800/80">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80">
              <th className="px-4 py-3 font-semibold text-zinc-300">Product</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Price</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Rating</th>
              <th className="px-4 py-3 font-semibold text-zinc-300">Key feature</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/50">
                <td className="px-4 py-3 font-medium text-white">{p.title || "—"}</td>
                <td className="px-4 py-3 text-zinc-300">{p.price || "—"}</td>
                <td className="px-4 py-3 text-zinc-300">
                  {p.rating != null && p.rating !== "" ? Number(p.rating).toFixed(1) : "—"}
                </td>
                <td className="px-4 py-3 text-zinc-400">{p.features?.[0] || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
