import { useState, useEffect } from 'react';
import './index.css';
import MoneySentinelWidget from './components/MoneySentinelWidget';
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
          className={`tab-btn ${activeTab === 'money-sentinel' ? 'active' : ''}`}
          onClick={() => setActiveTab('money-sentinel')}
        >
          Money Sentinel
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
            <p><strong>What is this?</strong> The Action-Bias tracker monitors if you are mindlessly consuming content (YouTube/articles) versus actually building and executing ideas.</p>
            <p><strong>How Coral Works:</strong> Instead of building complex REST API integrations for GitHub, we use a fascinating tool called <strong>Coral</strong>. Coral allows us to query live APIs simply by writing SQL! It translates SQL into the correct API endpoints on the fly.</p>
            <div className="code-block">
              <code>
                SELECT sha, commit__message<br/>
                FROM github.commits<br/>
                WHERE owner = 'hmbitcyber'<br/>
                LIMIT 5;
              </code>
            </div>
            <p><strong>The Brain:</strong> Your local Qwen model then reads these commits and your screen-time to generate a brutally honest score and action plan.</p>
          </div>
        </div>

        {/* Money Sentinel Tab */}
        <div className={`tab-content ${activeTab === 'money-sentinel' ? 'active' : 'hidden'}`}>
          <div className="widget-col">
            <MoneySentinelWidget />
          </div>
          <div className="architecture-panel">
            <h3>Under the Hood ⚙️</h3>
            <p><strong>What is this?</strong> Money Sentinel catches subscriptions you forgot to cancel before the free trial ends, and summarizes your monthly burn rate.</p>
            <p><strong>Live Gmail Integration:</strong> This uses the <code>googleapis</code> SDK and an OAuth2 token to securely hook directly into your personal Gmail inbox.</p>
            <div className="code-block">
              <code>
                const gmail = google.gmail('v1');<br/>
                const res = await gmail.users.messages.list(&#123;<br/>
                &nbsp;&nbsp;q: "free trial OR auto-renewal OR receipt"<br/>
                &#125;);
              </code>
            </div>
            <p><strong>The Brain:</strong> By feeding these raw, unstructured emails into our local Qwen AI, it acts as a financial auditor, extracting exactly how much money is leaving your account without relying on a third-party budgeting app.</p>
          </div>
        </div>

        {/* Time-Tetris Tab */}
        <div className={`tab-content ${activeTab === 'time-tetris' ? 'active' : 'hidden'}`}>
          <div className="widget-col">
            <TimeTetrisWidget />
          </div>
          <div className="architecture-panel">
            <h3>Under the Hood ⚙️</h3>
            <p><strong>What is this?</strong> Time-Tetris automatically finds overlapping conflicts in your schedule and resolves them by finding open whitespace in your day.</p>
            <p><strong>Google Calendar API:</strong> We query your primary calendar to pull down every event happening today.</p>
            <div className="code-block">
              <code>
                calendar.events.list(&#123;<br/>
                &nbsp;&nbsp;calendarId: 'primary',<br/>
                &nbsp;&nbsp;timeMin: startOfDay,<br/>
                &nbsp;&nbsp;timeMax: endOfDay<br/>
                &#125;);
              </code>
            </div>
            <p><strong>The Brain:</strong> The AI acts as a sophisticated constraints solver. It looks at the hard blocks (meetings you cannot move) and soft blocks (gym, reading), then mathematically rearranges your day to fit everything seamlessly.</p>
          </div>
        </div>

        {/* Social Capital Tab */}
        <div className={`tab-content ${activeTab === 'social-capital' ? 'active' : 'hidden'}`}>
          <div className="widget-col">
            <SocialCapitalWidget />
          </div>
          <div className="architecture-panel">
            <h3>Under the Hood ⚙️</h3>
            <p><strong>What is this?</strong> An automated CRM for your friendships. It reminds you to follow up on promises or gift ideas you casually mentioned in text messages.</p>
            <p><strong>Data Pipeline:</strong> Currently parsing exported WhatsApp chat logs. It reads unstructured human conversation:</p>
            <div className="code-block">
              <code>
                [14:30] Rahul: Can you look at my resume this weekend?<br/>
                [14:35] Me: Yeah sure.
              </code>
            </div>
            <p><strong>The Brain:</strong> The AI parses the human intent, recognizes "this weekend" as a deadline, and creates an actionable JSON object with a specific due date. Never drop the ball on a friendship again.</p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
