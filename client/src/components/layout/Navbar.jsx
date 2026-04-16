import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Info, Menu, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../ui/Modal";
import { api } from "../../api/client";

const STORAGE_KEY = "quickpost-topview-notice";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/categories", label: "Categories" },
];

export function Navbar() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [topPost, setTopPost] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
    if (searchOpen) setSearchOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Close search on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/posts/stats/top-viewed");
        if (cancelled) return;
        const data = res.data;
        setTopPost(data);
        if (data?.title && !sessionStorage.getItem(STORAGE_KEY)) {
          sessionStorage.setItem(STORAGE_KEY, "1");
          setInfoOpen(true);
        }
      } catch {
        if (!cancelled) setTopPost(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-gold ${isActive ? "text-gold" : "text-zinc-300"}`;

  const mobileLinkClass = ({ isActive }) =>
    `block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-zinc-800/60 hover:text-gold ${
      isActive ? "text-gold bg-zinc-800/40" : "text-zinc-300"
    }`;

  return (
    <>
      <motion.header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors duration-300 ${
          scrolled
            ? "border-zinc-800/90 bg-jet/95 shadow-lg shadow-black/30"
            : "border-zinc-800/50 bg-jet/70"
        }`}
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          {/* Logo */}
          <Link to="/" className="shrink-0 text-xl font-bold tracking-tight text-white">
            <span className="bg-gradient-to-r from-gold to-amber-400 bg-clip-text text-transparent">Quick</span>Post
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>{l.label}</NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen((o) => !o)}
              className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
                searchOpen
                  ? "border-gold/50 bg-gold/5 text-gold"
                  : "border-zinc-800 text-zinc-300 hover:border-gold/50 hover:text-gold"
              }`}
              aria-label="Search"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setInfoOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-800 text-zinc-300 transition hover:border-gold/50 hover:text-gold"
              aria-label="Trending post"
            >
              <Info className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-800 text-zinc-300 transition hover:border-gold/50 hover:text-gold md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden border-t border-zinc-800/60"
            >
              <form onSubmit={handleSearch} className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 md:px-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search posts, topics, tags…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2.5 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-gold to-amber-500 px-4 py-2.5 text-sm font-medium text-jet transition hover:from-amber-400 hover:to-yellow-400"
                >
                  Search
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile dropdown menu */}
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-800/80 bg-jet/95 px-4 pb-4 pt-2 md:hidden"
          >
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={mobileLinkClass}>{l.label}</NavLink>
            ))}
          </motion.nav>
        )}
      </motion.header>

      <Modal open={infoOpen} onClose={() => setInfoOpen(false)} title="Trending on QuickPost">
        {topPost ? (
          <p>
            Our most-read article right now is{" "}
            <Link to={`/post/${topPost.slug}`} className="font-medium text-gold underline-offset-2 hover:underline" onClick={() => setInfoOpen(false)}>
              {topPost.title}
            </Link>. Tap the title to open it.
          </p>
        ) : (
          <p>Posts are ranked by reads. Create content in the admin panel — your next top story could be live in minutes.</p>
        )}
      </Modal>
    </>
  );
}
