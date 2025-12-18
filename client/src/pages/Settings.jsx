import { useState } from 'react';
import API from '../api'; // <--- UPDATED IMPORT
import { useToast } from '../context/ToastContext';

const Settings = ({ user, toggleTheme, isDarkMode }) => {
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    currentPassword: '',
    newPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // UPDATED: Use API.put
      await API.put(`/auth/update-profile/${user.id}`, formData);
      
      addToast('Profile Updated Successfully', 'success');
      
      // Clear password fields for security
      setFormData({ ...formData, currentPassword: '', newPassword: '' });
      
      // Update local storage user data (optional, but good for UI consistency)
      const updatedUser = { ...user, name: formData.name, email: formData.email };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Update Failed';
      addToast(errMsg, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 className="section-title">Settings</h1>

      {/* THEME SETTINGS */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Appearance</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Dark Mode</span>
          <button className="btn" onClick={toggleTheme} style={{ background: isDarkMode ? '#333' : '#ddd', color: isDarkMode ? '#fff' : '#000' }}>
            {isDarkMode ? 'Turn Off' : 'Turn On'}
          </button>
        </div>
      </div>

      {/* PROFILE SETTINGS */}
      <div className="card">
        <h3>Edit Profile</h3>
        <form onSubmit={handleUpdateProfile}>
          <label>Full Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
          />

          <label>Email Address</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
          />

          <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '20px 0' }} />
          
          <h4 style={{ marginTop: 0 }}>Change Password</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Enter your current password to confirm changes. Leave "New Password" blank if you don't want to change it.
          </p>

          <label>Current Password (Required)</label>
          <input 
            type="password" 
            name="currentPassword" 
            value={formData.currentPassword} 
            onChange={handleChange} 
            required
            placeholder="Enter current password"
          />

          <label>New Password (Optional)</label>
          <input 
            type="password" 
            name="newPassword" 
            value={formData.newPassword} 
            onChange={handleChange} 
            placeholder="Enter new password"
          />

          <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }}>
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;