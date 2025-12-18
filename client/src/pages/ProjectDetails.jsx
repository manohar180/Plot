import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api'; // <--- IMPORT HELPER
import { useToast } from '../context/ToastContext';

const ProjectDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [project, setProject] = useState(null);
  const [plots, setPlots] = useState([]);
  const [agents, setAgents] = useState([]);
  
  // Selection & Modals
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false); 
  const [manageCount, setManageCount] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAgent, setFilterAgent] = useState('All');

  // Edit Form State
  const [formData, setFormData] = useState({ status: '', customerName: '', customerMobile: '', soldBy: '' });

  useEffect(() => {
    fetchData();
    if(user.role === 'MD') fetchAgents();
  }, [id]);

  const fetchData = async () => {
    try {
      const pRes = await API.get('/projects');
      setProject(pRes.data.find(p => p._id === id));
      const plRes = await API.get(`/projects/${id}/plots`);
      setPlots(plRes.data);
    } catch(err) { console.error(err); }
  };

  const fetchAgents = async () => {
    const res = await API.get('/auth/active-agents');
    setAgents(res.data);
  };

  // --- ACTIONS ---
  const handleBulkAdd = async () => {
    try {
      await API.post('/plots/bulk-add', { projectId: id, count: manageCount });
      addToast(`Added ${manageCount} Plots`, 'success');
      setShowManageModal(false);
      fetchData();
    } catch(err) { addToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handleBulkDelete = async () => {
    if(!window.confirm(`Are you sure you want to delete the LAST ${manageCount} plots?`)) return;
    try {
      await API.delete('/plots/bulk-delete', { data: { projectId: id, count: manageCount } });
      addToast(`Deleted ${manageCount} Plots`, 'success');
      setShowManageModal(false);
      fetchData();
    } catch(err) { addToast(err.response?.data?.message || 'Failed', 'error'); }
  };

  const handlePlotClick = (plot) => {
    setSelectedPlot(plot);
    setFormData({
      status: plot.status,
      customerName: plot.customerName || '',
      customerMobile: plot.customerMobile || '',
      soldBy: plot.soldBy || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/plots/${selectedPlot._id}`, formData);
      addToast('Plot Updated Successfully!', 'success');
      setSelectedPlot(null);
      fetchData(); 
    } catch (err) { addToast('Update Failed', 'error'); }
  };

  const handleDeleteSingle = async () => {
    if(!window.confirm("Delete this specific plot?")) return;
    try {
        await API.delete(`/plots/${selectedPlot._id}`);
        addToast('Plot Deleted', 'success');
        setSelectedPlot(null);
        fetchData();
    } catch(err) { addToast('Delete Failed', 'error'); }
  };

  // --- FILTERING ---
  const filteredPlots = useMemo(() => {
    return plots.filter(plot => {
      const matchSearch = plot.plotNumber.toString().includes(search) || 
        (plot.customerName && plot.customerName.toLowerCase().includes(search.toLowerCase()));
      const matchStatus = filterStatus === 'All' || plot.status === filterStatus;
      const matchAgent = filterAgent === 'All' || (plot.soldBy === filterAgent);
      return matchSearch && matchStatus && matchAgent;
    });
  }, [plots, search, filterStatus, filterAgent]);

  if (!project) return <div>Loading...</div>;

  return (
    <div>
      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px'}}>
        <div>
           <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{marginBottom:'10px'}}>Back</button>
           <h1 style={{marginBottom:0}}>{project.name}</h1>
           <span style={{color:'var(--text-muted)'}}>{project.location} • {plots.length} Total Plots</span>
        </div>
        
        {user.role === 'MD' && (
          <button className="btn" onClick={() => setShowManageModal(true)}>⚙️ Add / Delete Plots</button>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="card" style={{marginTop:'20px', padding:'15px', display:'flex', gap:'15px', flexWrap:'wrap', alignItems:'center'}}>
         <div style={{flex: 1, minWidth:'200px'}}>
            <label style={{fontSize:'0.85rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Search</label>
            <input placeholder="Plot No. or Customer" value={search} onChange={e => setSearch(e.target.value)} style={{margin:0}} />
         </div>
         <div style={{flex: 1, minWidth:'150px'}}>
            <label style={{fontSize:'0.85rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Filter Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{margin:0}}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Sold">Sold</option>
            </select>
         </div>
         <div style={{flex: 1, minWidth:'150px'}}>
            <label style={{fontSize:'0.85rem', fontWeight:'bold', display:'block', marginBottom:'5px'}}>Filter Agent</label>
            <select value={filterAgent} onChange={e => setFilterAgent(e.target.value)} style={{margin:0}}>
              <option value="All">All Agents</option>
              {agents.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
            </select>
         </div>
         <div style={{marginTop:'20px', fontWeight:'bold', color:'var(--primary)'}}>
            {filteredPlots.length} Results
         </div>
      </div>

      {/* PLOT GRID */}
      <div style={{display:'flex', gap:'15px', margin:'20px 0'}}>
        <span style={{display:'flex', alignItems:'center'}}><div style={{width:15, height:15, background:'#10b981', marginRight:5, borderRadius:3}}></div> Available</span>
        <span style={{display:'flex', alignItems:'center'}}><div style={{width:15, height:15, background:'#f59e0b', marginRight:5, borderRadius:3}}></div> Booked</span>
        <span style={{display:'flex', alignItems:'center'}}><div style={{width:15, height:15, background:'#ef4444', marginRight:5, borderRadius:3}}></div> Sold</span>
      </div>

      <div className="plot-grid">
        {filteredPlots.map(plot => (
          <div key={plot._id} className={`plot-box status-${plot.status}`} onClick={() => handlePlotClick(plot)}>
            {plot.plotNumber}
          </div>
        ))}
      </div>
      
      {filteredPlots.length === 0 && <p style={{textAlign:'center', marginTop:'40px'}}>No plots found.</p>}

      {/* --- BULK MANAGE MODAL --- */}
      {showManageModal && (
        <div className="modal-overlay" onClick={() => setShowManageModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop:0}}>Manage Project Inventory</h3>
            <p style={{color:'var(--text-muted)'}}>Enter the number of plots you want to add or remove.</p>
            
            <label>Number of Plots</label>
            <input 
              type="number" 
              min="1"
              value={manageCount} 
              onChange={e => setManageCount(e.target.value)} 
              autoFocus
            />

            <div style={{display:'flex', gap:'10px', marginTop:'20px'}}>
              <button className="btn" style={{flex:1}} onClick={handleBulkAdd}>
                Add {manageCount} Plots
              </button>
              <button className="btn btn-danger" style={{flex:1}} onClick={handleBulkDelete}>
                Delete Last {manageCount}
              </button>
            </div>
            
            <button className="btn btn-secondary" style={{width:'100%', marginTop:'10px'}} onClick={() => setShowManageModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* --- SINGLE PLOT EDIT MODAL --- */}
      {selectedPlot && (
        <div className="modal-overlay" onClick={() => setSelectedPlot(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop:0}}>Plot {selectedPlot.plotNumber} Details</h3>
            
            {user.role === 'MD' ? (
              <form onSubmit={handleUpdate}>
                 <label>Status</label>
                 <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                   <option value="Available">Available</option>
                   <option value="Booked">Booked</option>
                   <option value="Sold">Sold</option>
                 </select>
                 <label>Customer Name</label>
                 <input value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} />
                 <label>Customer Mobile (Optional)</label>
                 <input value={formData.customerMobile} onChange={e => setFormData({...formData, customerMobile: e.target.value})} />
                 <label>Sold By (Agent)</label>
                 <select value={formData.soldBy} onChange={e => setFormData({...formData, soldBy: e.target.value})}>
                    <option value="">-- None --</option>
                    {agents.map(a => <option key={a._id} value={a.name}>{a.name}</option>)}
                 </select>

                 <div style={{display:'flex', gap:'10px', marginTop:'15px', justifyContent:'space-between'}}>
                   <div style={{display:'flex', gap:'10px'}}>
                     <button type="submit" className="btn">Save</button>
                     <button type="button" className="btn btn-secondary" onClick={() => setSelectedPlot(null)}>Cancel</button>
                   </div>
                   <button type="button" className="btn btn-danger" onClick={handleDeleteSingle} style={{background:'none', border:'1px solid #ef4444', color:'#ef4444'}}>Delete</button>
                 </div>
              </form>
            ) : (
              <div>
                <p>Status: <strong className={`status-${selectedPlot.status}`}>{selectedPlot.status}</strong></p>
                <p>Customer: {selectedPlot.customerName || 'N/A'}</p>
                <p>Agent: {selectedPlot.soldBy || 'N/A'}</p>
                <button className="btn btn-secondary" style={{width:'100%'}} onClick={() => setSelectedPlot(null)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;