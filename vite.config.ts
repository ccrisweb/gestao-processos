import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/gestao_processos/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize bundle
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
        },
      },
    },
    // Reduce chunk size warnings
    chunkSizeWarningLimit: 600,
    // Optimize for production
    minify: "terser",
    // Improve caching
    sourcemap: false,
    cssCodeSplit: true,
  },
  server: {
    // Improve dev server performance
    middlewareMode: false,
    // Prevent keep-alive from hanging
    hmr: {
      host: "localhost",
      port: 5173,
      protocol: "ws",
    },
    // Optimize file watching
    watch: {
      usePolling: false,
    },
    // Disable caching in dev
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  },
});
