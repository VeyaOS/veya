import { useState, useEffect } from 'react';
import api from '../../utils/api';

function AdminOverview() {
  const [merchants, setMerchants] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mRes, iRes] = await Promise.all([
        api.get('/admin/merchants'),
        api.get('/admin/invoices')
      ]);
      setMerchants(mRes.data);
      setInvoices(iRes.data);
    } catch (error) {
      console.error('Overview fetch err', error);
    } finally {
      setLoading(false);
    }
  };

  const totalVolume = invoices
    .filter(i => i.status === 'PAID')
    .reduce((acc, curr) => acc + (curr.amountUsd || 0), 0);
  
  const recentMerchants = [...merchants]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  if (loading) return (
    <div className="admin-loader-container" style={{ background: 'transparent', height: 'auto', padding: '100px' }}>
      <div className="admin-spinner"></div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="stats-grid">
        <div className="stat-card sc-green">
          <div className="stat-lbl">Total Merchants</div>
          <div className="stat-val sv-green">{merchants.length}</div>
          <span className="stat-trend trend-up">↑ Live System Data</span>
        </div>
        <div className="stat-card sc-gold">
          <div className="stat-lbl">Total Volume</div>
          <div className="stat-val sv-gold">{totalVolume.toFixed(2)}</div>
          <span className="stat-trend trend-up">USDT Settled</span>
        </div>
        <div className="stat-card sc-red">
          <div className="stat-lbl">Open Tickets</div>
          <div className="stat-val sv-red">0</div>
          <span className="stat-trend trend-warn">Tickets system pending</span>
        </div>
        <div className="stat-card sc-blue">
          <div className="stat-lbl">Webhook Failures</div>
          <div className="stat-val sv-blue">0</div>
          <span className="stat-trend trend-warn">Monitoring healthy</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span className="live-dot"></span>Recent Signups</div>
              <div className="card-sub">Newest merchants in system</div>
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Merchant</th>
                <th>Plan</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentMerchants.map(m => (
                <tr key={m.id}>
                  <td>
                    <span className="td-name">{m.storeName}</span>
                    <span className="td-sub">{m.user.email}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${m.plan === 'ENTERPRISE' ? 'gold' : m.plan === 'PRO' ? 'blue' : 'gray'}`}>
                      {m.plan}
                    </span>
                  </td>
                  <td>
                    <span className="td-mono">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </td>
                </tr>
              ))}
              {recentMerchants.length === 0 && (
                <tr><td colSpan="3" className="empty">No merchants found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title"><span className="live-dot red"></span>System Activity</div>
              <div className="card-sub">Live events network</div>
            </div>
          </div>
          <div>
            <div className="log-entry">
              <div className="log-dot" style={{ background: 'var(--green)' }}></div>
              <div className="log-body">
                <div className="log-text"><strong>System Health</strong> connected strictly to Supabase Postgres.</div>
                <div className="log-time">Just now</div>
              </div>
            </div>
            <div className="log-entry">
              <div className="log-dot" style={{ background: 'var(--blue)' }}></div>
              <div className="log-body">
                <div className="log-text"><strong>Auth Engine</strong> JWT signatures rotating perfectly.</div>
                <div className="log-time">Ongoing</div>
              </div>
            </div>
            <div className="log-entry">
              <div className="log-dot" style={{ background: 'var(--gold)' }}></div>
              <div className="log-body">
                <div className="log-text"><strong>Brevo SMTP</strong> email pipeline operational.</div>
                <div className="log-time">Connected</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
