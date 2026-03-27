import { useState, useEffect } from 'react';
import api from '../../utils/api';

function AdminFlags() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchFlags();
  }, []);

  const fetchFlags = async () => {
    try {
      const response = await api.get('/admin/flags');
      setFlags(response.data);
    } catch (error) {
      console.error('Failed to fetch flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const toggleFlag = async (id, name, currentState) => {
    try {
      // Optimistic upate
      setFlags(prev => prev.map(f => f.id === id ? { ...f, isEnabled: !currentState } : f));
      
      await api.post(`/admin/flags/${id}/toggle`);
      showToast(`Flag [${name}] execution protocol safely ${!currentState ? 'ENABLED' : 'DISABLED'}`);
    } catch (error) {
      // Revert optimism
      setFlags(prev => prev.map(f => f.id === id ? { ...f, isEnabled: currentState } : f));
      showToast(`Flag [${name}] operation sequence failed.`);
    }
  };

  if (loading) return (
    <div className="admin-loader-container" style={{background: 'transparent', height: 'auto', padding: '100px'}}>
      <div className="admin-spinner"></div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="section-row">
        <div className="section-title">Feature Flag Architect</div>
        <button className="btn btn-ghost btn-sm" onClick={() => showToast('System constraint locked: Create flags via Backend exclusively')}>+ Deploy Pattern</button>
      </div>

      <div className="card">
        <div id="flagsList">
          {flags.map((f) => (
            <div className="flag-row" key={f.id}>
              <div className="flag-info">
                <div className="flag-name">{f.name}</div>
                <div className="flag-desc">{f.description}</div>
              </div>
              <div className="toggle-wrap">
                <div 
                  className={`toggle ${f.isEnabled ? 'on' : ''}`} 
                  onClick={() => toggleFlag(f.id, f.name, f.isEnabled)}
                ></div>
              </div>
            </div>
          ))}
          {flags.length === 0 && (
            <div className="empty">
              <div className="empty-text">No feature constraints indexed in database.</div>
            </div>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="toast show">
          <span id="toastIcon">⚑</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default AdminFlags;
