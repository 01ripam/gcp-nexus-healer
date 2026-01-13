"use client";

import React, { useState, useEffect } from 'react';
import { 
  Shield, Activity, RefreshCw, FileText, CheckCircle, 
  AlertCircle, Cpu, History, Globe, Database, Server, 
  Layers, HardDrive, ShieldCheck
} from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const [data, setData] = useState({ files: [], logs: [], health_score: 100, repair_total: 0, insight: "" });
  const [scanning, setScanning] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [mounted, setMounted] = useState(false);
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    const host = window.location.hostname;
    setApiUrl(`http://${host}:5000/api`);
  }, []);

  useEffect(() => {
    if (apiUrl) {
      refreshData();
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [apiUrl]);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${apiUrl}/dashboard-stats`);
      const ai = await axios.get(`${apiUrl}/ai-insights`);
      setData(prev => ({ ...prev, ...res.data, insight: ai.data.insight }));
    } catch (e) { console.warn("Backend Syncing..."); }
  };

  const refreshData = () => fetchStats();

  const triggerScan = async () => {
    setScanning(true);
    try {
      await axios.post(`${apiUrl}/scan`);
      await fetchStats();
    } catch (e) {
      alert("Error connecting to Python backend!");
    }
    setScanning(false);
  };

  if (!mounted) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#09090b', color: '#fafafa', fontFamily: '"Inter", sans-serif' }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .glass-card {
          background: #111113;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 24px;
        }

        .badge {
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid transparent;
        }
        .healthy { background: #064e3b33; color: #34d399; border: 1px solid #064e3b; }
        .repaired { background: #1e3a8a33; color: #60a5fa; border: 1px solid #1e3a8a; }
        .at_risk { background: #7f1d1d33; color: #f87171; border: 1px solid #7f1d1d; }

        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>
      
      {/* SIDEBAR */}
      <aside style={{ 
        width: '280px', borderRight: '1px solid #27272a', padding: '40px 30px', 
        position: 'fixed', height: '100vh', backgroundColor: '#09090b', zIndex: 100 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981', marginBottom: '50px' }}>
          <Shield size={32} fill="#10b98122" />
          <span style={{ fontWeight: '800', fontSize: '1.5rem', letterSpacing: '-0.05em' }}>SENTINEL v1.0</span>
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <NavBtn label="Overview" icon={<Activity size={20}/>} active={activeTab === 'Overview'} onClick={() => setActiveTab('Overview')} />
          <NavBtn label="Storage Nodes" icon={<Server size={20}/>} active={activeTab === 'Nodes'} onClick={() => setActiveTab('Nodes')} />
          <NavBtn label="Security Logs" icon={<History size={20}/>} active={activeTab === 'Logs'} onClick={() => setActiveTab('Logs')} />
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px', background: '#18181b', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ fontSize: '0.65rem', color: '#71717a', fontWeight: 'bold', marginBottom: '8px', letterSpacing: '1px' }}>SYSTEM PULSE</div>
          <div style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
            <div className="pulse-dot"></div>
            GCP-US-CENTRAL
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ marginLeft: '280px', flex: 1, padding: '60px 60px', width: 'calc(100% - 280px)' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '-0.02em' }}>{activeTab}</h1>
            <p style={{ color: '#a1a1aa', marginTop: '6px', fontSize: '1.1rem' }}>GCP-powered autonomous integrity enforcement.</p>
          </div>
          <button onClick={triggerScan} disabled={scanning} style={scanBtnStyle}>
            <RefreshCw size={20} className={scanning ? 'spin' : ''} /> {scanning ? 'SCANNING...' : 'Run Global Audit'}
          </button>
        </header>

        {activeTab === 'Overview' && (
          <>
            {/* AI ANALYST */}
            <div style={{ 
              background: 'linear-gradient(90deg, #064e3b22 0%, #022c2233 100%)', 
              border: '1px solid #064e3b', padding: '24px', borderRadius: '16px', 
              marginBottom: '40px', display: 'flex', gap: '20px', alignItems: 'center' 
            }}>
              <div style={{ background: '#10b98122', padding: '12px', borderRadius: '12px' }}>
                <Cpu color="#10b981" size={28} />
              </div>
              <div>
                <span style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: '900', letterSpacing: '0.1em' }}>AI SECURITY ANALYST</span>
                <p style={{ fontStyle: 'italic', color: '#e2e2e2', marginTop: '4px', fontSize: '1.05rem' }}>"{data.insight || "AI Sentinel monitoring system-wide shards..."}"</p>
              </div>
            </div>

            {/* STATS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
              <StatCard title="Integrity Score" value={data.health_score + "%"} icon={<ShieldCheck size={24} color="#10b981"/>} />
              <StatCard title="Monitored Files" value={data.files.length} icon={<FileText size={24} color="#3b82f6"/>} />
              <StatCard title="Total Heals" value={data.repair_total} icon={<RefreshCw size={24} color="#8b5cf6"/>} />
              <StatCard title="Threat Level" value={data.health_score < 100 ? "HIGH" : "MINIMAL"} color={data.health_score < 100 ? "#ef4444" : "#10b981"} icon={<AlertCircle size={24} color={data.health_score < 100 ? "#ef4444" : "#10b981"}/>} />
            </div>

            {/* FILE REGISTRY TABLE */}
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={20} color="#10b981" /> File Registry
              </h3>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ color: '#71717a', fontSize: '0.8rem', borderBottom: '1px solid #27272a' }}>
                    <th style={{ padding: '0 15px 15px 15px' }}>IDENTIFIER</th>
                    <th style={{ padding: '0 15px 15px 15px' }}>STATUS</th>
                    <th style={{ padding: '0 15px 15px 15px' }}>SHA-256 HASH</th>
                  </tr>
                </thead>
                <tbody>
                  {data.files.map((f, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #18181b' }}>
                      <td style={{ padding: '20px 15px', fontWeight: '600' }}>{f.file}</td>
                      <td style={{ padding: '20px 15px' }}>
                        <span className={`badge ${f.status === 'at_risk' ? 'at_risk' : f.status === 'repaired' ? 'repaired' : 'healthy'}`}>
                          {f.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '20px 15px', color: '#71717a', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        {f.hash?.substring(0, 16)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'Nodes' && (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
             <NodeCard name="GCP-US-CENTRAL" region="Iowa, USA" load="24%" status="Primary" lat="12ms" />
             <NodeCard name="GCP-EUROPE-WEST" region="Belgium" load="12%" status="Mirror" lat="84ms" />
             <NodeCard name="GCP-ASIA-SOUTH" region="Mumbai, India" load="8%" status="Standby" lat="122ms" />
           </div>
        )}

        {activeTab === 'Logs' && (
           <div className="glass-card">
             <h3 style={{marginBottom: '25px'}}>Global Audit Ledger</h3>
             <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {data.logs.map((l, i) => (
                <div key={i} style={{ padding: '18px 0', borderBottom: '1px solid #18181b', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ color: l.severity === 'HIGH' ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>[{l.timestamp}]</div>
                      <div>{l.event} - {l.action}</div>
                    </div>
                    <span style={{ color: '#71717a', fontSize: '0.85rem' }}>{l.file}</span>
                </div>
                ))}
             </div>
           </div>
        )}
      </main>
    </div>
  );
}

const NavBtn = ({ label, icon, active, onClick }) => (
  <button onClick={onClick} style={{ 
    display: 'flex', alignItems: 'center', gap: '15px', padding: '14px 20px', borderRadius: '12px', 
    cursor: 'pointer', border: 'none', width: '100%', textAlign: 'left', transition: '0.2s',
    backgroundColor: active ? '#18181b' : 'transparent', 
    color: active ? '#fff' : '#71717a',
    fontWeight: active ? '600' : '400'
  }}> {icon} {label} </button>
);

const StatCard = ({ title, value, icon, color }) => (
  <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ color: '#71717a', fontSize: '0.8rem', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase' }}>{title}</div>
      <div style={{ fontSize: '2rem', fontWeight: '800', color: color || 'white' }}>{value}</div>
    </div>
    <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05, transform: 'scale(2.5)' }}>
      {icon}
    </div>
  </div>
);

const NodeCard = ({ name, region, load, status, lat }) => (
  <div className="glass-card">
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom: '20px'}}>
        <div>
            <div style={{ fontWeight: '800', fontSize:'1.1rem' }}>{name}</div>
            <div style={{ fontSize: '0.85rem', color: '#71717a', marginTop: '4px' }}>{region}</div>
        </div>
        <span style={{fontSize:'0.7rem', fontWeight:'900', color:'#10b981', background:'#10b98111', padding:'6px 12px', borderRadius:'8px', border: '1px solid #10b98144'}}>{status}</span>
    </div>
    <div style={{ display:'flex', justifyContent:'space-between', borderTop:'1px solid #27272a', paddingTop:'20px' }}>
        <div><small style={{color:'#71717a', display:'block', marginBottom: '4px', fontWeight: '700'}}>LATENCY</small><span style={{fontWeight: '700'}}>{lat}</span></div>
        <div style={{textAlign: 'right'}}><small style={{color:'#71717a', display:'block', marginBottom: '4px', fontWeight: '700'}}>LOAD</small><span style={{fontWeight: '700'}}>{load}</span></div>
    </div>
  </div>
);

const scanBtnStyle = { 
  background: '#fafafa', color: '#000', border: 'none', padding: '14px 28px', 
  borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', 
  alignItems: 'center', gap: '12px', transition: '0.2s'
};