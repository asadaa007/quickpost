import { motion } from "framer-motion";

export function ScrollReveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
}) {
  const offset = { up: [20, 0], down: [-20, 0], left: [0, 0], right: [0, 0] };
  const x = direction === "left" ? [30, 0] : direction === "right" ? [-30, 0] : [0, 0];
  const [yFrom, yTo] = offset[direction] || offset.up;

  return (
    <motion.div
      initial={{ opacity: 0, y: yFrom, x: x[0] }}
      whileInView={{ opacity: 1, y: yTo, x: x[1] }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
