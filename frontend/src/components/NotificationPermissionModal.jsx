import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermission } from '../firebase';

export default function NotificationPermissionModal() {
  const [showModal, setShowModal] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof Notification !== 'undefined' &&
        Notification.permission === 'default' &&
        isLoggedIn) {
        setShowModal(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  const handleAllow = async () => {
    try {
      const result = await requestNotificationPermission();
      if (result?.granted) {
        setPermissionStatus('granted');
      } else {
        setPermissionStatus('denied');
      }
    } catch (e) {
      console.error('Notification permission error:', e);
    } finally {
      setShowModal(false);
    }
  };

  const handleMaybeLater = () => {
    setShowModal(false);
  };

  if (!showModal || permissionStatus !== 'default') return null;

  return ReactDOM.createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleMaybeLater();
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          width: '100%',
          borderRadius: '24px',
          boxShadow: '0 30px 100px rgba(0,0,0,0.4)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--b)',
          pointerEvents: 'auto',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '32px 32px 28px', textAlign: 'center', overflowY: 'auto' }}>
          {/* Bell icon */}
          <div style={{
            width: '64px', height: '64px', margin: '0 auto 24px',
            borderRadius: '20px', backgroundColor: 'rgba(201,168,76,0.1)',
            border: '1px solid var(--b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="var(--p)">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          <h2 style={{ color: 'var(--t)', fontSize: '20px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            Enable Intelligence
          </h2>
          <p style={{ color: 'var(--tl)', fontSize: '12px', marginBottom: '32px', lineHeight: 1.6, opacity: 0.6, fontWeight: 500 }}>
            Authorize push protocols to synchronize real-time updates and exclusive catalytic offers.
          </p>

          {/* Features list */}
          <div style={{ textAlign: 'left', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { title: 'Strategic Alerts', desc: 'Real-time synchronization of system events' },
              { title: 'Catalytic Offers', desc: 'Exclusive discount protocols for nodes' },
              { title: 'Flow Monitoring', desc: 'Instant updates on logistical deployment' },
            ].map(({ title, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ marginTop: '3px' }}>
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="var(--p)">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: 'var(--t)', fontSize: '13px', fontWeight: 700, margin: 0, textTransform: 'uppercase' }}>{title}</p>
                  <p style={{ color: 'var(--tl)', fontSize: '11px', margin: '2px 0 0', opacity: 0.5, fontWeight: 500 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleMaybeLater();
              }}
              style={{
                flex: 1,
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid var(--b)',
                backgroundColor: 'var(--bg-alt)',
                color: 'var(--tl)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                pointerEvents: 'auto',
              }}
            >
              Later
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAllow();
              }}
              style={{
                flex: 2,
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--p)',
                color: '#040404',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                pointerEvents: 'auto',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
              }}
            >
              Authorize
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}