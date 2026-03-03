import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1e2130',
            color: '#f1f5f9',
            border: '1px solid #2a2d3e',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: 'Outfit, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#1e2130' },
            style: {
              border: '1px solid rgba(16,185,129,0.3)',
            },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#1e2130' },
            style: {
              border: '1px solid rgba(239,68,68,0.3)',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);