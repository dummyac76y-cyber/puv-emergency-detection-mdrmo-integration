import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import bundleAnalyzer from "vite-bundle-analyzer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    bundleAnalyzer({
      openAnalyzer: false,
      analyzerMode: 'static',
      defaultSizes: 'gzip',
      fileName: "bundle-analysis.html",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/pages": path.resolve(__dirname, "./src/pages"),
      "@/store": path.resolve(__dirname, "./src/store"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/types": path.resolve(__dirname, "./src/types"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/theme": path.resolve(__dirname, "./src/theme"),
      "@/test": path.resolve(__dirname, "./src/test"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3001,
    strictPort: true,
    hmr: {
      port: 3001,
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          leaflet: ["leaflet", "react-leaflet"],
          charts: ["recharts"],
          motion: ["framer-motion"],
          dnd: ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
  },
});