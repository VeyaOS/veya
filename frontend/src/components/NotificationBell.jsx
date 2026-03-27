import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import socket from '../utils/socket';
import { useLocation, useNavigate } from 'react-router-dom';

const getIconForType = (type) => {
  switch(type) {
    case 'invoice_paid': return '💰';
    case 'new_merchant': return '👋';
    case 'ticket_reply': return '💬';
    case 'new_ticket': return '🎫';
    case 'large_settlement': return '🐳';
    default: return '🔔';
  }
};

const normalizeLink = (link) => {
  if (link === '/dashboard/support') return '/dashboard?page=support';
  if (link === '/dashboard/invoices') return '/dashboard?page=invoices';
  return link;
};

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load initial notifications on mount
  useEffect(() => {
    fetchNotifications();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Set up socket listener
  useEffect(() => {
    const handleNewNotification = (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 50));
      setUnreadCount(prev => prev + 1);
      // Optional: Fire a toast here if needed
    };

    socket.on('notification', handleNewNotification);
    
    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to parse notifications:', error);
    }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await api.patch('/notifications/mark-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  useEffect(() => {
    const currentLink = `${location.pathname}${location.search || ''}`;
    const matchingUnread = notifications.filter(n => !n.isRead && normalizeLink(n.link) === currentLink);
    if (matchingUnread.length === 0) return;

    matchingUnread.forEach((notif) => {
      markNotificationRead(notif.id);
    });
  }, [location.pathname, location.search, notifications]);

  const handleNotifClick = async (notif) => {
    setIsOpen(false);
    if (!notif.isRead) {
      await markNotificationRead(notif.id);
    }
    const targetLink = normalizeLink(notif.link);
    if (targetLink) {
      navigate(targetLink);
    }
  };

  return (
    <div className="vd-icon-btn" ref={dropdownRef} onClick={() => setIsOpen(!isOpen)} style={{ position: 'relative' }}>
      🔔
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          background: 'var(--red, #ef4444)',
          color: 'white',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '2px 5px',
          borderRadius: '10px',
          border: '1.5px solid var(--bg, #0a0a0b)',
          lineHeight: 1
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '48px',
          right: '-10px',
          width: '320px',
          background: 'var(--bg2, #111114)',
          border: '1px solid var(--border, #ffffff18)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          zIndex: 100,
          cursor: 'default'
        }} onClick={e => e.stopPropagation()}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg3, #18181d)',
            borderTopLeftRadius: '12px', borderTopRightRadius: '12px'
          }}>
            <strong style={{ fontSize: '14px', color: 'var(--text)' }}>Notifications</strong>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                style={{ background: 'none', border:'none', color: 'var(--gold, #f5a623)', fontSize:'11px', cursor:'pointer', padding: 0 }}
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div style={{ maxHeight: '350px', overflowY: 'auto', padding: '10px 0' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text3)', fontSize: '12px' }}>
                You have no notifications yet.
              </div>
            ) : notifications.map(notif => (
              <div 
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  gap: '12px',
                  cursor: notif.link ? 'pointer' : 'default',
                  background: notif.isRead ? 'transparent' : 'rgba(245, 166, 35, 0.04)',
                  borderLeft: notif.isRead ? '2px solid transparent' : '2px solid var(--gold, #f5a623)',
                  transition: 'background 0.2s',
                  alignItems: 'flex-start'
                }}
                onMouseOver={(e) => { if(notif.link) e.currentTarget.style.background = 'var(--bg3)'; }}
                onMouseOut={(e) => { if(notif.link) e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(245, 166, 35, 0.04)'; }}
              >
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg3)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {getIconForType(notif.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0, marginTop: '-2px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: notif.isRead ? 'var(--text, #f0ede8)' : 'var(--gold, #f5a623)' }}>
                    {notif.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text2, #9e9b94)', marginTop: '4px', lineHeight: '1.4' }}>
                    {notif.body}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text3, #5a5750)', marginTop: '6px', fontFamily: "'JetBrains Mono', monospace" }}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
