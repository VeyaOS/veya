import { useState, useEffect } from 'react';
import api from '../../utils/api';

function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/admin/audit');
      setLogs(response.data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionTheme = (action) => {
    const act = action.toLowerCase();
    if (act.includes('suspend') || act.includes('delete')) return { icon: '🔐', bg: 'var(--red-dim)' };
    if (act.includes('activate') || act.includes('paid')) return { icon: '💰', bg: 'var(--green-dim)' };
    if (act.includes('reset')) return { icon: '👤', bg: 'var(--blue-dim)' };
    return { icon: '⚙️', bg: 'var(--bg4)' };
  };

  if (loading) return (
    <div className="admin-loader-container" style={{background: 'transparent', height: 'auto', padding: '100px'}}>
      <div className="admin-spinner"></div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="section-row">
        <div className="section-title">Audit Log</div>
        <div className="filter-row">
          <button className="filter-btn active">All Actions</button>
          <button className="filter-btn">Merchant Actions</button>
          <button className="filter-btn">Invoice Actions</button>
          <button className="btn btn-ghost btn-sm">↓ Export</button>
        </div>
      </div>

      <div className="card">
        <div id="auditLog">
          {logs.map(log => {
            const theme = getActionTheme(log.action);
            return (
              <div className="audit-entry" key={log.id}>
                <div className="audit-icon" style={{ background: theme.bg }}>{theme.icon}</div>
                <div className="audit-body">
                  <div className="audit-action">{log.action.replace(/_/g, ' ').toUpperCase()}</div>
                  <div className="audit-detail">
                    {log.admin.firstName} {log.admin.lastName} accessed {log.targetType} ({log.targetId.substring(0,8)}...)
                    {log.metadata && log.metadata.reason && (
                      <div className="log-code">{log.metadata.reason}</div>
                    )}
                  </div>
                </div>
                <div className="audit-time">
                  {new Date(log.createdAt).toLocaleString(undefined, { 
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>
            )
          })}
          {logs.length === 0 && (
            <div className="empty">
              <div className="empty-icon">🛡️</div>
              <div className="empty-text">No administrative actions logged yet.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminAudit;
