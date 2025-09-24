import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./features/auth/AuthContext";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
    <AuthProvider>
      <HashRouter>       {/* ✅ Wrap with HashRouter */}
        <App />
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>
);
