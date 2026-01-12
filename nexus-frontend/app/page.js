"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Activity, RefreshCw, FileText, CheckCircle, AlertCircle, History, Lock, Server } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:5000/api";

export default function Home() {
  const [data, setData] = useState({ files: [], logs: [], health_score: 100, repair_total: 0, system_status: 'STABLE' });
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api = axios.create({
    baseURL: API_BASE,
    timeout: 8000,
  });

  const fetchData = async () => {
    try {
      const res = await api.get('/dashboard-stats');
      const payload = res?.data || {};
      setData({
        files: Array.isArray(payload.files) ? payload.files : [],
        logs: Array.isArray(payload.logs) ? payload.logs : [],
        health_score: typeof payload.health_score === 'number' ? payload.health_score : 100,
        repair_total: typeof payload.repair_total === 'number' ? payload.repair_total : 0,
        system_status: typeof payload.system_status === 'string' ? payload.system_status : 'STABLE',
      });
    } catch (err) {
      console.error("Sentinel API Offline:", err?.message || err);
    }
  };

  const triggerScan = async () => {
    setScanning(true);
    try {
      await api.post('/scan');
      await fetchData();
    } catch (err) {
      console.error("Scan Failed:", err?.message || err);
    } finally {
      setScanning(false);
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return '—';
    try {
      if (typeof ts === 'string') return new Date(ts).toLocaleString();
      if (typeof ts === 'number') return new Date(ts).toLocaleString();
      if (ts?.seconds) return new Date(ts.seconds * 1000).toLocaleString();
      return '—';
    } catch {
      return '—';
    }
  };

  const statusClass = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'healthy') return 'healthy';
    if (s === 'repaired') return 'repaired';
    if (s.includes('corrupt') || s.includes('fail')) return 'corrupted';
    return 'healthy';
  };

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: '260px', borderRight: '1px solid #27272a', padding: '30px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '50px' }}>
          <Shield size={28} />
          <span style={{ fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.05em' }}>SENTINEL v1.0</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavBtn label="Overview" icon={<Activity size={18}/>} active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <NavBtn label="Storage Nodes" icon={<Server size={18}/>} active={activeTab === 'Nodes'} onClick={() => setActiveTab('Nodes')} />
          <NavBtn label="Security Logs" icon={<History size={18}/>} active={activeTab === 'Logs'} onClick={() => setActiveTab('Logs')} />
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px', background: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '5px' }}>CLOUD STATUS</div>
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></div>
            GCP-US-CENTRAL
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: '260px', flex: 1, padding: '40px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>Infrastructure Health</h1>
            <p style={{ color: '#a1a1aa', marginTop: '5px' }}>Automated SHA-256 integrity enforcement active.</p>
          </div>
          <button onClick={triggerScan} disabled={scanning} className="scan-btn" aria-busy={scanning} aria-live="polite">
            <RefreshCw size={18} className={scanning ? 'spin' : ''} /> 
            {scanning ? 'AUDITING...' : 'Run Global Audit'}
          </button>
        </header>

        {activeTab === 'Overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
              <StatCard title="Integrity Score" value={`${data.health_score}%`} icon={<CheckCircle color="#10b981"/>} />
              <StatCard title="Active Files" value={data.files.length} icon={<FileText color="#3b82f6"/>} />
              <StatCard title="Total Heals" value={data.repair_total} icon={<Activity color="#8b5cf6"/>} />
              <StatCard title="System Status" value={data.health_score < 100 ? "DEGRADED" : "OPERATIONAL"} color={data.health_score < 100 ? "#ef4444" : "#10b981"} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px' }}>
              <div className="glass-card">
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>File Registry</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ color: '#71717a', fontSize: '0.8rem', borderBottom: '1px solid #27272a' }}>
                      <th style={{ padding: '12px 0' }}>IDENTIFIER</th><th>STATUS</th><th>INTEGRITY HASH</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.files.map((f, i) => (
                      <tr key={`${f.file || 'file'}-${i}`} style={{ borderBottom: '1px solid #18181b' }}>
                        <td style={{ padding: '16px 0', fontSize: '0.9rem', fontWeight: '500' }}>{f.file || '—'}</td>
                        <td>
                          <span className={`badge ${statusClass(f.status)}`}>{String(f.status || 'healthy').toUpperCase()}</span>
                        </td>
                        <td style={{ color: '#71717a', fontSize: '0.8rem' }}>
                          {typeof f.hash === 'string' && f.hash.length > 0 ? `${f.hash.substring(0, 16)}...` : '—'}
                        </td>
                      </tr>
                    ))}
                    {data.files.length === 0 && (
                      <tr><td colSpan={3} style={{ padding: '16px 0', color: '#71717a' }}>No files registered.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="glass-card">
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {data.logs.slice(0, 6).map((log, i) => {
                    const sev = String(log.severity || '').toUpperCase();
                    const borderColor = sev === 'HIGH' || sev === 'CRITICAL' ? '#ef4444' : '#27272a';
                    return (
                      <div key={`log-${i}`} style={{ borderLeft: `2px solid ${borderColor}`, paddingLeft: '15px' }}>
                        <div style={{ fontSize: '0.7rem', color: '#71717a' }}>{formatTimestamp(log.timestamp)}</div>
                        <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>{String(log.event || 'EVENT')}: {String(log.action || 'ACTION')}</div>
                      </div>
                    );
                  })}
                  {data.logs.length === 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#71717a' }}>No recent activity.</div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Nodes' && (
          <div className="glass-card">
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>GCP Storage Clusters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ padding: '20px', border: '1px solid #27272a', borderRadius: '8px' }}>
                <strong>us-central1-a (Primary)</strong>
                <p style={{ fontSize: '0.8rem', color: '#71717a' }}>Status: Operational | Latency: 12ms</p>
              </div>
              <div style={{ padding: '20px', border: '1px solid #27272a', borderRadius: '8px' }}>
                <strong>europe-west1-b (Mirror)</strong>
                <p style={{ fontSize: '0.8rem', color: '#71717a' }}>Status: Operational | Latency: 88ms</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Logs' && (
          <div className="glass-card">
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Full Security Audit</h3>
            {data.logs.map((log, i) => (
              <div key={`audit-${i}`} style={{ padding: '12px 0', borderBottom: '1px solid #18181b', fontSize: '0.85rem' }}>
                <span style={{ color: '#71717a' }}>[{formatTimestamp(log.timestamp)}]</span> <strong>{String(log.event || 'EVENT')}</strong> - {String(log.action || 'ACTION')}
              </div>
            ))}
            {data.logs.length === 0 && <div style={{ color: '#71717a' }}>No audit events.</div>}
          </div>
        )}
      </main>

      <style jsx>{`
        .glass-card { background: #18181b; padding: 24px; border-radius: 12px; border: 1px solid #27272a; }
        .scan-btn {
          background: #fafafa;
          color: black;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: 0.2s;
        }
        .scan-btn:hover { background: #d4d4d8; }
        .scan-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: bold; }
        .badge.healthy { background: #064e3b; color: #10b981; }
        .badge.repaired { background: #1e3a8a; color: #3b82f6; }
        .badge.corrupted { background: #7f1d1d; color: #ef4444; }
      `}</style>
    </div>
  );
}

const NavBtn = ({ label, icon, active, onClick }) => (
  <div
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
    style={{ 
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', 
      cursor: 'pointer', transition: '0.2s', fontSize: '0.9rem',
      backgroundColor: active ? '#18181b' : 'transparent', color: active ? 'white' : '#71717a'
    }}
  >
    {icon} {label}
  </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <div style={{ color: '#71717a', fontSize: '0.8rem', marginBottom: '5px' }}>{title}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: color || 'white' }}>{value}</div>
    </div>
    {icon}
  </div>
);