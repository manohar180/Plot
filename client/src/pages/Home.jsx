import { useEffect, useState } from 'react';
import API from '../api'; // <--- UPDATED IMPORT

const Home = ({ user }) => {
  const [stats, setStats] = useState({ total: 0, sold: 0, available: 0 });
  const [topAgents, setTopAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const fetchPublicStats = async () => {
    try {
      // UPDATED: Use API.get (no localhost URL)
      const resProj = await API.get('/projects');
      
      let totalPlots = 0;
      let soldPlots = 0;
      let agentSales = {};

      // UPDATED: Use API.get
      const plotRequests = resProj.data.map(p => API.get(`/projects/${p._id}/plots`));
      const results = await Promise.all(plotRequests);

      results.forEach(res => {
        const plots = res.data;
        totalPlots += plots.length;
        plots.forEach(plot => {
          if (plot.status !== 'Available') {
            soldPlots++;
            if (plot.soldBy) {
              agentSales[plot.soldBy] = (agentSales[plot.soldBy] || 0) + 1;
            }
          }
        });
      });

      const sortedAgents = Object.entries(agentSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) 
        .map(([name, count]) => ({ name, count }));

      setStats({
        total: totalPlots,
        sold: soldPlots,
        available: totalPlots - soldPlots
      });
      setTopAgents(sortedAgents);
      setLoading(false);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{
        textAlign: 'center', padding: '60px 20px', 
        background: 'linear-gradient(135deg, var(--primary), var(--bg-color))',
        borderRadius: '20px', color: 'var(--text-main)', marginBottom: '40px'
      }}>
        <h1 style={{fontSize: '3rem', marginBottom: '10px'}}>Chaitanya Developers</h1>
        <p style={{fontSize: '1.2rem', opacity: 0.8, maxWidth:'600px', margin:'0 auto'}}>
          Building wealth through sustainable Red Sandalwood plantations. 
          Trusted by thousands of happy customers.
        </p>
      </div>

      <h2 className="section-title">Company Growth</h2>
      <div className="metric-grid">
        <div className="card" style={{textAlign:'center', borderTop:'5px solid var(--primary)'}}>
          <div style={{fontSize:'3rem', fontWeight:'bold', color:'var(--primary)'}}>
            {loading ? '...' : stats.total}
          </div>
          <div style={{color:'var(--text-muted)'}}>Total Plots Developed</div>
        </div>

        <div className="card" style={{textAlign:'center', borderTop:'5px solid #f59e0b'}}>
          <div style={{fontSize:'3rem', fontWeight:'bold', color:'#f59e0b'}}>
            {loading ? '...' : stats.sold}
          </div>
          <div style={{color:'var(--text-muted)'}}>Sold</div>
        </div>

        <div className="card" style={{textAlign:'center', borderTop:'5px solid #10b981'}}>
          <div style={{fontSize:'3rem', fontWeight:'bold', color:'#10b981'}}>
            {loading ? '...' : stats.available}
          </div>
          <div style={{color:'var(--text-muted)'}}>Plots Available Now</div>
        </div>
      </div>

      {user && user.role === 'MD' && (
        <>
          <h2 className="section-title">🏆 Star Agents (Admin View)</h2>
          <div className="card">
            {topAgents.length === 0 ? (
              <p style={{padding:'20px', textAlign:'center', color:'var(--text-muted)'}}>
                 Sales data is updating... check back soon!
              </p>
            ) : (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th style={{width:'50px'}}>Rank</th>
                      <th>Agent Name</th>
                      <th style={{textAlign:'right'}}>Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAgents.map((agent, index) => (
                      <tr key={index}>
                        <td style={{fontWeight:'bold', fontSize:'1.2rem'}}>#{index + 1}</td>
                        <td style={{fontWeight:'600'}}>{agent.name}</td>
                        <td style={{textAlign:'right', color:'var(--primary)', fontWeight:'bold'}}>
                          {agent.count} Plots
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
      
      <div style={{marginTop:'50px', textAlign:'center', color:'var(--text-muted)', fontSize:'0.9rem'}}>
        &copy; 2025 Chaitanya Developers. All Rights Reserved.
      </div>
    </div>
  );
};

export default Home;