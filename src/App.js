import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";

function App() {
  // ✅ 1. Initialize user session state at the root level
  // This state will hold objects like { userId: 3, role: "SUPERVISOR", name: "Supervisor 3" }
  const [currentUser, setCurrentUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* 
          ✅ 2. Pass setCurrentUser to LoginPage 
          Inside LoginPage, after a successful API authentication response, 
          you will call: setCurrentUser(authenticatedUserObject);
        */}
        <Route 
          path="/login" 
          element={<LoginPage setCurrentUser={setCurrentUser} />} 
        />
        
        {/* 
          ✅ 3. Pass the currentUser object to HomePage
          Inside HomePage, you can now grab currentUser.userId and feed it directly
          into your <CreateTenant currentUserId={currentUser?.userId} /> prop mappings.
        */}
        <Route 
          path="/home" 
          element={<HomePage currentUser={currentUser} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;