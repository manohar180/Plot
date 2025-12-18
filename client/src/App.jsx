import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import Components
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Home from './pages/Home';
import MDDashboard from './pages/MDDashboard';
import AgentDashboard from './pages/AgentDashboard';
import ProjectDetails from './pages/ProjectDetails';
import Settings from './pages/Settings';
import Requests from './pages/Requests';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  
  // DARK MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    // 1. Load User
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 2. Apply Theme
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.body.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <BrowserRouter>
      <Navbar 
        user={user} 
        setUser={setUser} 
        toggleTheme={toggleTheme} 
        isDarkMode={isDarkMode} 
      />
      
      <div className="container">
        <Routes>
          {/* --- SECURED HOME PAGE --- */}
          <Route 
            path="/" 
            element={user ? <Home user={user} /> : <Navigate to="/login" />} 
          />
          
          {/* --- LOGIN PAGE --- */}
          <Route 
            path="/login" 
            element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} 
          />
          
          {/* --- PROTECTED ROUTES --- */}
          <Route 
            path="/md-dashboard" 
            element={user?.role === 'MD' ? <MDDashboard /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/requests" 
            element={user?.role === 'MD' ? <Requests /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/agent-dashboard" 
            element={user?.role === 'Agent' ? <AgentDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/project/:id" 
            element={user ? <ProjectDetails user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/settings" 
            element={user ? <Settings user={user} toggleTheme={toggleTheme} isDarkMode={isDarkMode} /> : <Navigate to="/login" />} 
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;