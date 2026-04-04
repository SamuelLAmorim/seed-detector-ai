import axios from 'axios';
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS,
  Legend, LinearScale, LineElement, PointElement, Title, Tooltip,
} from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import './App.css';
import Home from './components/Home';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

// ── UTILS ────────────────────────────────────────────────
const getQualityBadge = (pct) => {
  if (pct >= 75) return { label: 'Ótimo', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0', icon: '🟢' };
  if (pct >= 50) return { label: 'Regular', color: '#92400e', bg: '#fffbeb', border: '#fde68a', icon: '🟡' };
  return { label: 'Ruim', color: '#991b1b', bg: '#fff1f1', border: '#fecaca', icon: '🔴' };
};

// ── TOAST ────────────────────────────────────────────────
function Toast({ toasts, onRemove }) {
  return (
    <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 20px', borderRadius: '12px', minWidth: '280px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          background: t.type === 'success' ? '#f0fdf4' : t.type === 'error' ? '#fff1f1' : '#fffbeb',
          border: `1px solid ${t.type === 'success' ? '#bbf7d0' : t.type === 'error' ? '#fecaca' : '#fde68a'}`,
          animation: 'slideInToast 0.3s ease',
        }}>
          <span style={{ fontSize: '1.2rem' }}>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : '⚠️'}</span>
          <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, color: t.type === 'success' ? '#166534' : t.type === 'error' ? '#991b1b' : '#92400e' }}>{t.message}</span>
          <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5 }}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── SKELETON ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="st-metric-card">
      <div style={{ width: '100%', height: '200px', background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div className="card-content" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '16px', borderRadius: '8px', background: '#f0f0f0', width: '60%' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '56px', borderRadius: '8px', background: '#f0f0f0' }} />)}
        </div>
      </div>
    </div>
  );
}

// ── EMPTY STATE ──────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', marginBottom: '28px', boxShadow: '0 8px 32px rgba(46,125,50,0.12)' }}>
        🌱
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1b1f23', marginBottom: '10px', letterSpacing: '-0.5px' }}>Nenhuma análise ainda</h2>
      <p style={{ color: '#667085', maxWidth: '360px', lineHeight: 1.7, fontSize: '0.95rem' }}>
        Carregue imagens de sementes na barra lateral e clique em <strong>Rodar Análise</strong> para começar.
      </p>
    </div>
  );
}

// ── SUMMARY CARDS ────────────────────────────────────────
function SummaryCards({ stats, total, aproveitamento }) {
  const badge = getQualityBadge(aproveitamento);
  const cards = [
    { label: 'Total Sementes', value: total, icon: '🌾', color: '#667085', bg: '#f8f9fb', border: '#e6e9ef' },
    { label: 'Inteiras', value: stats.inteiras, icon: '✅', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
    { label: 'Quebradas', value: stats.quebradas, icon: '⚠️', color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
    { label: 'Predadas', value: stats.predadas, icon: '❌', color: '#991b1b', bg: '#fff1f1', border: '#fecaca' },
    { label: 'Aproveitamento', value: `${aproveitamento}%`, icon: badge.icon, color: badge.color, bg: badge.bg, border: badge.border, extra: badge.label },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '28px' }}>
      {cards.map((c, i) => (
        <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '16px', padding: '18px', animation: `fadeIn 0.4s ease ${i * 60}ms both`, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{c.icon}</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: c.color, letterSpacing: '-1px', lineHeight: 1 }}>{c.value}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '5px' }}>{c.label}</div>
          {c.extra && <div style={{ fontSize: '0.75rem', fontWeight: 700, color: c.color, marginTop: '4px' }}>{c.extra}</div>}
        </div>
      ))}
    </div>
  );
}

// ── GAUGE ────────────────────────────────────────────────
function Gauge({ value }) {
  const badge = getQualityBadge(value);
  const angle = -90 + (value / 100) * 180;
  const r = 70, cx = 90, cy = 90;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcX = cx + r * Math.cos(toRad(angle));
  const arcY = cy + r * Math.sin(toRad(angle));

  const arc = (startDeg, endDeg, color) => {
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="180" height="110" viewBox="0 0 180 110">
        {arc(-180, -60, '#fde68a')}
        {arc(-60, 0, '#bbf7d0')}
        {arc(-180, -120, '#fecaca')}
        <line x1={cx} y1={cy} x2={arcX} y2={arcY} stroke="#1b1f23" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill="#1b1f23" />
      </svg>
      <div style={{ textAlign: 'center', marginTop: '-8px' }}>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: badge.color, letterSpacing: '-1px' }}>{value}%</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: badge.color }}>{badge.icon} {badge.label}</div>
        <div style={{ fontSize: '0.72rem', color: '#667085', marginTop: '4px' }}>Índice de Qualidade</div>
      </div>
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────
function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isRegistering, setIsRegistering] = useState(false);
  const [token, setToken] = useState(null);
  const [credentials, setCredentials] = useState({ username: '', password: '', email: '' });
  const [activeTab, setActiveTab] = useState('analise');
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [confidence, setConfidence] = useState(0.5);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    if (!token) return;
    axios.get('http://localhost:8000/analysis/history', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setResults(res.data.map(item => ({
        id: item.id, name: `Análise #${item.id}`,
        inteiras: item.inteiras, quebradas: item.quebradas,
        predadas: item.predadas, total: item.total, url: null,
        timestamp: item.created_at || null,
      }))))
      .catch(err => console.error(err));
  }, [token]);

  const handleFileChange = (e) => {
    const sel = Array.from(e.target.files);
    setFiles(sel);
    setPreviewUrls(sel.map(f => URL.createObjectURL(f)));
    if (sel.length) addToast(`${sel.length} imagem(ns) carregada(s)!`);
  };

  useEffect(() => () => previewUrls.forEach(u => URL.revokeObjectURL(u)), [previewUrls]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/users/login',
        `username=${credentials.username}&password=${credentials.password}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      setToken(res.data.access_token);
      setCurrentPage('dashboard');
      addToast('Login realizado com sucesso! 🌱');
    } catch { addToast('Falha no login. Verifique usuário e senha.', 'error'); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/users/signup', credentials);
      addToast('Conta criada! Faça seu login.');
      setIsRegistering(false);
    } catch { addToast('Erro ao cadastrar. Usuário já existe?', 'error'); }
  };

  const handleAnalyzeAll = async () => {
    if (!files.length) return addToast('Selecione imagens primeiro!', 'warning');
    setLoading(true);
    const newResults = [];
    let errors = 0;
    for (let file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await axios.post(`http://localhost:8000/analysis/upload?conf=${confidence}`, fd, { headers: { Authorization: `Bearer ${token}` } });
        newResults.push({ name: file.name, ...res.data, url: URL.createObjectURL(file), timestamp: new Date().toISOString() });
      } catch { errors++; newResults.push({ name: file.name, error: 'Erro na análise', inteiras: 0, quebradas: 0, predadas: 0 }); }
    }
    setResults(newResults);
    setLoading(false);
    errors === 0 ? addToast(`${newResults.length} análise(s) concluída(s)!`) : addToast(`Concluído com ${errors} erro(s).`, 'warning');
  };

  const downloadCSV = () => {
    const rows = results.map(r => [r.name, r.inteiras, r.quebradas, r.predadas, r.inteiras + r.quebradas + r.predadas]);
    const csv = "data:text/csv;charset=utf-8," + [["Arquivo","Inteiras","Quebradas","Predadas","Total"], ...rows].map(r => r.join(",")).join("\n");
    const a = document.createElement("a"); a.href = encodeURI(csv); a.download = "relatorio_sementes.csv"; a.click();
    addToast('Planilha exportada!');
  };

  const stats = useMemo(() => results.reduce((acc, r) => ({
    inteiras: acc.inteiras + (Number(r.inteiras) || 0),
    quebradas: acc.quebradas + (Number(r.quebradas) || 0),
    predadas: acc.predadas + (Number(r.predadas) || 0),
  }), { inteiras: 0, quebradas: 0, predadas: 0 }), [results]);

  const totalSementes = stats.inteiras + stats.quebradas + stats.predadas;
  const aproveitamento = totalSementes > 0 ? Math.round((stats.inteiras / totalSementes) * 100) : 0;

  const pieData = {
    labels: ['Inteiras', 'Quebradas', 'Predadas'],
    datasets: [{ data: [stats.inteiras, stats.quebradas, stats.predadas], backgroundColor: ['#4CAF50', '#FF4B4B', '#FFA500'], borderWidth: 0, hoverOffset: 12 }]
  };

  const barData = {
    labels: results.slice(-8).map((r, i) => r.name || `#${i+1}`),
    datasets: [
      { label: 'Inteiras', data: results.slice(-8).map(r => r.inteiras || 0), backgroundColor: '#4CAF50', borderRadius: 6 },
      { label: 'Quebradas', data: results.slice(-8).map(r => r.quebradas || 0), backgroundColor: '#FFA500', borderRadius: 6 },
      { label: 'Predadas', data: results.slice(-8).map(r => r.predadas || 0), backgroundColor: '#FF4B4B', borderRadius: 6 },
    ]
  };

  const lineData = {
    labels: results.map((_, i) => `#${i+1}`),
    datasets: [{
      label: '% Inteiras',
      data: results.map(r => {
        const t = (r.inteiras || 0) + (r.quebradas || 0) + (r.predadas || 0);
        return t > 0 ? Math.round(((r.inteiras || 0) / t) * 100) : 0;
      }),
      borderColor: '#2e7d32', backgroundColor: 'rgba(46,125,50,0.08)',
      tension: 0.4, fill: true, pointBackgroundColor: '#2e7d32', pointRadius: 4,
    }]
  };

  const rankingData = useMemo(() => {
    return [...results]
      .filter(r => !r.error)
      .map(r => {
        const t = (r.inteiras || 0) + (r.quebradas || 0) + (r.predadas || 0);
        return { ...r, pct: t > 0 ? Math.round(((r.inteiras || 0) / t) * 100) : 0, total: t };
      })
      .sort((a, b) => b.pct - a.pct);
  }, [results]);

  const chartOptions = { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
  const barOptions = { ...chartOptions, plugins: { ...chartOptions.plugins }, scales: { x: { stacked: false }, y: { stacked: false, beginAtZero: true } } };
  const lineOptions = { ...chartOptions, scales: { y: { min: 0, max: 100, ticks: { callback: v => v + '%' } } } };

  // ── HOME ──
  if (currentPage === 'home') return <><Toast toasts={toasts} onRemove={removeToast} /><Home onStart={() => setCurrentPage('login')} /></>;

  // ── LOGIN ──
  if (currentPage === 'login' && !token) return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />
      <div className="st-login-wrapper">
        <div className="st-login-card">
          <button onClick={() => setCurrentPage('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#667085', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0 }}>← Voltar</button>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌱</div>
          <h1>Seed Detector AI</h1>
          <p>{isRegistering ? 'Crie sua conta' : 'Acesse o painel de análise'}</p>
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <input type="text" placeholder="Usuário" required onChange={e => setCredentials({ ...credentials, username: e.target.value })} />
            {isRegistering && <input type="email" placeholder="E-mail" required onChange={e => setCredentials({ ...credentials, email: e.target.value })} />}
            <input type="password" placeholder="Senha" required onChange={e => setCredentials({ ...credentials, password: e.target.value })} />
            <button type="submit" className="st-button-primary">{isRegistering ? 'Cadastrar Agora' : 'Entrar →'}</button>
          </form>
          <button className="st-toggle-link" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Já tem conta? Login' : 'Não tem conta? Registre-se'}
          </button>
        </div>
      </div>
    </>
  );

  // ── DASHBOARD ──
  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />
      <div className="st-app">

        {/* SIDEBAR */}
        <aside className="st-sidebar">
          <div className="st-sidebar-header">
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1b1f23', letterSpacing: '-0.5px' }}>🌱 Seed AI</div>
              <div style={{ fontSize: '11px', color: '#667085', fontWeight: 600, marginTop: '2px' }}>Análise inteligente de sementes</div>
            </div>
            <span className="st-badge">v3.0</span>
          </div>

          <div className="st-menu">
            {[
              { id: 'analise', icon: '🔍', label: 'Análise Local' },
              { id: 'estatisticas', icon: '📊', label: 'Estatísticas' },
              { id: 'relatorio', icon: '📋', label: 'Relatório' },
            ].map(tab => (
              <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <hr className="st-divider" />

          <div className="st-sidebar-item">
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📁 Carregar Imagens</label>
            <input type="file" multiple onChange={handleFileChange} style={{ marginTop: '8px' }} />
            {previewUrls.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <img src={previewUrls[0]} className="st-upload-preview" alt="Preview" />
                {files.length > 1 && <p style={{ fontSize: '0.8rem', color: '#667085', margin: '6px 0 0', fontWeight: 600 }}>+ {files.length - 1} foto(s)</p>}
              </div>
            )}
          </div>

          <div className="st-sidebar-item" style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🎯 Confiança: <strong style={{ color: '#2e7d32' }}>{Math.round(confidence * 100)}%</strong>
            </label>
            <input type="range" min="0.01" max="1.00" step="0.01" value={confidence} onChange={e => setConfidence(parseFloat(e.target.value))} className="st-slider" style={{ marginTop: '8px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
              <span>Permissivo</span><span>Rigoroso</span>
            </div>
          </div>

          <button onClick={handleAnalyzeAll} className="st-button-primary" disabled={loading}
            style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Processando...</> : results.length > 0 ? '🔄 Refazer Análise' : 'Rodar Análise 🚀'}
          </button>

          <div className="st-sidebar-footer">
            {results.length > 0 && <button onClick={downloadCSV} className="st-button-csv" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>📥 Exportar Planilha</button>}
            <button onClick={() => { setToken(null); setCurrentPage('home'); }} className="st-button-logout">Sair do Sistema</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="st-main">

          {/* ── ABA ANÁLISE ── */}
          {activeTab === 'analise' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <header style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>🔍 Detecção por Imagem</h1>
                <p style={{ color: '#667085', marginTop: '6px' }}>Resultados individuais de cada amostra.</p>
              </header>
              {results.length > 0 && <SummaryCards stats={stats} total={totalSementes} aproveitamento={aproveitamento} />}
              {loading ? (
                <div className="st-grid">{files.map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : results.length === 0 ? <EmptyState /> : (
                <div className="st-grid">
                  {results.map((res, i) => {
                    const t = (res.inteiras || 0) + (res.quebradas || 0) + (res.predadas || 0);
                    const pct = t > 0 ? Math.round(((res.inteiras || 0) / t) * 100) : 0;
                    const badge = getQualityBadge(pct);
                    return (
                      <div key={i} className="st-metric-card" style={{ animation: `fadeIn 0.4s ease ${i * 60}ms both` }}>
                        {res.url ? <img src={res.url} className="st-img-preview" alt="amostra" /> : <div className="st-img-placeholder"><span>📷 Sem visualização</span></div>}
                        <div className="card-content">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#1b1f23' }}>{res.name}</h3>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                              {badge.icon} {badge.label}
                            </span>
                          </div>
                          {res.error ? (
                            <div style={{ background: '#fff1f1', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', color: '#991b1b', fontWeight: 600 }}>❌ {res.error}</div>
                          ) : (
                            <>
                              <div className="st-metrics">
                                <div className="st-metric"><span>Inteiras</span><strong style={{ color: '#2e7d32' }}>{res.inteiras}</strong></div>
                                <div className="st-metric"><span>Quebradas</span><strong style={{ color: '#d97706' }}>{res.quebradas}</strong></div>
                                <div className="st-metric"><span>Predadas</span><strong style={{ color: '#dc2626' }}>{res.predadas}</strong></div>
                              </div>
                              {/* Mini barra de progresso */}
                              <div style={{ marginTop: '12px' }}>
                                <div style={{ height: '6px', borderRadius: '99px', background: '#f0f0f0', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 75 ? '#4caf50' : pct >= 50 ? '#ffa500' : '#ff4b4b', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                                </div>
                                <div style={{ fontSize: '11px', color: '#667085', marginTop: '4px', textAlign: 'right' }}>{pct}% aproveitamento</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ABA ESTATÍSTICAS ── */}
          {activeTab === 'estatisticas' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <header style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>📊 Estatísticas do Lote</h1>
                <p style={{ color: '#667085', marginTop: '6px' }}>Resumo de <strong>{results.length}</strong> análise(s).</p>
              </header>

              {results.length === 0 ? <EmptyState /> : (
                <>
                  <SummaryCards stats={stats} total={totalSementes} aproveitamento={aproveitamento} />

                  {/* Gauge + Pie */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div className="st-chart-card" style={{ justifyContent: 'center' }}>
                      <h3>Índice de Qualidade</h3>
                      <Gauge value={aproveitamento} />
                    </div>
                    <div className="st-chart-card">
                      <h3>Distribuição Relativa</h3>
                      <div style={{ width: '100%', height: '260px' }}>
                        <Pie data={pieData} options={chartOptions} />
                      </div>
                    </div>
                  </div>

                  {/* Linha de evolução */}
                  {results.length > 1 && (
                    <div className="st-chart-card" style={{ marginBottom: '20px', alignItems: 'stretch' }}>
                      <h3>Evolução do Aproveitamento</h3>
                      <div style={{ width: '100%', height: '260px' }}>
                        <Line data={lineData} options={lineOptions} />
                      </div>
                    </div>
                  )}

                  {/* Barras por amostra */}
                  <div className="st-chart-card" style={{ alignItems: 'stretch' }}>
                    <h3>Volume por Amostra</h3>
                    <div style={{ width: '100%', height: '260px' }}>
                      <Bar data={barData} options={barOptions} />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── ABA RELATÓRIO ── */}
          {activeTab === 'relatorio' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <header style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>📋 Relatório do Lote</h1>
                <p style={{ color: '#667085', marginTop: '6px' }}>Diagnóstico automatizado das análises.</p>
              </header>

              {results.length === 0 ? <EmptyState /> : (
                <>
                  {/* Diagnóstico textual */}
                  <div style={{ background: '#f8f9fb', border: '1px solid #e6e9ef', borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '2rem' }}>{getQualityBadge(aproveitamento).icon}</div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1b1f23' }}>Diagnóstico Automático</div>
                        <div style={{ fontSize: '0.85rem', color: '#667085' }}>Gerado com base nas {results.length} análise(s)</div>
                      </div>
                    </div>
                    <p style={{ lineHeight: 1.8, color: '#374151', margin: 0, fontSize: '0.95rem' }}>
                      O lote analisado apresentou <strong>{aproveitamento}% de aproveitamento</strong>, com {stats.inteiras} sementes inteiras,
                      {stats.quebradas} quebradas e {stats.predadas} predadas de um total de <strong>{totalSementes} sementes</strong>.{' '}
                      {aproveitamento >= 75
                        ? '✅ O lote está em ótimas condições e pode seguir para processamento ou armazenamento sem restrições.'
                        : aproveitamento >= 50
                        ? '⚠️ O lote apresenta qualidade regular. Recomenda-se triagem adicional antes do processamento.'
                        : '❌ O lote apresenta baixa qualidade. Não recomendado para uso sem triagem rigorosa.'
                      }
                    </p>
                  </div>

                  {/* Ranking */}
                  <div style={{ background: 'white', border: '1px solid #e6e9ef', borderRadius: '20px', padding: '28px', marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: '#1b1f23' }}>🏆 Ranking de Amostras</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {rankingData.map((r, i) => {
                        const badge = getQualityBadge(r.pct);
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '12px', background: '#f8f9fb', border: '1px solid #f0f0f0' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? '#fde68a' : i === 1 ? '#e5e7eb' : i === 2 ? '#fed7aa' : '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0 }}>
                              {i + 1}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1b1f23', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                              <div style={{ height: '5px', borderRadius: '99px', background: '#e5e7eb', marginTop: '6px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${r.pct}%`, background: badge.color === '#166534' ? '#4caf50' : badge.color === '#92400e' ? '#ffa500' : '#ff4b4b', borderRadius: '99px' }} />
                              </div>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, flexShrink: 0 }}>
                              {r.pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recomendações */}
                  <div style={{ background: 'white', border: '1px solid #e6e9ef', borderRadius: '20px', padding: '28px' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: '#1b1f23' }}>💡 Recomendações</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        aproveitamento < 75 && { icon: '⚙️', text: 'Ajuste o limiar de confiança para análises mais rigorosas.', color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
                        stats.predadas > stats.inteiras * 0.2 && { icon: '🐛', text: 'Alto índice de predação detectado. Verifique condições de armazenamento.', color: '#991b1b', bg: '#fff1f1', border: '#fecaca' },
                        stats.quebradas > stats.inteiras * 0.3 && { icon: '⚠️', text: 'Muitas sementes quebradas. Avalie o processo de colheita ou transporte.', color: '#92400e', bg: '#fffbeb', border: '#fde68a' },
                        aproveitamento >= 75 && { icon: '✅', text: 'Excelente qualidade! Lote aprovado para processamento.', color: '#166534', bg: '#f0fdf4', border: '#bbf7d0' },
                      ].filter(Boolean).map((rec, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', borderRadius: '12px', background: rec.bg, border: `1px solid ${rec.border}` }}>
                          <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{rec.icon}</span>
                          <span style={{ fontSize: '0.9rem', color: rec.color, fontWeight: 500, lineHeight: 1.6 }}>{rec.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      <style>{`
        @keyframes slideInToast { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
        @keyframes shimmer { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </>
  );
}

export default App;