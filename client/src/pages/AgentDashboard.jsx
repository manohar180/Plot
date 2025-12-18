import { useEffect, useState } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const AgentDashboard = ({ user }) => {
  const { addToast } = useToast();
  
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [plots, setPlots] = useState([]);
  const [selectedPlot, setSelectedPlot] = useState(null);
  
  const [formData, setFormData] = useState({ status: 'Booked', customerName: '', customerMobile: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/projects').then(res => setProjects(res.data));
  }, []);

  const handleProjectSelect = async (projectId) => {
    setSelectedProject(projectId);
    try {
      const res = await axios.get(`http://localhost:5000/api/projects/${projectId}/plots`);
      setPlots(res.data);
      setSelectedPlot(null); 
    } catch (err) { console.error(err); }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/requests', {
        agentId: user.id,
        agentName: user.name,
        projectId: selectedProject,
        plotId: selectedPlot._id,
        requestedStatus: formData.status,
        customerName: formData.customerName,
        customerMobile: formData.customerMobile // Optional
      });
      
      addToast('Request Sent Successfully!', 'success');
      setSelectedPlot(null); 
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error sending request';
      addToast(errMsg, 'error');
    }
  };

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1>Agent Portal</h1>
        <p style={{color:'var(--text-muted)'}}>Welcome, {user.name}</p>
      </div>

      {/* VIEW 1: PROJECT LIST */}
      {!selectedProject && (
        <div className="card-grid">
          {projects.map(p => (
            <div key={p._id} className="card" onClick={() => handleProjectSelect(p._id)} style={{ cursor: 'pointer' }}>
              <h3>{p.name}</h3>
              <p>{p.location}</p>
              <p>{p.totalPlots} Plots</p>
              <button className="btn" style={{ marginTop: '10px' }}>Select Project</button>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: PLOT GRID */}
      {selectedProject && (
        <div>
          <button className="btn btn-secondary" onClick={() => setSelectedProject(null)} style={{ width: 'auto', marginBottom: '20px' }}>
            &larr; Back to Projects
          </button>
          
          <div className="card">
            <h3>Select a Plot to Book</h3>
            <div className="plot-grid">
              {plots.map(plot => (
                <div 
                  key={plot._id} 
                  className={`plot-box status-${plot.status}`}
                  onClick={() => setSelectedPlot(plot)}
                >
                  {plot.plotNumber}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPDATE REQUEST */}
      {selectedPlot && (
        <div className="modal-overlay" onClick={() => setSelectedPlot(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop:0}}>Request Update for Plot {selectedPlot.plotNumber}</h3>
            <p>Current Status: <strong className={`status-${selectedPlot.status}`} style={{padding:'2px 8px', borderRadius:'4px', color:'white'}}>{selectedPlot.status}</strong></p>
            
            <form onSubmit={handleSubmitRequest}>
              <label>Requested Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Sold">Sold</option>
              </select>

              <label>Customer Name</label>
              <input 
                type="text" 
                required 
                placeholder="Enter Name"
                value={formData.customerName}
                onChange={e => setFormData({ ...formData, customerName: e.target.value })} 
              />

              <label>Customer Mobile (Optional)</label>
              <input 
                type="text" 
                placeholder="Enter Mobile Number"
                value={formData.customerMobile}
                onChange={e => setFormData({ ...formData, customerMobile: e.target.value })} 
              />

              <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
                <button type="submit" className="btn">Send Request</button>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedPlot(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;