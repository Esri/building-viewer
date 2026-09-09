import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [],
  server: {
    open: true,
  },
  build: {
    outDir: "dist",
  },
});
