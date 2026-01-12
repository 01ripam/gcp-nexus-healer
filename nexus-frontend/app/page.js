"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Activity, RefreshCw, FileText, CheckCircle, AlertCircle, HardDrive, History, Lock, Server } from 'lucide-react';
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
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/dashboard-stats`);
      setData(res.data);
    } catch (err) { console.error("Sentinel API Offline"); }
  };

  const triggerScan = async () => {
    setScanning(true);
    try { await axios.post(`${API_BASE}/scan`); fetchData(); } catch (err) { }
    setTimeout(() => setScanning(false), 800);
  };

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa' }}>
      
      {/* SIDEBAR - Fixed width but responsive height */}
      <aside style={{ 
        width: '260px', 
        borderRight: '1px solid #27272a', 
        padding: '30px', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'fixed', 
        top: 0, bottom: 0, left: 0,
        zIndex: 100,
        backgroundColor: '#09090b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '40px' }}>
          <Shield size={28} />
          <span style={{ fontWeight: '800', fontSize: '1.3rem', letterSpacing: '-0.05em' }}>SENTINEL v1.0</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <NavBtn label="Overview" icon={<Activity size={18}/>} active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <NavBtn label="Storage Nodes" icon={<Server size={18}/>} active={activeTab === 'Nodes'} onClick={() => setActiveTab('Nodes')} />
          <NavBtn label="Security Logs" icon={<History size={18}/>} active={activeTab === 'Logs'} onClick={() => setActiveTab('Logs')} />
        </nav>

        <div style={{ padding: '15px', background: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '0.7rem', color: '#71717a', marginBottom: '5px' }}>CLOUD STATUS</div>
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="pulse-dot"></div>
            GCP-US-CENTRAL
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT - Added responsive padding and margin */}
      <main style={{ 
        marginLeft: '260px', 
        flex: 1, 
        padding: '40px', 
        width: 'calc(100% - 260px)', // Ensures main content doesn't "overlap" the sidebar
        boxSizing: 'border-box' 
      }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700' }}>Infrastructure Health</h1>
            <p style={{ color: '#a1a1aa', marginTop: '5px' }}>Automated SHA-256 integrity enforcement active.</p>
          </div>
          <button onClick={triggerScan} disabled={scanning} className="scan-btn">
            <RefreshCw size={18} className={scanning ? 'spin' : ''} /> 
            {scanning ? 'AUDITING...' : 'Run Global Audit'}
          </button>
        </header>

        {activeTab === 'Overview' && (
          <>
            {/* STAT CARDS - Changed to auto-fit to prevent squashing/overlap */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '20px', 
              marginBottom: '40px' 
            }}>
              <StatCard title="Integrity Score" value={`${data.health_score}%`} icon={<CheckCircle color="#10b981"/>} />
              <StatCard title="Active Files" value={data.files.length} icon={<FileText color="#3b82f6"/>} />
              <StatCard title="Total Heals" value={data.repair_total} icon={<Activity color="#8b5cf6"/>} />
              <StatCard title="System Status" value={data.health_score < 100 ? "DEGRADED" : "OPERATIONAL"} color={data.health_score < 100 ? "#ef4444" : "#10b981"} />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
              gap: '30px' 
            }}>
              <div className="glass-card" style={{ minWidth: '0' }}> {/* minWidth: 0 fixes flex/grid overlap */}
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>File Registry</h3>
                <div style={{ overflowX: 'auto' }}> {/* Allow table to scroll if too wide */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '400px' }}>
                    <thead>
                        <tr style={{ color: '#71717a', fontSize: '0.8rem', borderBottom: '1px solid #27272a' }}>
                        <th style={{ padding: '12px 8px' }}>IDENTIFIER</th>
                        <th style={{ padding: '12px 8px' }}>STATUS</th>
                        <th style={{ padding: '12px 8px' }}>INTEGRITY HASH</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.files.map((f, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #18181b' }}>
                            <td style={{ padding: '16px 8px', fontSize: '0.9rem', fontWeight: '500' }}>{f.file}</td>
                            <td style={{ padding: '16px 8px' }}><span className={`badge badge-${f.status}`}>{f.status.toUpperCase()}</span></td>
                            <td style={{ padding: '16px 8px', color: '#71717a', fontSize: '0.8rem', fontFamily: 'monospace' }}>{f.hash?.substring(0, 12)}...</td>
                        </tr>
                        ))}
                        {data.files.length === 0 && <tr><td colSpan="3" style={{padding: '20px', textAlign: 'center', color: '#444'}}>No files registered. Run seed_data.py</td></tr>}
                    </tbody>
                    </table>
                </div>
              </div>

              <div className="glass-card" style={{ minWidth: '0' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Recent Activity</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {data.logs.slice(0, 6).map((log, i) => (
                    <div key={i} style={{ borderLeft: `2px solid ${log.severity === 'HIGH' ? '#ef4444' : '#27272a'}`, paddingLeft: '15px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#71717a' }}>{log.timestamp}</div>
                      <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>{log.event}: {log.action}</div>
                    </div>
                  ))}
                  {data.logs.length === 0 && <p style={{color: '#444', fontSize: '0.9rem'}}>No recent activity detected.</p>}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Nodes' && (
          <div className="glass-card">
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>GCP Storage Clusters</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <NodeCard title="us-central1-a" status="Primary" lat="12ms" />
              <NodeCard title="europe-west1-b" status="Mirror" lat="88ms" />
              <NodeCard title="asia-east1-a" status="Standby" lat="145ms" />
            </div>
          </div>
        )}
      </main>

      <style jsx global>{`
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .scan-btn { background: #fafafa; color: black; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
        .scan-btn:hover { background: #d4d4d8; }
        .scan-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

const NavBtn = ({ label, icon, active, onClick }) => (
  <div onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', 
    cursor: 'pointer', transition: '0.2s', fontSize: '0.9rem',
    backgroundColor: active ? '#18181b' : 'transparent', color: active ? 'white' : '#71717a'
  }}> {icon} {label} </div>
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

const NodeCard = ({ title, status, lat }) => (
    <div style={{ padding: '20px', border: '1px solid #27272a', borderRadius: '12px', background: '#09090b' }}>
        <strong style={{ display: 'block', marginBottom: '5px' }}>{title}</strong>
        <div style={{ fontSize: '0.8rem', color: '#71717a' }}>Status: {status}</div>
        <div style={{ fontSize: '0.8rem', color: '#10b981' }}>Latency: {lat}</div>
    </div>
);
