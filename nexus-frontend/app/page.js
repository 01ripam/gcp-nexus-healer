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
      
      {/* Global CSS Fix for Box Sizing */}
      <style jsx global>{`
        * { box-sizing: border-box; }
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .scan-btn:hover { background: #d4d4d8 !important; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ 
        width: '260px', 
        borderRight: '1px solid #27272a', 
        padding: '30px', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'fixed', 
        top: 0, bottom: 0, left: 0,
        zIndex: 100,
        backgroundColor: '#09090b',
        boxSizing: 'border-box' // THIS FIXES THE OVERLAP
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

      {/* MAIN CONTENT */}
      <main style={{ 
        marginLeft: '260px', 
        flex: 1, 
        padding: '50px', // Increased padding for more breathing room
        minWidth: 0,
        boxSizing: 'border-box' 
      }}>
        <header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '40px', 
            width: '100%',
            gap: '20px'
        }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>Infrastructure Health</h1>
            <p style={{ color: '#a1a1aa', marginTop: '8px', fontSize: '1rem' }}>Automated SHA-256 integrity enforcement active.</p>
          </div>
          <button 
            onClick={triggerScan} 
            disabled={scanning} 
            style={{
                background: '#fafafa',
                color: 'black',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: '0.2s',
                marginTop: '5px'
            }}
          >
            <RefreshCw size={18} className={scanning ? 'spin' : ''} /> 
            {scanning ? 'AUDITING...' : 'Run Global Audit'}
          </button>
        </header>

        {activeTab === 'Overview' && (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '24px', 
              marginBottom: '40px' 
            }}>
              <StatCard title="Integrity Score" value={`${data.health_score}%`} icon={<CheckCircle color="#10b981"/>} />
              <StatCard title="Active Files" value={data.files.length} icon={<FileText color="#3b82f6"/>} />
              <StatCard title="Total Heals" value={data.repair_total} icon={<Activity color="#8b5cf6"/>} />
              <StatCard title="System Status" value={data.health_score < 100 ? "DEGRADED" : "OPERATIONAL"} color={data.health_score < 100 ? "#ef4444" : "#10b981"} />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
              gap: '30px' 
            }}>
              <div className="glass-card">
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} color="#10b981"/> File Registry
                </h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ color: '#71717a', fontSize: '0.85rem', borderBottom: '1px solid #27272a' }}>
                            <th style={{ padding: '12px 10px' }}>IDENTIFIER</th>
                            <th style={{ padding: '12px 10px' }}>STATUS</th>
                            <th style={{ padding: '12px 10px' }}>INTEGRITY HASH</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.files.map((f, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #18181b' }}>
                            <td style={{ padding: '16px 10px', fontSize: '0.95rem', fontWeight: '500' }}>{f.file}</td>
                            <td style={{ padding: '16px 10px' }}>
                                <span style={{ 
                                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', border: '1px solid',
                                    backgroundColor: f.status === 'healthy' ? '#064e3b33' : '#7f1d1d33',
                                    color: f.status === 'healthy' ? '#34d399' : '#f87171',
                                    borderColor: f.status === 'healthy' ? '#064e3b' : '#7f1d1d'
                                }}>
                                    {f.status.toUpperCase()}
                                </span>
                            </td>
                            <td style={{ padding: '16px 10px', color: '#71717a', fontSize: '0.85rem', fontFamily: 'monospace' }}>{f.hash?.substring(0, 14)}...</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
              </div>

              <div className="glass-card">
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <History size={20} color="#8b5cf6"/> Security Audit
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {data.logs.slice(0, 6).map((log, i) => (
                    <div key={i} style={{ borderLeft: `2px solid ${log.severity === 'HIGH' ? '#ef4444' : '#27272a'}`, paddingLeft: '20px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{log.timestamp}</div>
                      <div style={{ fontSize: '0.9rem', marginTop: '4px', color: '#e4e4e7' }}>{log.event}: {log.action}</div>
                    </div>
                  ))}
                  {data.logs.length === 0 && <p style={{color: '#3f3f46'}}>No recent activity detected.</p>}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Other tabs follow same logic */}
      </main>

      <style jsx>{`
        .glass-card { background: #111113; padding: 30px; border-radius: 16px; border: 1px solid #27272a; }
      `}</style>
    </div>
  );
}

const NavBtn = ({ label, icon, active, onClick }) => (
  <div onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', 
    cursor: 'pointer', transition: '0.2s', fontSize: '0.95rem',
    backgroundColor: active ? '#18181b' : 'transparent', color: active ? 'white' : '#71717a'
  }}> {icon} {label} </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <div style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '8px', fontWeight: '500' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: color || 'white' }}>{value}</div>
    </div>
    <div style={{ padding: '10px', background: '#18181b', borderRadius: '10px' }}>{icon}</div>
  </div>
);
