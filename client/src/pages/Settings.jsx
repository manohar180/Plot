import { useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const Settings = ({ user, toggleTheme, isDarkMode }) => {
  const { addToast } = useToast();
  
  const [profileData, setProfileData] = useState({ 
    name: user?.name || '', 
    email: user?.email || '',
    currentPassword: '',
    newPassword: ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/auth/update-profile/${user.id}`, profileData);
      addToast('Profile Updated Successfully!', 'success');
      // Clear sensitive fields
      setProfileData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (err) {
      addToast(err.response?.data?.message || 'Update Failed', 'error');
    }
  };

  return (
    <div style={{maxWidth: '600px', margin: '0 auto'}}>
      <h1 className="section-title">Settings</h1>

      {/* THEME */}
      <div className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <span>Dark Mode</span>
        <button onClick={toggleTheme} className="btn" style={{background: isDarkMode ? '#f59e0b' : '#374151'}}>
          {isDarkMode ? 'Turn Off' : 'Turn On'}
        </button>
      </div>

      {/* PROFILE FORM */}
      <div className="card">
        <h3>👤 Update Profile</h3>
        <form onSubmit={handleUpdate} style={{marginTop:'20px'}}>
          <label>Full Name</label>
          <input value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} />
          
          <label>Email Address</label>
          <input type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />

          <hr style={{margin:'20px 0', borderColor:'var(--border)'}} />
          
          <label>New Password (Leave blank to keep current)</label>
          <input type="password" placeholder="New Password" value={profileData.newPassword} onChange={e => setProfileData({...profileData, newPassword: e.target.value})} />
          
          <label>Current Password (Required to save changes)</label>
          <input type="password" required placeholder="Verify Identity" value={profileData.currentPassword} onChange={e => setProfileData({...profileData, currentPassword: e.target.value})} />

          <button type="submit" className="btn" style={{width:'100%'}}>Save Changes</button>
        </form>
      </div>
    </div>
  );
};

export default Settings;