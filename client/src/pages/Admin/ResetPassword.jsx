import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Shield, Eye, EyeOff } from "lucide-react";
import { resetPassword as resetPasswordRequest } from "../../services/auth";
import { Button } from "../../components/ui/Button";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get("token") || "";
    const e = searchParams.get("email") || "";
    setToken(t);
    setEmail(e);
    if (!t || !e) {
      toast.error("Missing token or email. Use the link from your reset email or server logs.");
    }
  }, [searchParams]);

  const submit = async (ev) => {
    ev.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await resetPasswordRequest({ email, token, newPassword });
      toast.success(res?.message || "Password updated");
      navigate("/dev-post/login", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Set new password — QuickPost</title></Helmet>
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.07),_transparent_60%)]" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative w-full max-w-sm"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-amber-500 text-lg font-bold text-jet shadow-lg shadow-gold/25">
              QP
            </div>
            <h1 className="text-2xl font-bold text-white">Set new password</h1>
            <p className="mt-1 text-sm text-zinc-500">Choose a strong password (8+ characters)</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-8 shadow-2xl shadow-black/60">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Email</label>
                <input
                  type="email"
                  required
                  readOnly={Boolean(searchParams.get("email"))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 read-only:opacity-80"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">New password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 pr-11 text-sm text-zinc-100 transition focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Confirm password</label>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 transition focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading || !token} className="w-full justify-center">
                <Shield className="h-4 w-4" />
                {loading ? "Saving…" : "Update password"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            <Link to="/dev-post/login" className="text-gold hover:underline">
              Back to sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
