import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tanstackStart({
      // Mode SPA statique : génère un shell HTML + JS/CSS pur, déployable
      // sur OVHcloud Starter (aucun serveur Node requis à l'exécution).
      // Aucune fonction serveur (createServerFn) n'est utilisée dans ce projet,
      // donc ce mode ne fait perdre aucune fonctionnalité.
      spa: { enabled: true },
    }),
    react(),
    tailwindcss(),
  ],
});