import { useEffect, useState } from 'react';
import API from '../api'; // <--- UPDATED IMPORT
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const MDDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [projects, setProjects] = useState([]);
  const [allPlots, setAllPlots] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', location: '', totalPlots: 0 });
  
  const [stats, setStats] = useState({ totalPlots: 0, soldPlots: 0 });
  const [topAgents, setTopAgents] = useState([]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      // UPDATED: Remove localhost
      const resProj = await API.get('/projects');
      setProjects(resProj.data);

      let plotsList = [];
      for (let p of resProj.data) {
        // UPDATED: Remove localhost
        const pPlots = await API.get(`/projects/${p._id}/plots`);
        plotsList = [...plotsList, ...pPlots.data];
      }
      setAllPlots(plotsList);

      let soldP = 0;
      let agentSales = {};
      plotsList.forEach(p => {
        if (p.status !== 'Available') {
          soldP++;
          if (p.soldBy) agentSales[p.soldBy] = (agentSales[p.soldBy] || 0) + 1;
        }
      });

      setStats({ totalPlots: plotsList.length, soldPlots: soldP });
      setTopAgents(Object.entries(agentSales).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count})));

    } catch (err) { console.error(err); }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
        // UPDATED: Remove localhost
        await API.post('/projects', newProject);
        addToast('Project Created Successfully', 'success');
        setNewProject({ name: '', location: '', totalPlots: 0 });
        fetchData();
    } catch(err) { addToast('Failed to create project', 'error'); }
  };

  const handleDeleteProject = async (id) => {
    if(!window.confirm("Delete project and all plots?")) return;
    try {
        // UPDATED: Remove localhost
        await API.delete(`/projects/${id}`);
        addToast('Project Deleted', 'success');
        fetchData();
    } catch(err) { addToast('Delete failed', 'error'); }
  };

  return (
    <div>
      <h1 style={{marginBottom:'20px'}}>Dashboard Overview</h1>

      {/* STATS ROW */}
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Total Inventory</div>
          <div className="metric-number">{stats.totalPlots}</div>
          <div>Plots Available: {stats.totalPlots - stats.soldPlots}</div>
        </div>
        <div className="metric-card" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
          <div className="metric-label">Total Sales</div>
          <div className="metric-number">{stats.soldPlots}</div>
          <div>Plots Sold</div>
        </div>
        <div className="metric-card" style={{background: 'linear-gradient(135deg, #3b82f6, #2563eb)'}}>
          <div className="metric-label">Top Agent</div>
          <div className="metric-number" style={{fontSize:'1.8rem', marginTop:'10px'}}>
             {topAgents[0]?.name || "N/A"}
          </div>
          <div>{topAgents[0]?.count || 0} Sales</div>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'30px'}}>
        {/* LEFT: PROJECTS */}
        <div>
           <h3 className="section-title">Manage Projects</h3>
           <div className="card-grid" style={{gridTemplateColumns:'1fr'}}>
              {projects.map(p => {
                const pPlots = allPlots.filter(plot => plot.projectId === p._id);
                const sold = pPlots.filter(pl => pl.status !== 'Available').length;
                const percentage = pPlots.length ? Math.round((sold / pPlots.length) * 100) : 0;

                return (
                  <div key={p._id} className="card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <div>
                      <h3 style={{marginBottom:'5px'}}>{p.name}</h3>
                      <p style={{color:'var(--text-muted)', margin:0}}>{p.location}</p>
                    </div>
                    <div style={{textAlign:'right', minWidth:'150px'}}>
                      <div style={{fontWeight:'bold', fontSize:'1.2rem', color: 'var(--primary)'}}>{percentage}% Sold</div>
                      <div style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{sold}/{pPlots.length} Plots</div>
                    </div>
                    <div style={{display:'flex', gap:'10px'}}>
                       <button className="btn" onClick={() => navigate(`/project/${p._id}`)}>View</button>
                       <button className="btn-secondary" style={{color:'red', borderColor:'red'}} onClick={() => handleDeleteProject(p._id)}>Delete</button>
                    </div>
                  </div>
                );
              })}
           </div>

           {/* CREATE PROJECT */}
           <div className="card">
             <h3>🚀 Launch New Project</h3>
             <form onSubmit={handleCreateProject} style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
               <input placeholder="Name" value={newProject.name} onChange={e=>setNewProject({...newProject, name:e.target.value})} style={{flex:2}} required/>
               <input placeholder="Location" value={newProject.location} onChange={e=>setNewProject({...newProject, location:e.target.value})} style={{flex:2}} required/>
               <input type="number" placeholder="Plots" value={newProject.totalPlots} onChange={e=>setNewProject({...newProject, totalPlots:e.target.value})} style={{flex:1}} required/>
               <button type="submit" className="btn" style={{height:'46px'}}>Create</button>
             </form>
           </div>
        </div>

        {/* RIGHT: LEADERBOARD */}
        <div>
           <div className="card">
             <h4>🏆 Performance Leaderboard</h4>
             <div className="table-container">
               <table>
                 <tbody>
                   {topAgents.map((agent, i) => (
                     <tr key={i}>
                       <td>#{i+1}</td>
                       <td>{agent.name}</td>
                       <td><strong>{agent.count}</strong></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default MDDashboard;