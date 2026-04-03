import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({

  server: {
    host: true,
    port: 8080,

    // ✅ allow ngrok domains
    allowedHosts: [
      ".ngrok-free.dev",
      ".ngrok.app",
      "localhost",
      "127.0.0.1"
    ],

    // 🔥🔥 MOST IMPORTANT FIX (PROXY)
    proxy: {
      "/api": {
        target: "http://localhost:8000", // Django backend
        changeOrigin: true,
        secure: false,
      },
      "/media": {
        target: "http://localhost:8000", // Django media files
        changeOrigin: true,
        secure: false,
      },
    },

    hmr: {
      overlay: false,
    },
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

}));