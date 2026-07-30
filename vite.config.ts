import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.BASE_PATH || "/courseforalina/",
  plugins: [react()],
  build: {
    target: "es2020",
    sourcemap: false
  }
});
