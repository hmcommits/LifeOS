import React, { useState, useEffect } from 'react';

const SocialCapitalWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('chatFile', file);

    try {
      const response = await fetch('http://localhost:3001/api/agents/upload-chat', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/agents/social-capital');
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
    <section className="widget social-capital-widget">
      <div className="widget-header">
        <h2>Social Capital Keeper</h2>
        <div className="status-badge status-ok">
          {loading || uploading ? 'Scanning Logs...' : 'CRM Active'}
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Extracting social context via Gemini...</p>
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
          <div className="upload-section">
            <label className={`upload-btn ${uploading ? 'disabled' : ''}`}>
              {uploading ? 'Processing Chat...' : 'Upload WhatsApp Export (.txt)'}
              <input 
                type="file" 
                accept=".txt" 
                onChange={handleFileUpload} 
                disabled={uploading} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>

          <div className="reminders-list">
            <h3>Upcoming Relationship Action Items</h3>
            {data.upcomingReminders && data.upcomingReminders.length > 0 ? (
              <ul className="social-list">
                {data.upcomingReminders.map((item, index) => (
                  <li key={index} className="social-item glass-panel">
                    <div className="social-item-header">
                      <span className="person-name">{item.person}</span>
                      <span className="reminder-type">{item.type}</span>
                    </div>
                    <p className="social-context">{item.context}</p>
                    <div className="due-date">Due: {item.dueDate}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-data">No action items found.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default SocialCapitalWidget;
