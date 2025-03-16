import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Dashboard';  // ✅ Dashboard Component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>🚀 Welcome to DecentraVault!</h1>} />
        <Route path="/dashboard" element={<Dashboard />} />  {/* ✅ Dashboard Route */}
      </Routes>
    </Router>
  );
}

export default App;
