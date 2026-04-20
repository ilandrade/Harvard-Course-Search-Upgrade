import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ConcentrationSelectPage from "./pages/ConcentrationSelectPage";
import MainAppPage from "./pages/MainAppPage";
import { useApp } from "./context/AppContext";

export default function App() {
  const { primaryConcs } = useApp();
  const hasConc = primaryConcs.length > 0;

  return (
    <Routes>
      <Route path="/concentration" element={<ConcentrationSelectPage />} />
      <Route
        path="/app"
        element={hasConc ? <MainAppPage /> : <Navigate to="/concentration" replace />}
      />
      <Route
        path="*"
        element={<Navigate to={hasConc ? "/app" : "/concentration"} replace />}
      />
    </Routes>
  );
}
