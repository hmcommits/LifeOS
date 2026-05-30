import { useState, useEffect } from 'react';
import './index.css';
import WealthTetrisWidget from './components/WealthTetrisWidget';
import TimeTetrisWidget from './components/TimeTetrisWidget';
import SocialCapitalWidget from './components/SocialCapitalWidget';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('social-capital');

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <img src="/coral-logo.png" alt="Coral Logo" className="coral-logo" />
        <a href="https://github.com/hmcommits/LifeOS" target="_blank" rel="noopener noreferrer" className="github-btn">
          <svg height="20" viewBox="0 0 16 16" version="1.1" width="20" aria-hidden="true" fill="currentColor">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
          </svg>
          View on GitHub
        </a>
        <h1>LifeOS</h1>
        <p className="subtitle">A Coral Powered Autonomous Data-Processing Loop</p>
      </header>

      <nav className="tab-nav">
        <button 
          className={`tab-btn ${activeTab === 'social-capital' ? 'active' : ''}`}
          onClick={() => setActiveTab('social-capital')}
        >
          Social Capital
        </button>
        <button 
          className={`tab-btn ${activeTab === 'time-tetris' ? 'active' : ''}`}
          onClick={() => setActiveTab('time-tetris')}
        >
          Time-Tetris
        </button>
        <button 
          className={`tab-btn ${activeTab === 'action-bias' ? 'active' : ''}`}
          onClick={() => setActiveTab('action-bias')}
        >
          Action-Bias
        </button>
        <button 
          className={`tab-btn ${activeTab === 'wealth-tetris' ? 'active' : ''}`}
          onClick={() => setActiveTab('wealth-tetris')}
        >
          Wealth Tetris
        </button>
      </nav>

      <main className="tab-container">
        
        {/* Social Capital Tab */}
        <div className={`tab-content ${activeTab === 'social-capital' ? 'active' : 'hidden'}`}>
          <div className="widget-col">
            <SocialCapitalWidget />
          </div>
          <div className="architecture-panel">
            <h3>Under the Hood ⚙️</h3>
            <p><strong>The Goal:</strong> Never forget a promise made to a friend. This extracts action items from your casual chats.</p>
            <p><strong>Live Data:</strong> The AI acts as a smart parser reading raw, unstructured text messages to find hidden deadlines.</p>
            <div className="code-block">
              <code>
                <span className="sql-keyword">SELECT</span> Date, Time, Sender, Message<br/>
                <span className="sql-keyword">FROM</span> 'whatsapp_data.csv'<br/>
                <span className="sql-keyword">ORDER BY</span> Date <span className="sql-keyword">DESC</span>, Time <span className="sql-keyword">DESC</span><br/>
                <span className="sql-keyword">LIMIT</span> 50;
              </code>
            </div>
          </div>
        </div>

        {/* Time-Tetris Tab */}
        <div className={`tab-content ${activeTab === 'time-tetris' ? 'active' : 'hidden'}`}>
          <div className="widget-col">
            <TimeTetrisWidget />
          </div>
          <div className="architecture-panel">
            <h3>Under the Hood ⚙️</h3>
            <p><strong>The Goal:</strong> Automatically fix overlapping meetings and find hidden free time in your schedule.</p>
            <p><strong>Live Data:</strong> We pull down your entire day from Google Calendar to spot conflicts.</p>
            <div className="code-block">
              <code>
                <span className="sql-keyword">SELECT</span> c.title, h.title, h.preferredTime<br/>
                <span className="sql-keyword">FROM</span> 'calendar.csv' c<br/>
                <span className="sql-keyword">CROSS JOIN</span> 'habits.csv' h;
              </code>
            </div>
          </div>
        </div>

        {/* Action Bias Tab */}
        <div className={`tab-content ${activeTab === 'action-bias' ? 'active' : 'hidden'}`}>
          <div className="widget-col">
            <section className="widget action-bias-widget">
              <div className="widget-header">
                <h2>Action-Bias Tracker</h2>
                <div className={`status-badge ${data?.interventionRequired ? 'status-warning' : (data ? 'status-ok' : 'status-pending')}`}>
                  {loading ? 'Analyzing...' : (data ? (data.interventionRequired ? 'Intervention Needed' : 'Healthy') : 'Awaiting Scan')}
                </div>
              </div>
              
              {!data && !loading && !error && (
                <div className="upload-section">
                  <button className="upload-btn" onClick={handleAnalyze}>
                    Scan Action-Bias
                  </button>
                </div>
              )}

              {loading && (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Queuing local AI inference...</p>
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
                    <h3><span className="sparkle-icon">🧠</span> AI Analysis</h3>
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
          </div>
          <div className="architecture-panel">
            <h3>Under the Hood ⚙️</h3>
            <p><strong>The Goal:</strong> Stop doom-scrolling, start building. This widget tracks your actual execution vs consumption.</p>
            <p><strong>Coral Magic:</strong> To fetch your GitHub activity, we don't write complex API code. We use <strong>Coral</strong>, an amazing tool that lets us query live internet APIs using plain old SQL! It instantly translates SQL into the exact web requests needed.</p>
            <div className="code-block">
              <code>
                <span className="sql-keyword">SELECT</span> sha, commit__message<br/>
                <span className="sql-keyword">FROM</span> github.commits<br/>
                <span className="sql-keyword">WHERE</span> owner = 'hmbitcyber'<br/>
                <span className="sql-keyword">LIMIT</span> 5;
              </code>
            </div>
          </div>
        </div>

        {/* Wealth Tetris Tab */}
        <div className={`tab-content ${activeTab === 'wealth-tetris' ? 'active' : 'hidden'}`}>
          <div className="widget-col">
            <WealthTetrisWidget />
          </div>
          <div className="architecture-panel">
            <h3>Under the Hood ⚙️</h3>
            <p><strong>The Goal:</strong> Catch sneaky auto-renewals and free trials before they charge your card.</p>
            <p><strong>Live Data:</strong> We securely hook into your Gmail to scan for incoming receipts and trial emails, acting as your personal financial auditor.</p>
            <div className="code-block">
              <code>
                <span className="sql-keyword">SELECT</span> e.Date, e.Sender, e.Snippet, c.title<br/>
                <span className="sql-keyword">FROM</span> 'emails.csv' e<br/>
                <span className="sql-keyword">CROSS JOIN</span> 'calendar.csv' c<br/>
                <span className="sql-keyword">LIMIT</span> 50;
              </code>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
