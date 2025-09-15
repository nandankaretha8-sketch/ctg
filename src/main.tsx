import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import webPushService from "./services/webPushService.js";

// Initialize push notifications on page load
if (webPushService.isSupported()) {
  // Wait for page to load, then initialize push notifications
  window.addEventListener('load', () => {
    setTimeout(async () => {
      try {
        await webPushService.initialize();
        console.log('✅ Push notifications initialized on page load');
      } catch (error) {
        console.log('ℹ️ Push notifications will be available when user grants permission');
      }
    }, 1000);
  });
}

createRoot(document.getElementById("root")!).render(<App />);
