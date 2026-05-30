import { useState, useEffect } from 'react';

function WealthTetrisWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/agents/wealth-tetris');
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

  return (
    <section className="widget wealth-tetris-widget">
      <div className="widget-header">
        <h2>Wealth Tetris</h2>
        <div className={`status-badge ${data?.budgetStatus !== 'Healthy' && !loading && data ? 'status-warning' : (data ? 'status-ok' : 'status-pending')}`}>
          {loading ? 'Analyzing...' : (data ? data.budgetStatus : 'Ready for Audit')}
        </div>
      </div>

      {!data && !loading && !error && (
        <div className="upload-section">
          <button className="upload-btn" onClick={handleAudit}>
            Audit My Finances
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Auditing financials via Coral...</p>
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
          <div className="score-container" style={{ marginBottom: '1.5rem' }}>
            <div className="stats-container" style={{ width: '100%', justifyContent: 'space-between' }}>
              <div className="stat">
                <span className="stat-value">₹{data.totalMonthlySubscriptions.toLocaleString()}</span>
                <span className="stat-label">Monthly Subscriptions</span>
              </div>
            </div>
          </div>

          <div className="gemini-insights glass-panel">
            <h3><span className="sparkle-icon">✨</span> QWEN ANALYSIS</h3>
            <p>{data.geminiInsights}</p>
          </div>

          <div className="recent-activity">
            <h3>Detected Risks</h3>
            <ul className="commit-list">
              {data.detectedRisks?.map((risk, index) => (
                <li key={index} className="commit-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '0.5rem' }}>
                    <span className="commit-hash">{risk.service}</span>
                    <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>₹{risk.cost}</span>
                  </div>
                  <span className="commit-msg" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Trial Ends: {risk.trialEndDate}
                  </span>
                  <span className="commit-msg" style={{ fontSize: '0.85rem', color: 'var(--accent)', marginTop: '0.2rem' }}>
                    Action: {risk.actionTaken}
                  </span>
                </li>
              ))}
              {(!data.detectedRisks || data.detectedRisks.length === 0) && (
                <li className="no-commits">No financial leaks detected.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

export default WealthTetrisWidget;
