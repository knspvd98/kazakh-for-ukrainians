import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.BASE_PATH || "/kazakh-for-ukrainians/",
  plugins: [react()],
  build: {
    target: "es2020",
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
          if (id.includes("/src/data/lessons") || id.includes("/src/data/lessonLanguageLabs")) {
            return "lesson-content";
          }
          if (id.includes("/src/data/exercises") || id.includes("/src/data/reviewDeck")) {
            return "practice-content";
          }
          if (
            id.includes("/src/data/grammar")
            || id.includes("/src/data/endingTables")
            || id.includes("/src/data/vocabulary")
            || id.includes("/src/data/phrases")
          ) {
            return "reference-content";
          }
        }
      }
    }
  }
});
