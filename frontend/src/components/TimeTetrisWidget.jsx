import { useState, useEffect } from 'react';

function TimeTetrisWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/agents/time-tetris');
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
    <section className="widget time-tetris-widget">
      <div className="widget-header">
        <h2>Time-Tetris</h2>
        <div className={`status-badge ${data?.rescheduledCount > 0 ? 'status-warning' : 'status-ok'}`}>
          {loading ? 'Optimizing...' : (data?.rescheduledCount > 0 ? `${data.rescheduledCount} Rescheduled` : 'On Time')}
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing schedule whitespace...</p>
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
          <div className="schedule-container">
            <h3>Today's Optimized Schedule</h3>
            <ul className="schedule-list">
              {data.schedule?.map((item, index) => (
                <li key={index} className={`schedule-item status-${item.status}`}>
                  <div className="schedule-time">
                    <span className="time">{item.startTime} - {item.endTime}</span>
                  </div>
                  <div className="schedule-details">
                    <span className="schedule-title">{item.title}</span>
                    {item.status === 'delayed' && <span className="badge badge-delayed">Delayed</span>}
                    {item.status === 'optimized_by_gemini' && <span className="badge badge-optimized">Optimized</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="gemini-insights glass-panel">
            <h3><span className="sparkle-icon">✨</span> QWEN ANALYSIS</h3>
            <p>{data.geminiInsights}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default TimeTetrisWidget;
