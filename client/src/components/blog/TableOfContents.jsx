import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";

export default function TableOfContents({ items }) {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    if (!items?.length) return;
    const ids = items.map((t) => t.id).filter(Boolean);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: [0, 0.25, 0.5, 1] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [items]);

  if (!items?.length) return null;

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-5 backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
        <ListTree className="h-4 w-4 text-gold" />
        On this page
      </div>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "ml-3" : ""}>
            <a
              href={`#${item.id}`}
              className={`block rounded-lg px-2 py-1.5 transition-colors ${
                activeId === item.id ? "bg-gold/15 text-gold" : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
