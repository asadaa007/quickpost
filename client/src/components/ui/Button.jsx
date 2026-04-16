import { motion } from "framer-motion";

export function Button({
  children,
  variant = "gold",
  className = "",
  type = "button",
  disabled,
  onClick,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  const variants = {
    gold: "bg-gradient-to-r from-gold to-amber-500 text-jet shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:from-amber-400 hover:to-yellow-400",
    ghost: "border border-zinc-700 text-zinc-200 hover:border-gold/50 hover:text-gold bg-surface/50",
    danger: "bg-red-900/80 text-red-100 hover:bg-red-800 border border-red-800",
  };
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ duration: 0.15 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
