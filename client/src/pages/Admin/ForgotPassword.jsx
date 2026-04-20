import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { KeyRound, ArrowLeft } from "lucide-react";
import { forgotPassword as forgotPasswordRequest } from "../../services/auth";
import { Button } from "../../components/ui/Button";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetUrl("");
    try {
      const res = await forgotPasswordRequest({ email });
      if (res?.resetUrl) {
        setResetUrl(res.resetUrl);
        toast.success("Reset link is shown below (dev mode).");
      } else {
        toast.success(
          "If that email is registered: check your inbox, or open your API server deploy logs for the reset link (when email is not configured).",
          { duration: 9000 }
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Reset password — QuickPost</title></Helmet>
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
            <h1 className="text-2xl font-bold text-white">Forgot password</h1>
            <p className="mt-1 text-sm text-zinc-500">
              We will email a reset link if <code className="text-zinc-400">RESEND_API_KEY</code> is set;
              otherwise check your API server logs for the link.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-8 shadow-2xl shadow-black/60">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-zinc-300">Admin email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full justify-center">
                <KeyRound className="h-4 w-4" />
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>

            {resetUrl ? (
              <div className="mt-5 rounded-xl border border-gold/30 bg-gold/5 p-3">
                <p className="mb-2 text-xs font-medium text-gold">Reset link (dev — copy now)</p>
                <input
                  readOnly
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-[11px] text-zinc-300"
                  value={resetUrl}
                  onFocus={(e) => e.target.select()}
                />
              </div>
            ) : null}
          </div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            <Link to="/dev-post/login" className="inline-flex items-center gap-1 text-gold hover:underline">
              <ArrowLeft className="h-3 w-3" />
              Back to sign in
            </Link>
            <span className="mx-2 text-zinc-700">·</span>
            <Link to="/dev-post/register" className="text-zinc-500 hover:text-gold hover:underline">
              First-time setup
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
