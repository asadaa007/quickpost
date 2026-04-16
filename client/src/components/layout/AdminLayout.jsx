import { useState } from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Tag,
  Globe,
  Menu,
  X,
  PenLine,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const NAV = [
  { to: "/dev-post", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dev-post/posts", label: "Posts", icon: FileText },
  { to: "/dev-post/create", label: "New Post", icon: PenLine },
  { to: "/dev-post/categories", label: "Categories", icon: Tag },
];

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
      isActive
        ? "bg-gold/10 text-gold border border-gold/20"
        : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-100 border border-transparent"
    }`;

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-5">
        <Link to="/dev-post" className="flex items-center gap-2" onClick={onClose}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-amber-500 text-xs font-bold text-jet">
            QP
          </span>
          <div>
            <p className="text-sm font-bold text-white leading-none">QuickPost</p>
            <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-widest">Admin Panel</p>
          </div>
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
          Content
        </p>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={onClose}>
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-zinc-800 px-3 py-4 space-y-1">
        {user && (
          <div className="mb-2 rounded-xl bg-zinc-800/40 px-3 py-2">
            <p className="text-xs font-medium text-zinc-300 truncate">{user.email}</p>
            <p className="text-[10px] text-zinc-600 capitalize">{user.role}</p>
          </div>
        )}
        <Link
          to="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800/60 hover:text-zinc-100"
          onClick={onClose}
        >
          <Globe className="h-4 w-4 shrink-0" />
          View public site
        </Link>
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-zinc-500 transition hover:bg-red-950/40 hover:text-red-400"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-zinc-800/80 bg-[#0d0d0d] md:flex md:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-zinc-800 bg-[#0d0d0d]">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-zinc-800/80 bg-[#0d0d0d] px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-400 hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
            Menu
          </button>
          <span className="text-sm font-bold text-white">
            <span className="text-gold">Quick</span>Post Admin
          </span>
          <Link
            to="/"
            target="_blank"
            className="rounded-xl border border-zinc-800 p-2 text-zinc-400 hover:text-gold"
            aria-label="View site"
          >
            <Globe className="h-4 w-4" />
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
