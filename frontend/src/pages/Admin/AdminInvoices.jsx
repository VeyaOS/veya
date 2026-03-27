import { useState, useEffect } from 'react';
import api from '../../utils/api';

function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Modal State
  const [modalType, setModalType] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/admin/invoices');
      setInvoices(response.data);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleMarkPaid = async () => {
    if (!selectedInvoice) return;
    try {
      await api.post(`/admin/invoices/${selectedInvoice.id}/mark-paid`, {
        reason: overrideReason || 'Manual override applied by Admin'
      });
      showToast(`${selectedInvoice.invoiceNumber} permanently marked as PAID`);
      fetchInvoices();
      setModalType(null);
      setOverrideReason('');
    } catch (error) {
      showToast('Failed to force invoice state');
    }
  };

  const filtered = invoices.filter(inv => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  if (loading) return (
    <div className="admin-loader-container" style={{background: 'transparent', height: 'auto', padding: '100px'}}>
      <div className="admin-spinner"></div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="section-row">
        <div className="section-title">All Invoices</div>
        <div className="filter-row">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'PENDING' ? 'active' : ''}`} onClick={() => setFilter('PENDING')}>Pending</button>
          <button className={`filter-btn ${filter === 'PAID' ? 'active' : ''}`} onClick={() => setFilter('PAID')}>Paid</button>
          <button className={`filter-btn ${filter === 'EXPIRED' ? 'active' : ''}`} onClick={() => setFilter('EXPIRED')}>Expired</button>
        </div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Merchant</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inv => (
              <tr key={inv.id}>
                <td>
                  <span className="td-mono">{inv.invoiceNumber?.substring(0,10)}...</span>
                </td>
                <td>
                  <span className="td-name" style={{ fontSize: '12px' }}>{inv.merchant.storeName}</span>
                </td>
                <td>
                  <span className="td-sub" style={{ fontSize: '12px', color: 'var(--text2)' }}>{inv.customerEmail}</span>
                </td>
                <td>
                  <span className="td-amount">{inv.amountUsd} USDT</span>
                </td>
                <td>
                  <span className={`badge badge-${inv.status === 'PAID' ? 'green' : inv.status === 'PENDING' ? 'gold' : 'red'}`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  <span className="td-mono">{new Date(inv.createdAt).toLocaleDateString()}</span>
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <div className="action-btns">
                    {inv.status === 'PENDING' && (
                      <button 
                        className="act-btn ab-pay" 
                        onClick={() => { setSelectedInvoice(inv); setModalType('resolve'); }}
                      >
                        Mark Paid
                      </button>
                    )}
                    {inv.status === 'PAID' && (
                      <button className="act-btn ab-danger" onClick={() => showToast('Refund flow offline / coming soon')}>Refund</button>
                    )}
                    <button className="act-btn ab-view">View</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="7" className="empty">No invoices found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalType === 'resolve' && selectedInvoice && (
        <div className="overlay show">
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="modal-title">Emergency Override</div>
                <div className="modal-sub">Dispute resolution • {selectedInvoice.invoiceNumber}</div>
              </div>
              <button className="close-btn" onClick={() => { setModalType(null); setOverrideReason(''); }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="confirm-box">
                <p>You are about to <strong>manually force {selectedInvoice.invoiceNumber} to PAID status</strong>. This bypasses the BTCPay webhook layer completely. Use only when chain verification is physically confirmed.</p>
              </div>
              <div className="form-group">
                <label className="form-label">Audit Justification</label>
                <textarea 
                  className="form-input" 
                  placeholder="e.g. BTCPay webhook dropped, TXID manually verified..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => { setModalType(null); setOverrideReason(''); }}>Cancel</button>
              <button className="btn btn-gold" onClick={handleMarkPaid}>Confirm Ledger Rewrite</button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="toast show">
          <span id="toastIcon">✅</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default AdminInvoices;
