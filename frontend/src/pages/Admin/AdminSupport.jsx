import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import socket from '../../utils/socket';

function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [toastMsg, setToastMsg] = useState(null);
  const [presence, setPresence] = useState({ adminActive: false, merchantActive: false });
  const [merchantTyping, setMerchantTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchTickets();

    const handleNotif = (notif) => {
      if (notif.type === 'new_ticket') {
        fetchTickets();
      }
    };
    const handleTicketSync = () => fetchTickets();
    const handlePresence = (data) => {
      if (data.ticketId === activeTicketId) setPresence(data);
    };
    const handleTyping = (data) => {
      if (data.ticketId === activeTicketId && data.actor === 'merchant') {
        setMerchantTyping(Boolean(data.isTyping));
      }
    };

    socket.on('notification', handleNotif);
    socket.on('ticket:reply', handleTicketSync);
    socket.on('ticket:presence', handlePresence);
    socket.on('ticket:typing', handleTyping);

    return () => {
      socket.off('notification', handleNotif);
      socket.off('ticket:reply', handleTicketSync);
      socket.off('ticket:presence', handlePresence);
      socket.off('ticket:typing', handleTyping);
    };
  }, [activeTicketId]);

  useEffect(() => {
    if (activeTicketId) {
      setMerchantTyping(false);
      socket.emit('join_ticket', activeTicketId);
      return () => {
        socket.emit('leave_ticket', activeTicketId);
        socket.emit('ticket:typing', { ticketId: activeTicketId, isTyping: false });
      };
    }
  }, [activeTicketId]);

  useEffect(() => () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  }, []);

  const handleReplyInput = (value) => {
    setReplyText(value);
    if (!activeTicketId) return;

    socket.emit('ticket:typing', { ticketId: activeTicketId, isTyping: value.trim().length > 0 });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('ticket:typing', { ticketId: activeTicketId, isTyping: false });
    }, 1200);
  };

  const fetchTickets = async () => {
    try {
      const response = await api.get('/admin/support');
      setTickets(response.data);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSendReply = async (markResolved = false) => {
    if (!activeTicketId) return;
    try {
      await api.post(`/admin/support/${activeTicketId}/respond`, {
        message: replyText,
        markResolved
      });
      showToast(markResolved ? 'Ticket officially resolved' : 'Response dispatched');
      setReplyText('');
      setMerchantTyping(false);
      socket.emit('ticket:typing', { ticketId: activeTicketId, isTyping: false });
      fetchTickets();
    } catch (error) {
      showToast('Action failed to dispatch');
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'open') return t.status !== 'RESOLVED';
    if (filter === 'resolved') return t.status === 'RESOLVED';
    return true;
  });

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  if (loading) return (
    <div className="admin-loader-container" style={{background: 'transparent', height: 'auto', padding: '100px'}}>
      <div className="admin-spinner"></div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="section-row">
        <div className="section-title">Support Desk</div>
        <div className="filter-row">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`filter-btn ${filter === 'open' ? 'active' : ''}`} onClick={() => setFilter('open')}>Open</button>
          <button className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`} onClick={() => setFilter('resolved')}>Resolved</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '18px' }}>
        <div className="card">
          <div id="ticketList">
            {filteredTickets.map(t => {
              const isOpen = t.status !== 'RESOLVED';
              const color = isOpen ? 'var(--orange)' : 'var(--green)';
              const bg = isOpen ? 'var(--orange-dim)' : 'var(--green-dim)';
              return (
                <div 
                  key={t.id} 
                  className="ticket-row" 
                  onClick={() => setActiveTicketId(t.id)}
                  style={activeTicketId === t.id ? { background: 'var(--bg3)' } : {}}
                >
                  <div className="ticket-avatar" style={{ background: bg, color }}>
                    {t.merchant?.storeName?.charAt(0) || 'M'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ticket-title">{t.subject}</div>
                    <div className="ticket-preview">{t.message?.substring(0, 30)}...</div>
                    <div className="ticket-meta">
                      <span className={`badge badge-${isOpen ? 'red' : 'green'}`} style={{ fontSize: '9px' }}>
                        {t.status}
                      </span>
                      <span className="ticket-time">{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {isOpen && t.responses.length === 0 && <div className="ticket-unread"></div>}
                </div>
              )
            })}
            {filteredTickets.length === 0 && (
              <div className="empty">
                <div className="empty-icon">✓</div>
                <div className="empty-text">Zero tickets pending.</div>
              </div>
            )}
          </div>
        </div>

        <div className="card" id="ticketDetail">
          {!activeTicket ? (
            <div className="empty" style={{ paddingTop: '100px' }}>
              <div className="empty-icon">◈</div>
              <div className="empty-text">Select a ticket to view details</div>
            </div>
          ) : (
            <>
              <div className="card-header">
                <div>
                  <div className="card-title">{activeTicket.subject}</div>
                  <div className="card-sub">
                    {activeTicket.merchant?.storeName} • {new Date(activeTicket.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className={`ticket-presence-pill${presence.merchantActive ? ' live' : ''}`}>
                  <span className="ticket-presence-dot" />
                  <span>{presence.merchantActive ? 'Merchant active now' : 'Merchant offline'}</span>
                </div>
                <span className={`badge badge-${activeTicket.status !== 'RESOLVED' ? 'red' : 'green'}`}>
                  {activeTicket.status}
                </span>
              </div>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                {/* Original Ticket */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px', background: 'var(--blue-dim)', 
                    color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontFamily: "'Playfair Display', serif", fontSize: '13px', fontWeight: '700', 
                    fontStyle: 'italic', flexShrink: 0
                  }}>
                    {activeTicket.merchant?.storeName?.charAt(0) || 'M'}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>
                      {activeTicket.merchant?.storeName}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text3)' }}>
                      {new Date(activeTicket.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                  {activeTicket.message}
                </div>

                {/* Responses */}
                {activeTicket.responses.map(resp => (
                  <div key={resp.id} style={{ marginTop: '24px', paddingLeft: '20px', borderLeft: resp.isFromAdmin ? '2px solid var(--gold)' : '2px solid var(--blue)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className={`badge badge-${resp.isFromAdmin ? 'gold' : 'blue'}`}>
                        {resp.isFromAdmin ? 'Admin' : 'Merchant'}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text)' }}>
                        {resp.isFromAdmin ? (resp.admin?.firstName || 'Veya Support') : activeTicket.merchant?.storeName}
                      </span>
                      <span className="td-mono">{new Date(resp.createdAt).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                      {resp.message}
                    </div>
                  </div>
                ))}
                {merchantTyping && (
                  <div className="ticket-typing-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge badge-blue">Merchant</span>
                      <span className="ticket-typing-title">
                        {activeTicket.merchant?.storeName}
                      </span>
                    </div>
                    <div className="ticket-typing-copy">
                      <div className="ticket-typing-sub">
                        typing
                        <span className="ticket-typing-dots">
                          <span />
                          <span />
                          <span />
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {(() => {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const isLockedOther = activeTicket.status !== 'RESOLVED' && activeTicket.assignedTo && activeTicket.assignedTo !== currentUser.id;

                return (
                  <div style={{ padding: '20px' }}>
                    {isLockedOther ? (
                      <div style={{ padding: '16px', background: 'var(--red-dim)', color: 'var(--red)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>🔒</span> 
                        <span>This ticket is currently locked and being handled by another administrator.</span>
                      </div>
                    ) : (
                      <>
                        <div className="form-group">
                          <label className="form-label">Reply</label>
                          <textarea 
                            className="form-input" 
                            placeholder={activeTicket.status === 'RESOLVED' ? "Ticket is resolved..." : "Type your reply..."}
                            style={{ minHeight: '80px' }}
                            value={replyText}
                            onChange={(e) => handleReplyInput(e.target.value)}
                            disabled={activeTicket.status === 'RESOLVED'}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn btn-gold btn-sm" onClick={() => handleSendReply(false)} disabled={activeTicket.status === 'RESOLVED'}>Send Reply</button>
                          {activeTicket.status !== 'RESOLVED' && (
                            <button className="btn btn-ghost btn-sm" onClick={() => handleSendReply(true)}>Mark as Resolved</button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="toast show">
          <span id="toastIcon">✅</span>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}

export default AdminSupport;
