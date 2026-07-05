import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage"; // 💡 Import the new landing presentation page
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 💡 Public Landing Page serves as your default root entry view */}
        <Route path="/" element={<LandingPage />} />
        
        {/* 💡 Login form view reached from the landing page actions */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 💡 Secure operational dashboard environment panel */}
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;