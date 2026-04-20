import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { LogIn, Eye, EyeOff } from "lucide-react";
import { login as loginRequest } from "../../services/auth";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("reason") === "expired") {
      toast.error("Your session expired. Please sign in again.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginRequest({ email, password });
      login(res.token, res.user);
      toast.success("Welcome back!");
      navigate("/dev-post", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Admin Login — QuickPost</title></Helmet>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
        {/* Gold radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.07),_transparent_60%)]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-full max-w-sm"
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-amber-500 text-lg font-bold text-jet shadow-lg shadow-gold/25">
              QP
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <p className="mt-1 text-sm text-zinc-500">Sign in to manage QuickPost</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-8 shadow-2xl shadow-black/60">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 pr-11 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full justify-center">
                <LogIn className="h-4 w-4" />
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm">
            <Link to="/dev-post/forgot-password" className="font-medium text-gold hover:underline">
              Forgot password?
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-zinc-600">
            New site, first admin only?{" "}
            <Link to="/dev-post/register" className="text-zinc-500 underline decoration-zinc-700 hover:text-gold">
              Create admin account
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
