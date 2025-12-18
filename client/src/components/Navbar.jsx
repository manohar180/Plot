import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser, toggleTheme, isDarkMode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate('/')}>Chaitanya Developers</div>
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        
        {user ? (
          <>
            {user.role === 'MD' && (
              <>
                <Link to="/md-dashboard" className="nav-link">Dashboard</Link>
                {/* NEW LINK */}
                <Link to="/requests" className="nav-link">Requests</Link>
              </>
            )}
            
            {user.role === 'Agent' && <Link to="/agent-dashboard" className="nav-link">Agent Portal</Link>}
            
            <Link to="/settings" className="nav-link">Settings</Link>
            
            <button className="theme-toggle" onClick={toggleTheme}>
               {isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <button className="btn-secondary" style={{padding:'5px 15px', marginLeft:'10px'}} onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;