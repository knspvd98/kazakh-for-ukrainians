import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// @ts-expect-error local Node middleware is plain ESM
import { createTtsApiMiddleware } from "./server/ttsMiddleware.mjs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "kazakh-tts-api",
      configureServer(server) {
        server.middlewares.use("/api/tts", createTtsApiMiddleware());
      }
    }
  ],
  build: {
    target: "es2020"
  }
});
