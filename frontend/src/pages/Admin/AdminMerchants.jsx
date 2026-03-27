import { useState, useEffect } from 'react';
import api from '../../utils/api';

function AdminMerchants() {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  // Modal State
  const [modalType, setModalType] = useState(null); // 'view', 'reset', null
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const response = await api.get('/admin/merchants');
      setMerchants(response.data);
    } catch (error) {
      console.error('Failed to fetch merchants:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus === 'suspended' ? 'activate' : 'suspend';
    try {
      await api.post(`/admin/merchants/${id}/${action}`);
      showToast(`Merchant ${action}d successfully`);
      fetchMerchants();
      setModalType(null); // auto close modal
    } catch (error) {
      showToast(`Failed to ${action} merchant`);
    }
  };

  const handleResetPassword = async (merchantId) => {
    try {
      await api.post(`/admin/merchants/${merchantId}/reset`);
      showToast(`Password reset email sent successfully.`);
      setModalType(null);
    } catch (error) {
      showToast(error.response?.data?.error || `Failed to send reset email`);
    }
  };

  const filtered = merchants.filter(m => {
    if (filter === 'active' && m.status === 'suspended') return false;
    if (filter === 'suspended' && m.status !== 'suspended') return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!m.storeName.toLowerCase().includes(s) && !m.user.email.toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  });

  if (loading) return (
    <div className="admin-loader-container" style={{background: 'transparent', height: 'auto', padding: '100px'}}>
      <div className="admin-spinner"></div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="section-row">
        <div className="section-title">All Merchants</div>
        <div className="filter-row">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>Active</button>
          <button className={`filter-btn ${filter === 'suspended' ? 'active' : ''}`} onClick={() => setFilter('suspended')}>Suspended</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input 
              className="search-input" 
              placeholder="Search merchants..." 
              style={{ width: '260px' }} 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const bg = `var(--blue-dim)`;
              const c = `var(--blue)`;
              const isActive = m.status !== 'suspended';
              return (
                <tr key={m.id} onClick={() => { setSelectedMerchant(m); setModalType('view'); }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: bg, color: c, display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontFamily: "'Playfair Display', serif", 
                        fontSize: '13px', fontWeight: '700', fontStyle: 'italic', flexShrink: 0 
                      }}>
                        {m.storeName.charAt(0)}
                      </div>
                      <div>
                        <span className="td-name">{m.storeName}</span>
                        <span className="td-sub">{m.user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${m.plan === 'PRO' ? 'gold' : m.plan === 'ENTERPRISE' ? 'purple' : 'gray'}`}>
                      {m.plan}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${isActive ? 'green' : 'red'}`}>
                      {isActive ? 'active' : 'suspended'}
                    </span>
                  </td>
                  <td>
                    <span className="td-mono">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div className="action-btns">
                      <button className="act-btn ab-view" onClick={() => { setSelectedMerchant(m); setModalType('view'); }}>View</button>
                      <button 
                        className={`act-btn ab-${isActive ? 'suspend' : 'activate'}`} 
                        onClick={() => handleToggleStatus(m.id, m.status)}
                      >
                        {isActive ? 'Suspend' : 'Activate'}
                      </button>
                      <button className="act-btn ab-view" onClick={() => { setSelectedMerchant(m); setModalType('reset'); }}>Send Reset</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan="5" className="empty">No merchants found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CLAUDE MODALS */}
      {modalType && (
        <div className="overlay show" onClick={(e) => { if(e.target.className.includes('overlay')) setModalType(null) }}>
          <div className="modal">
            {modalType === 'view' && selectedMerchant && (
              <>
                <div className="modal-header">
                  <div>
                    <div className="modal-title">{selectedMerchant.storeName}</div>
                    <div className="modal-sub">Merchant details • {selectedMerchant.id}</div>
                  </div>
                  <button className="close-btn" onClick={() => setModalType(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="merchant-header">
                    <div className="merchant-avatar" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                      {selectedMerchant.storeName.charAt(0)}
                    </div>
                    <div>
                      <div className="merchant-name-lg">{selectedMerchant.storeName}</div>
                      <div className="merchant-meta">{selectedMerchant.user.email} • veya.app/{selectedMerchant.slug}</div>
                      <div style={{ marginTop: '8px' }}>
                        <span className={`badge badge-${selectedMerchant.status !== 'suspended' ? 'green' : 'red'}`}>
                          {selectedMerchant.status !== 'suspended' ? 'active' : 'suspended'}
                        </span>
                        <span className={`badge badge-${selectedMerchant.plan === 'PRO' ? 'gold' : 'gray'}`} style={{ marginLeft: '4px' }}>
                          {selectedMerchant.plan}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="detail-row">
                    <span className="dl-label">Account Owner</span>
                    <span className="dl-val">{selectedMerchant.user.firstName} {selectedMerchant.user.lastName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="dl-label">Verified</span>
                    <span className="dl-val">{selectedMerchant.user.emailVerified ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="dl-label">Joined</span>
                    <span className="dl-val mono">{new Date(selectedMerchant.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setModalType(null)}>Close</button>
                  <button 
                    className={`btn btn-${selectedMerchant.status !== 'suspended' ? 'red' : 'gold'}`}
                    onClick={() => handleToggleStatus(selectedMerchant.id, selectedMerchant.status)}
                  >
                    {selectedMerchant.status !== 'suspended' ? 'Suspend Merchant' : 'Activate Merchant'}
                  </button>
                </div>
              </>
            )}

            {modalType === 'reset' && selectedMerchant && (
              <>
                <div className="modal-header">
                  <div>
                    <div className="modal-title">Reset Password</div>
                    <div className="modal-sub">{selectedMerchant.storeName} • {selectedMerchant.user.email}</div>
                  </div>
                  <button className="close-btn" onClick={() => setModalType(null)}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="confirm-box">
                    <p>This will send a <strong>password reset email</strong> to <strong>{selectedMerchant.user.firstName}</strong>. The reset link is delivered only through email and is never shown to the admin.</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-ghost" onClick={() => setModalType(null)}>Cancel</button>
                  <button className="btn btn-gold" onClick={() => handleResetPassword(selectedMerchant.id)}>
                    Send Reset Email
                  </button>
                </div>
              </>
            )}
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

export default AdminMerchants;
