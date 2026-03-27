import { useState, useEffect } from 'react';
import api from '../../utils/api';

function AdminSystem() {
  const [logs, setLogs] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchSystemData();
  }, []);

  const fetchSystemData = async () => {
    try {
      const response = await api.get('/admin/system');
      setLogs(response.data.logs);
      setWebhooks(response.data.webhooks);
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (loading) return (
    <div className="admin-loader-container" style={{background: 'transparent', height: 'auto', padding: '100px'}}>
      <div className="admin-spinner"></div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="section-row">
        <div className="section-title">System Execution Health</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Network Events Log</div>
              <div className="card-sub">{logs.length} internal events indexed</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast('Log cycle cleared from view')}>Clear logs</button>
          </div>
          <div id="errorLogs">
            {logs.map(log => {
              const dotColor = log.level === 'error' ? 'var(--red)' : log.level === 'warn' ? 'var(--orange)' : 'var(--green)';
              return (
                <div className="log-entry" key={log.id}>
                  <div className="log-dot" style={{ background: dotColor }}></div>
                  <div className="log-body">
                    <div className="log-text"><strong>[{log.level.toUpperCase()}]</strong> — {log.message}</div>
                    <div className="log-time">{new Date(log.createdAt).toLocaleString()}</div>
                    {log.details && (
                      <code className="log-code">{JSON.stringify(log.details)}</code>
                    )}
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
              <div className="empty">
                <div className="empty-text">No irregular system permutations detected.</div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Orphaned Webhooks</div>
              <div className="card-sub">Failed external pings</div>
            </div>
            <button className="btn btn-gold btn-sm" onClick={() => showToast('Dispatching network retry waves...')}>Retry All</button>
          </div>
          <div id="webhookLogs">
             {webhooks.map((w,i) => (
              <div className="log-entry" key={i}>
                <div className="log-dot" style={{ background: 'var(--red)' }}></div>
                <div className="log-body">
                  <div className="log-text"><strong>{w.invoiceId}</strong> — {w.event} • {w.attempts} attempts</div>
                  <div className="log-time">Last attempt: {w.lastAttempt}</div>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '6px' }}>
                    <button className="act-btn ab-view" onClick={() => showToast(`Retrying webhook protocol for ${w.invoiceId}..`)}>Retry</button>
                    <button className="act-btn ab-danger" onClick={() => showToast('Pipeline notification dropped')}>Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
            {webhooks.length === 0 && (
              <div className="empty">
                <div className="empty-text">Zero stranded webhooks. Pipeline routing perfectly.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="toast show">
          <span id="toastIcon">⚡</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default AdminSystem;
