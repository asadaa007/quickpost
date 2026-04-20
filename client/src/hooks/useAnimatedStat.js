import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";

/** Count-up when scrolled into view (lightweight, stops on unmount). */
export function useAnimatedStat(target, { duration = 1.05 } = {}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-24px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, duration]);

  return { ref, value };
}
