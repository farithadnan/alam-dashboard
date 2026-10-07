import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  build: { outDir: "dist", emptyOutDir: true },
  server: {
    proxy: { "/api": "http://localhost:8788" },
    // dev/preview: fastify'd tunnels (trycloudflare.com, *.pages.dev) send a foreign Host header
    allowedHosts: true,
  },
});
