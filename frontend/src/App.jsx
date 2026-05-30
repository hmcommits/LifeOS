import { useState, useEffect } from 'react';
import './index.css';
import WealthTetrisWidget from './components/WealthTetrisWidget';
import TimeTetrisWidget from './components/TimeTetrisWidget';
import SocialCapitalWidget from './components/SocialCapitalWidget';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('action-bias');

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

      <nav className="tab-nav">
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
        <button 
          className={`tab-btn ${activeTab === 'time-tetris' ? 'active' : ''}`}
          onClick={() => setActiveTab('time-tetris')}
        >
          Time-Tetris
        </button>
        <button 
          className={`tab-btn ${activeTab === 'social-capital' ? 'active' : ''}`}
          onClick={() => setActiveTab('social-capital')}
        >
          Social Capital
        </button>
      </nav>

      <main className="tab-container">
        
        {/* Action Bias Tab */}
        <div className={`tab-content ${activeTab === 'action-bias' ? 'active' : 'hidden'}`}>
          <div className="widget-col">
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
                <span className="js-keyword">const</span> res = <span className="js-keyword">await</span> gmail.users.messages.list(&#123;<br/>
                &nbsp;&nbsp;q: <span className="js-string">"free trial OR auto-renewal OR receipt"</span><br/>
                &#125;);
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
                <span className="js-keyword">const</span> events = <span className="js-keyword">await</span> calendar.events.list(&#123;<br/>
                &nbsp;&nbsp;calendarId: <span className="js-string">'primary'</span>,<br/>
                &nbsp;&nbsp;timeMin: startOfDay<br/>
                &#125;);
              </code>
            </div>
          </div>
        </div>

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
                <span className="js-string">[14:30] Rahul: Can you look at my resume this weekend?</span><br/>
                <span className="js-string">[14:35] Me: Yeah sure.</span>
              </code>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
