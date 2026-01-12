"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Activity, RefreshCw, FileText, CheckCircle, AlertCircle, HardDrive, History, Lock, Server, Globe, Database } from 'lucide-react';
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

  // --- TAB CONTENT RENDERERS ---

  const renderOverview = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        <StatCard title="Integrity Score" value={`${data.health_score}%`} icon={<CheckCircle color="#10b981"/>} />
        <StatCard title="Active Files" value={data.files.length} icon={<FileText color="#3b82f6"/>} />
        <StatCard title="Total Heals" value={data.repair_total} icon={<Activity color="#8b5cf6"/>} />
        <StatCard title="System Status" value={data.health_score < 100 ? "DEGRADED" : "OPERATIONAL"} color={data.health_score < 100 ? "#ef4444" : "#10b981"} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
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
                      <span className={`badge badge-${f.status}`}>{f.status.toUpperCase()}</span>
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
            <History size={20} color="#8b5cf6"/> Recent Incidents
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {data.logs.slice(0, 5).map((log, i) => (
              <div key={i} style={{ borderLeft: `2px solid ${log.severity === 'HIGH' ? '#ef4444' : '#27272a'}`, paddingLeft: '20px' }}>
                <div style={{ fontSize: '0.75rem', color: '#71717a' }}>{log.timestamp}</div>
                <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>{log.event}: {log.action}</div>
              </div>
            ))}
            {data.logs.length === 0 && <p style={{color: '#3f3f46'}}>No recent activity.</p>}
          </div>
        </div>
      </div>
    </>
  );

  const renderNodes = () => (
    <div className="glass-card">
      <h3 style={{ marginTop: 0, marginBottom: '10px' }}><Globe size={20} color="#3b82f6"/> GCP Distributed Clusters</h3>
      <p style={{ color: '#71717a', marginBottom: '30px', fontSize: '0.9rem' }}>Real-time status of storage shards across global regions.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <NodeCard title="GCP-US-CENTRAL-1" region="Iowa, USA" status="PRIMARY" lat="14ms" load="24%" />
        <NodeCard title="GCP-EUROPE-WEST-4" region="Netherlands" status="MIRROR" lat="82ms" load="12%" />
        <NodeCard title="GCP-ASIA-SOUTH-1" region="Mumbai, India" status="REPLICA" lat="124ms" load="8%" />
        <NodeCard title="SENTINEL-HEAL-COMPUTE" region="Global Edge" status="ACTIVE" lat="2ms" load="42%" />
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="glass-card">
      <h3 style={{ marginTop: 0, marginBottom: '10px' }}><Database size={20} color="#8b5cf6"/> Full System Audit Log</h3>
      <p style={{ color: '#71717a', marginBottom: '20px', fontSize: '0.9rem' }}>Immutable record of integrity scans and autonomous repairs.</p>
      
      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: '#71717a', fontSize: '0.85rem', borderBottom: '1px solid #27272a' }}>
              <th style={{ padding: '12px' }}>TIMESTAMP</th>
              <th style={{ padding: '12px' }}>EVENT TYPE</th>
              <th style={{ padding: '12px' }}>ACTION TAKEN</th>
              <th style={{ padding: '12px' }}>SEVERITY</th>
            </tr>
          </thead>
          <tbody>
            {data.logs.map((log, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #18181b', fontSize: '0.9rem' }}>
                <td style={{ padding: '14px 12px', color: '#71717a' }}>{log.timestamp}</td>
                <td style={{ padding: '14px 12px', fontWeight: 'bold' }}>{log.event}</td>
                <td style={{ padding: '14px 12px' }}>{log.action}</td>
                <td style={{ padding: '14px 12px' }}>
                    <span style={{ 
                        color: log.severity === 'HIGH' ? '#ef4444' : '#10b981',
                        fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                        ● {log.severity || 'INFO'}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa' }}>
      
      <style jsx global>{`
        * { box-sizing: border-box; }
        .pulse-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; border: 1px solid; }
        .badge-healthy { background: #064e3b33; color: #34d399; border-color: #064e3b; }
        .badge-repaired { background: #1e3a8a33; color: #60a5fa; border-color: #1e3a8a; }
        .badge-corrupted { background: #7f1d1d33; color: #f87171; border-color: #7f1d1d; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={{ 
        width: '260px', borderRight: '1px solid #27272a', padding: '30px', 
        display: 'flex', flexDirection: 'column', position: 'fixed', 
        top: 0, bottom: 0, left: 0, zIndex: 100, backgroundColor: '#09090b', boxSizing: 'border-box' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '40px' }}>
          <Shield size={28} />
          <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.05em' }}>SENTINEL v1.0</span>
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
      <main style={{ marginLeft: '260px', flex: 1, padding: '50px', boxSizing: 'border-box', width: 'calc(100% - 260px)' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '800' }}>{activeTab === 'Overview' ? 'Infrastructure Health' : activeTab === 'Nodes' ? 'Storage Nodes' : 'Audit Logs'}</h1>
            <p style={{ color: '#a1a1aa', marginTop: '8px' }}>{activeTab === 'Overview' ? 'Automated integrity enforcement active.' : 'Viewing system-wide cluster data.'}</p>
          </div>
          <button 
            onClick={triggerScan} disabled={scanning} 
            style={{
                background: '#fafafa', color: 'black', border: 'none', padding: '12px 24px', 
                borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', 
                alignItems: 'center', gap: '10px', transition: '0.2s'
            }}
          >
            <RefreshCw size={18} className={scanning ? 'spin' : ''} /> 
            {scanning ? 'AUDITING...' : 'Run Global Audit'}
          </button>
        </header>

        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Nodes' && renderNodes()}
        {activeTab === 'Logs' && renderLogs()}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const NavBtn = ({ label, icon, active, onClick }) => (
  <div onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', 
    cursor: 'pointer', transition: '0.2s', fontSize: '0.95rem',
    backgroundColor: active ? '#18181b' : 'transparent', color: active ? 'white' : '#71717a'
  }}> {icon} {label} </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111113', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
    <div>
      <div style={{ color: '#71717a', fontSize: '0.85rem', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: color || 'white' }}>{value}</div>
    </div>
    <div style={{ padding: '10px', background: '#18181b', borderRadius: '10px' }}>{icon}</div>
  </div>
);

const NodeCard = ({ title, region, status, lat, load }) => (
    <div style={{ padding: '25px', border: '1px solid #27272a', borderRadius: '16px', background: '#111113' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <strong style={{ fontSize: '1.1rem' }}>{title}</strong>
            <Server size={18} color="#71717a" />
        </div>
        <div style={{ fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '5px' }}>Location: {region}</div>
        <div style={{ fontSize: '0.85rem', color: '#10b981', marginBottom: '15px' }}>● {status}</div>
        <div style={{ display: 'flex', gap: '15px', borderTop: '1px solid #27272a', paddingTop: '15px' }}>
            <div><small style={{ color: '#71717a' }}>LATENCY</small><br/>{lat}</div>
            <div><small style={{ color: '#71717a' }}>CURR. LOAD</small><br/>{load}</div>
        </div>
    </div>
);
