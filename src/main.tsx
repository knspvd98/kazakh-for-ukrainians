import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./styles/tokens.css";
import "./styles/layout.css";
import "./styles/lesson.css";
import "./styles/reference.css";
import "./styles/practice.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(import.meta.env.BASE_URL+"sw.js").catch(()=>{});
  });
}
