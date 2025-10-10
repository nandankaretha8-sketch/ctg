import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import webPushService from "./services/webPushService.js";

// Disable console logs in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.trace = () => {};
  console.table = () => {};
  console.group = () => {};
  console.groupEnd = () => {};
  console.groupCollapsed = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
  console.count = () => {};
  console.assert = () => {};
}

// Register Service Worker for caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => {
        // Service worker registered successfully
      })
      .catch(() => {
        // Service worker registration failed
      });
  });
}

// Initialize push notifications on page load
if (webPushService.isSupported()) {
  window.addEventListener('load', () => {
    setTimeout(async () => {
      try {
        await webPushService.initialize();
      } catch (error) {
        // Push notification initialization error
      }
    }, 1000);
  });
}

createRoot(document.getElementById("root")!).render(<App />);