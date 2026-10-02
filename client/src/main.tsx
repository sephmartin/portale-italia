import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

function normalizeLegacyRoutes() {
  if (typeof window === "undefined") return;

  const { pathname, search, hash } = window.location;

  // Handle legacy /brief and /brief#/ routes -> redirect to "/"
  if ((pathname === "/brief" || pathname === "/brief/") && !hash.startsWith("#/")) {
    const cleanHash = hash.startsWith("#/") ? "" : hash;
    window.history.replaceState(null, "", "/" + (search || "") + cleanHash);
    return;
  }

  // Handle legacy hash routing (#/ or #/route) while preserving non-routing anchor hashes (#come-funziona, #servizi, etc.)
  if (hash.startsWith("#/")) {
    const rawTarget = hash.slice(1);
    let cleanPath = rawTarget;
    let cleanSearch = search;
    if (rawTarget.includes("?")) {
      const [pathPart, queryPart] = rawTarget.split("?");
      cleanPath = pathPart;
      cleanSearch = queryPart ? `?${queryPart}` : search;
    }
    if (!cleanPath.startsWith("/")) {
      cleanPath = "/" + cleanPath;
    }
    window.history.replaceState(null, "", cleanPath + (cleanSearch || ""));
  }
}

// Initial client-side normalization on page load
normalizeLegacyRoutes();

// Listen for runtime hash changes that match old hash routes (#/...)
window.addEventListener("hashchange", () => {
  if (window.location.hash.startsWith("#/")) {
    normalizeLegacyRoutes();
    window.dispatchEvent(new Event("popstate"));
  }
});

createRoot(document.getElementById("root")!).render(<App />);
