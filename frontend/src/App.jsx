import { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/agents/action-bias');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>LifeOS</h1>
        <p className="subtitle">Autonomous Data-Processing Loop</p>
      </header>

      <main className="dashboard-grid">
        <section className="widget action-bias-widget">
          <div className="widget-header">
            <h2>Action-Bias Tracker</h2>
            <div className={`status-badge ${data?.interventionRequired ? 'status-warning' : 'status-ok'}`}>
              {loading ? 'Analyzing...' : (data?.interventionRequired ? 'Intervention Needed' : 'Healthy')}
            </div>
          </div>

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Fetching insights via Coral...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p>Error: {error}</p>
              <button onClick={() => window.location.reload()} className="btn-retry">Retry</button>
            </div>
          )}

          {!loading && !error && data && (
            <div className="widget-content">
              <div className="score-container">
                <div className="score-circle">
                  <span className="score-value">{data.score}</span>
                  <span className="score-label">Score</span>
                </div>
                <div className="stats-container">
                  <div className="stat">
                    <span className="stat-value">{data.consumptionHours}h</span>
                    <span className="stat-label">Consumption</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{data.executionCommits}</span>
                    <span className="stat-label">Commits</span>
                  </div>
                </div>
              </div>

              <div className="gemini-insights glass-panel">
                <h3><span className="sparkle-icon">✨</span> Gemini Analysis</h3>
                <p>{data.geminiInsights}</p>
              </div>

              <div className="recent-activity">
                <h3>Recent Execution Log</h3>
                <ul className="commit-list">
                  {data.recentCommits?.map((commit, index) => (
                    <li key={index} className="commit-item">
                      <span className="commit-hash">{commit.sha.substring(0, 7)}</span>
                      <span className="commit-msg">{commit.message}</span>
                    </li>
                  ))}
                  {(!data.recentCommits || data.recentCommits.length === 0) && (
                    <li className="no-commits">No recent commits found.</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
