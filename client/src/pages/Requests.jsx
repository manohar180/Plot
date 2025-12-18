import { useEffect, useState } from 'react';
import API from '../api'; // <--- UPDATED IMPORT
import { useToast } from '../context/ToastContext';

const Requests = () => {
  const { addToast } = useToast();
  const [agentRequests, setAgentRequests] = useState([]);
  const [plotRequests, setPlotRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resAgents, resPlots] = await Promise.all([
        // UPDATED: Use API helper
        API.get('/auth/pending-agents'),
        API.get('/requests')
      ]);
      setAgentRequests(resAgents.data);
      setPlotRequests(resPlots.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      addToast('Error fetching requests', 'error');
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  const handleApproveAgent = async (id) => {
    try {
      // UPDATED: Use API.put
      await API.put(`/auth/approve-agent/${id}`);
      addToast('Agent Approved!', 'success');
      fetchData();
    } catch (err) { addToast('Action Failed', 'error'); }
  };

  const handlePlotAction = async (id, action) => {
    try {
      // UPDATED: Use API.put
      await API.put(`/requests/${id}/action`, { action });
      addToast(`Request ${action}`, action === 'Approved' ? 'success' : 'error');
      fetchData();
    } catch (err) { addToast('Action Failed', 'error'); }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div>
      <h1 className="section-title">Pending Approvals</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* COLUMN 1: NEW AGENTS */}
        <div>
          <h3>👥 New Agent Applications ({agentRequests.length})</h3>
          {agentRequests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No new agents waiting.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {agentRequests.map(agent => (
                <div key={agent._id} className="card" style={{ borderLeft: '5px solid #2563eb' }}>
                  <h4>{agent.name}</h4>
                  <p style={{ margin: '5px 0', color: 'var(--text-muted)' }}>{agent.email}</p>
                  <p style={{ fontSize: '0.8rem' }}>Applied: {new Date(agent.createdAt || Date.now()).toLocaleDateString()}</p>
                  <button 
                    className="btn" 
                    style={{ marginTop: '10px', background: '#2563eb', width: '100%' }}
                    onClick={() => handleApproveAgent(agent._id)}
                  >
                    Approve Account
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUMN 2: PLOT REQUESTS */}
        <div>
          <h3>🔔 Plot Status Requests ({plotRequests.length})</h3>
          {plotRequests.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No pending plot updates.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {plotRequests.map(req => (
                <div key={req._id} className="card" style={{ borderLeft: '5px solid #f59e0b' }}>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <h4 style={{margin:0}}>Plot {req.plotId?.plotNumber}</h4>
                    <span className={`status-${req.requestedStatus}`} style={{padding:'2px 8px', borderRadius:'4px', fontSize:'0.8rem', color:'white'}}>
                      {req.requestedStatus}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '0.9rem', color:'var(--text-muted)', marginBottom:'5px' }}>
                    {req.projectId?.name}
                  </p>
                  
                  <hr style={{border:'0', borderTop:'1px solid var(--border)', margin:'10px 0'}}/>

                  <p style={{margin:'5px 0'}}><strong>Agent:</strong> {req.agentName}</p>
                  <p style={{margin:'5px 0'}}><strong>Customer:</strong> {req.customerName}</p>
                  {req.customerMobile && <p style={{margin:'5px 0'}}><strong>Mobile:</strong> {req.customerMobile}</p>}

                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button className="btn" style={{ flex: 1, background: '#10b981' }} onClick={() => handlePlotAction(req._id, 'Approved')}>Approve</button>
                    <button className="btn" style={{ flex: 1, background: '#ef4444' }} onClick={() => handlePlotAction(req._id, 'Rejected')}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Requests;