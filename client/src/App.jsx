import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppRoutes } from "./routes/AppRoutes";
import { initGA, trackPage } from "./utils/analytics";

initGA();

function GATracker() {
  const location = useLocation();
  useEffect(() => {
    trackPage(location.pathname + location.search);
  }, [location]);
  return null;
}

function App() {
  return (
    <>
      <GATracker />
      <AppRoutes />
    </>
  );
}

export default App;
