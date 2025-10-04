import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Enable MSW in development
async function enableMocking() {
  if (import.meta.env.DEV) {
    try {
      const { worker } = await import('./mocks/browser');
      return worker.start({
        onUnhandledRequest: 'bypass',
      });
    } catch (error) {
      console.warn('Failed to start MSW:', error);
    }
  }
}

enableMocking()
  .catch(error => {
    console.warn('MSW initialization failed:', error);
  })
  .finally(() => {
    createRoot(document.getElementById("root")!).render(<App />);
  });
