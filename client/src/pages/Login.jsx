import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Ensure styles are loaded

const Login = ({ setUser }) => {
  // Toggle between 'MD' (Admin) and 'Agent'
  const [activeTab, setActiveTab] = useState('MD'); 
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Determine URL based on action
    // If Registering, use register API. 
    // If Logging in, use login API.
    const url = isRegistering 
      ? 'http://localhost:5000/api/auth/register' 
      : 'http://localhost:5000/api/auth/login';

    try {
      const res = await axios.post(url, formData);

      if (isRegistering) {
        setMessage('Registration successful! Please wait for Admin approval.');
        setIsRegistering(false); // Switch back to login view
      } else {
        // LOGIN LOGIC
        const userData = res.data.user;

        // Security Check: Prevent Agent from logging in via Admin Tab
        if (activeTab === 'MD' && userData.role !== 'MD') {
          setError("Access Denied: You are not an Admin.");
          return;
        }
        // Security Check: Prevent Admin from logging in via Agent Tab (Optional, but good UX)
        if (activeTab === 'Agent' && userData.role !== 'Agent') {
           setError("Please use the Admin Login tab.");
           return;
        }

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        if (userData.role === 'MD') navigate('/md-dashboard');
        else navigate('/agent-dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Credentials or Server Error');
    }
  };

  return (
    <div className="form-container">
      {/* 1. THE TABS */}
      <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <div 
          onClick={() => { setActiveTab('MD'); setIsRegistering(false); setError(''); }}
          style={{
            flex: 1, padding: '15px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold',
            borderBottom: activeTab === 'MD' ? '3px solid #1b4332' : 'none',
            color: activeTab === 'MD' ? '#1b4332' : '#888'
          }}
        >
          Admin Login
        </div>
        <div 
          onClick={() => { setActiveTab('Agent'); setError(''); }}
          style={{
            flex: 1, padding: '15px', textAlign: 'center', cursor: 'pointer', fontWeight: 'bold',
            borderBottom: activeTab === 'Agent' ? '3px solid #1b4332' : 'none',
            color: activeTab === 'Agent' ? '#1b4332' : '#888'
          }}
        >
          Agent Login
        </div>
      </div>

      {/* 2. HEADER */}
      <h2 style={{ textAlign: 'center', color: '#1b4332' }}>
        {activeTab === 'MD' ? 'Managing Director' : (isRegistering ? 'New Agent Registration' : 'Agent Portal')}
      </h2>

      {error && <p style={{ background: '#ffe6e6', color: 'red', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{error}</p>}
      {message && <p style={{ background: '#e6fffa', color: 'green', padding: '10px', borderRadius: '4px', textAlign: 'center' }}>{message}</p>}

      {/* 3. THE FORM */}
      <form onSubmit={handleSubmit}>
        
        {/* Only show Name field if Registering as Agent */}
        {isRegistering && activeTab === 'Agent' && (
          <>
            <label>Full Name</label>
            <input name="name" type="text" placeholder="Enter your full name" onChange={handleChange} required />
          </>
        )}

        <label>Email Address</label>
        <input name="email" type="email" placeholder={activeTab === 'MD' ? "admin@chaitanya.com" : "agent@example.com"} onChange={handleChange} required />

        <label>Password</label>
        <input name="password" type="password" placeholder="••••••••" onChange={handleChange} required />

        <button type="submit" className="btn" style={{ marginTop: '10px' }}>
          {isRegistering ? 'Submit Application' : `Login as ${activeTab}`}
        </button>
      </form>

      {/* 4. FOOTER (Agent Only) */}
      {activeTab === 'Agent' && (
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          {isRegistering ? "Already have an account?" : "Want to join our team?"} 
          <span 
            style={{ color: '#1b4332', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline' }}
            onClick={() => { setIsRegistering(!isRegistering); setError(''); setMessage(''); }}
          >
            {isRegistering ? "Login Here" : "Register Here"}
          </span>
        </p>
      )}
    </div>
  );
};

export default Login;