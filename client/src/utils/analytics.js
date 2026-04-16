import ReactGA from "react-ga4";

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let initialized = false;

export function initGA() {
  if (!MEASUREMENT_ID || initialized) return;
  ReactGA.initialize(MEASUREMENT_ID);
  initialized = true;
}

export function trackPage(path) {
  if (!initialized) return;
  ReactGA.send({ hitType: "pageview", page: path });
}
