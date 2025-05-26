import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
    },
    historyApiFallback: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
})

