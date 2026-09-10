import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    proxy: {
      // dev nicety: `vite` proxies /api to the local udara-api
      "/api": "http://localhost:8080",
    },
  },
});
