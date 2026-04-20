import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";
import { register as registerRequest } from "../../services/auth";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";

export function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerRequest({ email, password });
      login(res.token, res.user);
      toast.success("Admin account created!");
      navigate("/dev-post", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Create Admin — QuickPost</title></Helmet>
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
            <h1 className="text-2xl font-bold text-white">Create Admin Account</h1>
            <p className="mt-1 text-sm text-zinc-500">First-time setup only</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#0d0d0d] p-8 shadow-2xl shadow-black/60">
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 transition focus:border-gold/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full justify-center">
                <UserPlus className="h-4 w-4" />
                {loading ? "Creating…" : "Create account"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-600">
            Already have an account?{" "}
            <Link to="/dev-post/login" className="text-gold hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
