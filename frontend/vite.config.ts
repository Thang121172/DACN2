import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,                    // hoặc 5174 tùy bạn
    proxy: {
      "/api": {
        target: "http://localhost:8000",  // Django
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
