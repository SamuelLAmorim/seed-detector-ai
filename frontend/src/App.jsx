import api, { MAX_UPLOAD_BYTES, MAX_UPLOAD_MB } from './api';
import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS,
  Legend, LinearScale, LineElement, PointElement, Title, Tooltip,
} from 'chart.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import './App.css';
import Home from './components/Home';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const getQualityBadge = (pct) => {
  if (pct >= 75) return { label: 'Ótimo', color: '#16a34a', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', icon: '🟢' };
  if (pct >= 50) return { label: 'Regular', color: '#d97706', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', icon: '🟡' };
  return { label: 'Ruim', color: '#dc2626', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', icon: '🔴' };
};

// ── TOAST ────────────────────────────────────────────────
function Toast({ toasts, onRemove }) {
  return (
    <div style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '14px 20px', borderRadius: '12px', minWidth: '280px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          background: t.type === 'success' ? 'rgba(34,197,94,0.15)' : t.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(251,191,36,0.15)',
          border: `1px solid ${t.type === 'success' ? 'rgba(34,197,94,0.4)' : t.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(251,191,36,0.4)'}`,
          backdropFilter: 'blur(12px)', animation: 'slideInToast 0.3s ease',
        }}>
          <span style={{ fontSize: '1.2rem' }}>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : '⚠️'}</span>
          <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600, color: 'var(--st-text)' }}>{t.message}</span>
          <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5, color: 'var(--st-text)' }}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── SKELETON ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="st-metric-card">
      <div style={{ width: '100%', height: '200px', background: 'var(--st-skeleton)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div className="card-content" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '16px', borderRadius: '8px', background: 'var(--st-skeleton)', width: '60%' }} />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1,2,3].map(i => <div key={i} style={{ flex: 1, height: '56px', borderRadius: '8px', background: 'var(--st-skeleton)' }} />)}
        </div>
      </div>
    </div>
  );
}

// ── EMPTY STATE ──────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
      <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', marginBottom: '28px' }}>
        🌱
      </div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--st-text)', marginBottom: '10px', letterSpacing: '-0.5px' }}>Nenhuma análise ainda</h2>
      <p style={{ color: 'var(--st-text-muted)', maxWidth: '360px', lineHeight: 1.7, fontSize: '0.95rem' }}>
        Carregue imagens de sementes na barra lateral e clique em <strong>Rodar Análise</strong> para começar.
      </p>
    </div>
  );
}

// ── SUMMARY CARDS ────────────────────────────────────────
function SummaryCards({ stats, total, aproveitamento }) {
  const badge = getQualityBadge(aproveitamento);
  const cards = [
    { label: 'Total Sementes', value: total, icon: '🌾', color: 'var(--st-text-muted)', bg: 'var(--st-card-bg)', border: 'var(--st-border)' },
    { label: 'Inteiras', value: stats.inteiras, icon: '✅', color: '#16a34a', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
    { label: 'Quebradas', value: stats.quebradas, icon: '⚠️', color: '#d97706', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
    { label: 'Predadas', value: stats.predadas, icon: '❌', color: '#dc2626', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
    { label: 'Aproveitamento', value: `${aproveitamento}%`, icon: badge.icon, color: badge.color, bg: badge.bg, border: badge.border, extra: badge.label },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '28px' }}>
      {cards.map((c, i) => (
        <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '16px', padding: '18px', animation: `fadeIn 0.4s ease ${i * 60}ms both`, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{c.icon}</div>
          <div style={{ fontSize: '1.7rem', fontWeight: 900, color: c.color, letterSpacing: '-1px', lineHeight: 1 }}>{c.value}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--st-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '5px' }}>{c.label}</div>
          {c.extra && <div style={{ fontSize: '0.75rem', fontWeight: 700, color: c.color, marginTop: '4px' }}>{c.extra}</div>}
        </div>
      ))}
    </div>
  );
}

// ── GAUGE ────────────────────────────────────────────────
function Gauge({ value, dark }) {
  const badge = getQualityBadge(value);
  const angle = -90 + (value / 100) * 180;
  const r = 70, cx = 90, cy = 90;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcX = cx + r * Math.cos(toRad(angle));
  const arcY = cy + r * Math.sin(toRad(angle));
  const needleColor = dark ? '#e2e8f0' : '#1b1f23';
  const arc = (s, e, color) => {
    const x1 = cx + r * Math.cos(toRad(s)), y1 = cy + r * Math.sin(toRad(s));
    const x2 = cx + r * Math.cos(toRad(e)), y2 = cy + r * Math.sin(toRad(e));
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${e - s > 180 ? 1 : 0} 1 ${x2} ${y2}`} stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" />;
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="180" height="110" viewBox="0 0 180 110">
        {arc(-180, -60, 'rgba(251,191,36,0.5)')}
        {arc(-60, 0, 'rgba(34,197,94,0.5)')}
        {arc(-180, -120, 'rgba(239,68,68,0.5)')}
        <line x1={cx} y1={cy} x2={arcX} y2={arcY} stroke={needleColor} strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={needleColor} />
      </svg>
      <div style={{ textAlign: 'center', marginTop: '-8px' }}>
        <div style={{ fontSize: '2rem', fontWeight: 900, color: badge.color, letterSpacing: '-1px' }}>{value}%</div>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: badge.color }}>{badge.icon} {badge.label}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--st-text-muted)', marginTop: '4px' }}>Índice de Qualidade</div>
      </div>
    </div>
  );
}

// ── PERFIL ───────────────────────────────────────────────
function ProfilePage({ profile }) {
  if (!profile) return <EmptyState />;
  const badge = getQualityBadge(profile.aproveitamento_geral);
  const statCards = [
    { label: 'Análises Realizadas', value: profile.total_analises, icon: '🔬', color: '#16a34a' },
    { label: 'Total de Sementes', value: profile.total_sementes, icon: '🌾', color: 'var(--st-text-muted)' },
    { label: 'Inteiras', value: profile.total_inteiras, icon: '✅', color: '#16a34a' },
    { label: 'Quebradas', value: profile.total_quebradas, icon: '⚠️', color: '#d97706' },
    { label: 'Predadas', value: profile.total_predadas, icon: '❌', color: '#dc2626' },
    { label: 'Aproveitamento Geral', value: `${profile.aproveitamento_geral}%`, icon: badge.icon, color: badge.color },
  ];
  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header perfil */}
      <div className="st-report-card" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))',
          border: '2px solid rgba(34,197,94,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2.5rem', flexShrink: 0,
        }}>
          👤
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--st-text)', letterSpacing: '-0.5px' }}>
            {profile.full_name || profile.username}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--st-text-muted)', marginTop: '4px' }}>@{profile.username}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--st-text-muted)', marginTop: '2px' }}>📧 {profile.email}</div>
          {profile.ultima_analise && (
            <div style={{ fontSize: '0.8rem', color: 'var(--st-text-muted)', marginTop: '6px' }}>
              🕒 Última análise: {new Date(profile.ultima_analise).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          )}
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '6px 16px', borderRadius: '99px', background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
          {badge.icon} Qualidade {badge.label}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {statCards.map((c, i) => (
          <div key={i} style={{ background: 'var(--st-card-bg)', border: '1px solid var(--st-border)', borderRadius: '16px', padding: '18px', animation: `fadeIn 0.4s ease ${i * 60}ms both`, transition: 'transform 0.2s', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{c.icon}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: c.color, letterSpacing: '-1px', lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--st-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '5px' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Barra de distribuição */}
      {profile.total_sementes > 0 && (
        <div className="st-report-card">
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 700, color: 'var(--st-text)' }}>📊 Distribuição Geral do Histórico</h3>
          <div style={{ height: '12px', borderRadius: '99px', overflow: 'hidden', display: 'flex', gap: '2px' }}>
            <div style={{ width: `${(profile.total_inteiras / profile.total_sementes) * 100}%`, background: '#22c55e', borderRadius: '99px 0 0 99px', transition: 'width 0.8s ease' }} />
            <div style={{ width: `${(profile.total_quebradas / profile.total_sementes) * 100}%`, background: '#f59e0b', transition: 'width 0.8s ease' }} />
            <div style={{ width: `${(profile.total_predadas / profile.total_sementes) * 100}%`, background: '#ef4444', borderRadius: '0 99px 99px 0', transition: 'width 0.8s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Inteiras', pct: profile.total_inteiras, color: '#22c55e' },
              { label: 'Quebradas', pct: profile.total_quebradas, color: '#f59e0b' },
              { label: 'Predadas', pct: profile.total_predadas, color: '#ef4444' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--st-text-muted)', fontWeight: 500 }}>
                  {item.label}: <strong style={{ color: 'var(--st-text)' }}>{Math.round((item.pct / profile.total_sementes) * 100)}%</strong>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────
function App() {
  const [currentPage, setCurrentPage] = useState(() => (localStorage.getItem('seedToken') ? 'dashboard' : 'home'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem('seedToken'));
  const [credentials, setCredentials] = useState({ username: '', password: '', email: '' });
  const [activeTab, setActiveTab] = useState('analise');
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [confidence, setConfidence] = useState(0.5);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [profile, setProfile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    document.body.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('seedToken', token);
      return;
    }

    localStorage.removeItem('seedToken');
  }, [token]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const logout = useCallback(() => {
    setToken(null);
    setCurrentPage('home');
    setProfile(null);
    setResults([]);
    setFiles([]);
    setPreviewUrls([]);
  }, []);

  const handleUnauthorized = useCallback(() => {
    logout();
    addToast('Sua sessao expirou. Entre novamente.', 'warning');
  }, [addToast, logout]);

  const fetchHistory = useCallback(async (tkn) => {
    try {
      const res = await api.get('/analysis/history', { headers: { Authorization: `Bearer ${tkn}` } });
      setResults(res.data.map(item => ({
        id: item.id, name: `Análise #${item.id}`,
        inteiras: item.inteiras, quebradas: item.quebradas,
        predadas: item.predadas, total: item.total, url: null,
        timestamp: item.created_at || null,
      })));
    } catch (err) { if (err?.response?.status === 401) handleUnauthorized(); console.error(err); }
  }, [handleUnauthorized]);

  const fetchProfile = useCallback(async (tkn) => {
    try {
      const res = await api.get('/analysis/profile', { headers: { Authorization: `Bearer ${tkn}` } });
      setProfile(res.data);
    } catch (err) { if (err?.response?.status === 401) handleUnauthorized(); console.error(err); }
  }, [handleUnauthorized]);

  useEffect(() => {
    if (!token) return;
    fetchHistory(token);
    fetchProfile(token);
  }, [fetchHistory, fetchProfile, token]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = [];
    let rejectedFiles = 0;

    selectedFiles.forEach(file => {
      if (!file.type.startsWith('image/') || file.size > MAX_UPLOAD_BYTES) {
        rejectedFiles++;
        return;
      }
      validFiles.push(file);
    });

    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setFiles(validFiles);
    setPreviewUrls(validFiles.map(file => URL.createObjectURL(file)));

    if (validFiles.length) addToast(`${validFiles.length} imagem(ns) pronta(s) para análise!`);
    if (rejectedFiles) addToast(`${rejectedFiles} arquivo(s) ignorado(s). Use imagens de até ${MAX_UPLOAD_MB} MB.`, 'warning');
    e.target.value = '';
  };
  useEffect(() => () => previewUrls.forEach(u => URL.revokeObjectURL(u)), [previewUrls]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const payload = new URLSearchParams({ username: credentials.username, password: credentials.password });
      const res = await api.post('/users/login', payload, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      setToken(res.data.access_token);
      setCurrentPage('dashboard');
      setCredentials({ username: '', password: '', email: '' });
      addToast('Login realizado com sucesso!');
    } catch (err) {
      const message = err?.response?.data?.detail || 'Falha no login. Verifique usuario e senha.';
      addToast(message, 'error');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/signup', credentials);
      setCredentials({ username: '', password: '', email: '' });
      addToast('Conta criada! Faça seu login.');
      setIsRegistering(false);
    } catch (err) {
      const message = err?.response?.data?.detail || 'Erro ao cadastrar. Revise os dados informados.';
      addToast(message, 'error');
    }
  };

  const handleAnalyzeAll = async () => {
    if (!files.length) return addToast(`Selecione imagens válidas de até ${MAX_UPLOAD_MB} MB primeiro!`, 'warning');
    setLoading(true);
    const newResults = [];
    let errors = 0;
    for (let file of files) {
      const fd = new FormData();
      fd.append('file', file);
      try {
        const res = await api.post(`/analysis/upload?conf=${confidence}`, fd, { headers: { Authorization: `Bearer ${token}` } });
        newResults.push({
          name: file.name,
          ...res.data,
          url: res.data.annotated_image
            ? `data:image/jpeg;base64,${res.data.annotated_image}`
            : URL.createObjectURL(file),
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        if (err?.response?.status === 401) {
          handleUnauthorized();
          setLoading(false);
          return;
        }
        errors++;
        newResults.push({
          name: file.name,
          error: err?.response?.data?.detail || 'Erro na análise',
          inteiras: 0,
          quebradas: 0,
          predadas: 0,
        });
      }
    }
    setResults(newResults);
    setLoading(false);
    await fetchProfile(token);
    errors === 0 ? addToast(`${newResults.length} análise(s) concluída(s)!`) : addToast(`Concluído com ${errors} erro(s).`, 'warning');
  };

  const handleDelete = async (id) => {
    if (!id) return;
    setDeletingId(id);
    try {
      await api.delete(`/analysis/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setResults(prev => prev.filter(r => r.id !== id));
      await fetchProfile(token);
      addToast('Análise removida!');
    } catch (err) {
      if (err?.response?.status === 401) {
        handleUnauthorized();
      } else {
        addToast(err?.response?.data?.detail || 'Erro ao deletar análise.', 'error');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const downloadCSV = () => {
    const escapeCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const rows = results.map(r => [r.name, r.inteiras, r.quebradas, r.predadas, r.inteiras + r.quebradas + r.predadas]);
    const csvContent = [["Arquivo", "Inteiras", "Quebradas", "Predadas", "Total"], ...rows]
      .map(row => row.map(escapeCell).join(';'))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio_sementes.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Planilha exportada!');
  };

  const stats = useMemo(() => results.reduce((acc, r) => ({
    inteiras: acc.inteiras + (Number(r.inteiras) || 0),
    quebradas: acc.quebradas + (Number(r.quebradas) || 0),
    predadas: acc.predadas + (Number(r.predadas) || 0),
  }), { inteiras: 0, quebradas: 0, predadas: 0 }), [results]);

  const totalSementes = stats.inteiras + stats.quebradas + stats.predadas;
  const aproveitamento = totalSementes > 0 ? Math.round((stats.inteiras / totalSementes) * 100) : 0;

  const chartColors = dark
    ? { grid: 'rgba(255,255,255,0.08)', tick: '#94a3b8', legend: '#94a3b8' }
    : { grid: 'rgba(0,0,0,0.06)', tick: '#667085', legend: '#667085' };

  const chartOptions = { maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: chartColors.legend, padding: 16, boxRadius: 4 } } } };
  const barOptions = { ...chartOptions, scales: { x: { ticks: { color: chartColors.tick }, grid: { color: chartColors.grid } }, y: { beginAtZero: true, ticks: { color: chartColors.tick }, grid: { color: chartColors.grid } } } };
  const lineOptions = { ...chartOptions, scales: { x: { ticks: { color: chartColors.tick }, grid: { color: chartColors.grid } }, y: { min: 0, max: 100, ticks: { color: chartColors.tick, callback: v => v + '%' }, grid: { color: chartColors.grid } } } };

  const pieData = { labels: ['Inteiras', 'Quebradas', 'Predadas'], datasets: [{ data: [stats.inteiras, stats.quebradas, stats.predadas], backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'], borderWidth: 0, hoverOffset: 12 }] };
  const barData = { labels: results.slice(-8).map((r, i) => r.name || `#${i+1}`), datasets: [{ label: 'Inteiras', data: results.slice(-8).map(r => r.inteiras || 0), backgroundColor: '#22c55e', borderRadius: 6 }, { label: 'Quebradas', data: results.slice(-8).map(r => r.quebradas || 0), backgroundColor: '#f59e0b', borderRadius: 6 }, { label: 'Predadas', data: results.slice(-8).map(r => r.predadas || 0), backgroundColor: '#ef4444', borderRadius: 6 }] };
  const lineData = { labels: results.map((_, i) => `#${i+1}`), datasets: [{ label: '% Inteiras', data: results.map(r => { const t = (r.inteiras||0)+(r.quebradas||0)+(r.predadas||0); return t > 0 ? Math.round(((r.inteiras||0)/t)*100) : 0; }), borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.08)', tension: 0.4, fill: true, pointBackgroundColor: '#22c55e', pointRadius: 4 }] };

  const rankingData = useMemo(() => [...results].filter(r => !r.error).map(r => { const t = (r.inteiras||0)+(r.quebradas||0)+(r.predadas||0); return { ...r, pct: t > 0 ? Math.round(((r.inteiras||0)/t)*100) : 0, total: t }; }).sort((a, b) => b.pct - a.pct), [results]);

  // ── HOME ──
  if (currentPage === 'home') return <><Toast toasts={toasts} onRemove={removeToast} /><Home onStart={() => setCurrentPage('login')} /></>;

  // ── LOGIN ──
  if (currentPage === 'login' && !token) return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />
      <div className="st-login-wrapper">
        <div className="st-login-card">
          <button onClick={() => setCurrentPage('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--st-text-muted)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0 }}>← Voltar</button>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🌱</div>
          <h1>SeeDetector AI</h1>
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
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--st-text)', letterSpacing: '-0.5px' }}>🌱 SeeDetector AI</div>
              <div style={{ fontSize: '11px', color: 'var(--st-text-muted)', fontWeight: 600, marginTop: '2px' }}>Análise inteligente de sementes</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="st-badge">v3.0</span>
              <button onClick={() => setDark(d => !d)} title={dark ? 'Modo claro' : 'Modo escuro'}
                style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--st-card-bg)', border: '1px solid var(--st-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'all 0.2s' }}>
                {dark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          <div className="st-menu">
            {[
              { id: 'analise', icon: '🔍', label: 'Análise Local' },
              { id: 'estatisticas', icon: '📊', label: 'Estatísticas' },
              { id: 'relatorio', icon: '📋', label: 'Relatório' },
              { id: 'perfil', icon: '👤', label: 'Meu Perfil' },
            ].map(tab => (
              <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <hr className="st-divider" />

          <div className="st-sidebar-item">
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--st-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📁 Carregar Imagens</label>
            <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ marginTop: '8px' }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--st-text-muted)', margin: '6px 0 0' }}>JPEG/PNG/WebP até {MAX_UPLOAD_MB} MB por imagem.</p>
            {previewUrls.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <img src={previewUrls[0]} className="st-upload-preview" alt="Preview" />
                {files.length > 1 && <p style={{ fontSize: '0.8rem', color: 'var(--st-text-muted)', margin: '6px 0 0', fontWeight: 600 }}>+ {files.length - 1} foto(s)</p>}
              </div>
            )}
          </div>

          <div className="st-sidebar-item" style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--st-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🎯 Confiança: <strong style={{ color: '#22c55e' }}>{Math.round(confidence * 100)}%</strong>
            </label>
            <input type="range" min="0.01" max="1.00" step="0.01" value={confidence} onChange={e => setConfidence(parseFloat(e.target.value))} className="st-slider" style={{ marginTop: '8px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--st-text-muted)', marginTop: '4px' }}>
              <span>Permissivo</span><span>Rigoroso</span>
            </div>
          </div>

          <button onClick={handleAnalyzeAll} className="st-button-primary" disabled={loading}
            style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading
              ? <><span style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Processando...</>
              : results.length > 0 ? '🔄 Refazer Análise' : 'Rodar Análise 🚀'}
          </button>

          <div className="st-sidebar-footer">
            {results.length > 0 && <button onClick={downloadCSV} className="st-button-csv" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>📥 Exportar Planilha</button>}
            <button onClick={logout} className="st-button-logout">Sair do Sistema</button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="st-main">

          {/* ── ABA ANÁLISE ── */}
          {activeTab === 'analise' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <header style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: 'var(--st-text)' }}>🔍 Detecção por Imagem</h1>
                <p style={{ color: 'var(--st-text-muted)', marginTop: '6px' }}>Resultados individuais de cada amostra.</p>
              </header>
              {results.length > 0 && <SummaryCards stats={stats} total={totalSementes} aproveitamento={aproveitamento} />}
              {loading ? (
                <div className="st-grid">{files.map((_, i) => <SkeletonCard key={i} />)}</div>
              ) : results.length === 0 ? <EmptyState /> : (
                <div className="st-grid">
                  {results.map((res, i) => {
                    const t = (res.inteiras||0)+(res.quebradas||0)+(res.predadas||0);
                    const pct = t > 0 ? Math.round(((res.inteiras||0)/t)*100) : 0;
                    const badge = getQualityBadge(pct);
                    return (
                      <div key={i} className="st-metric-card" style={{ animation: `fadeIn 0.4s ease ${i * 60}ms both`, position: 'relative' }}>

                        {/* Botão lixeira */}
                        {res.id && (
                          <button
                            onClick={() => handleDelete(res.id)}
                            disabled={deletingId === res.id}
                            title="Deletar análise"
                            style={{
                              position: 'absolute', top: '10px', right: '10px', zIndex: 2,
                              width: '32px', height: '32px', borderRadius: '8px',
                              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '0.9rem', transition: 'background 0.2s',
                              opacity: deletingId === res.id ? 0.5 : 1,
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.7)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
                          >
                            🗑️
                          </button>
                        )}

                        {/* Imagem — anotada se disponível, placeholder se histórico */}
                        {res.url
                          ? <img src={res.url} className="st-img-preview" alt="amostra anotada" />
                          : <div className="st-img-placeholder"><span>📷 Sem visualização</span></div>
                        }

                        <div className="card-content">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: 'var(--st-text)' }}>{res.name}</h3>
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                              {badge.icon} {badge.label}
                            </span>
                          </div>
                          {res.error ? (
                            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', color: '#dc2626', fontWeight: 600 }}>❌ {res.error}</div>
                          ) : (
                            <>
                              <div className="st-metrics">
                                <div className="st-metric"><span>Inteiras</span><strong style={{ color: '#16a34a' }}>{res.inteiras}</strong></div>
                                <div className="st-metric"><span>Quebradas</span><strong style={{ color: '#d97706' }}>{res.quebradas}</strong></div>
                                <div className="st-metric"><span>Predadas</span><strong style={{ color: '#dc2626' }}>{res.predadas}</strong></div>
                              </div>
                              <div style={{ marginTop: '12px' }}>
                                <div style={{ height: '6px', borderRadius: '99px', background: 'var(--st-border)', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: pct >= 75 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '99px', transition: 'width 0.6s ease' }} />
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--st-text-muted)', marginTop: '4px', textAlign: 'right' }}>{pct}% aproveitamento</div>
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
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: 'var(--st-text)' }}>📊 Estatísticas do Lote</h1>
                <p style={{ color: 'var(--st-text-muted)', marginTop: '6px' }}>Resumo de <strong>{results.length}</strong> análise(s).</p>
              </header>
              {results.length === 0 ? <EmptyState /> : (
                <>
                  <SummaryCards stats={stats} total={totalSementes} aproveitamento={aproveitamento} />
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div className="st-chart-card" style={{ justifyContent: 'center' }}>
                      <h3>Índice de Qualidade</h3>
                      <Gauge value={aproveitamento} dark={dark} />
                    </div>
                    <div className="st-chart-card">
                      <h3>Distribuição Relativa</h3>
                      <div style={{ width: '100%', height: '260px' }}><Pie data={pieData} options={chartOptions} /></div>
                    </div>
                  </div>
                  {results.length > 1 && (
                    <div className="st-chart-card" style={{ marginBottom: '20px', alignItems: 'stretch' }}>
                      <h3>Evolução do Aproveitamento</h3>
                      <div style={{ width: '100%', height: '260px' }}><Line data={lineData} options={lineOptions} /></div>
                    </div>
                  )}
                  <div className="st-chart-card" style={{ alignItems: 'stretch' }}>
                    <h3>Volume por Amostra</h3>
                    <div style={{ width: '100%', height: '260px' }}><Bar data={barData} options={barOptions} /></div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── ABA RELATÓRIO ── */}
          {activeTab === 'relatorio' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <header style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: 'var(--st-text)' }}>📋 Relatório do Lote</h1>
                <p style={{ color: 'var(--st-text-muted)', marginTop: '6px' }}>Diagnóstico automatizado das análises.</p>
              </header>
              {results.length === 0 ? <EmptyState /> : (
                <>
                  <div className="st-report-card" style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '2rem' }}>{getQualityBadge(aproveitamento).icon}</div>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--st-text)' }}>Diagnóstico Automático</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--st-text-muted)' }}>Gerado com base nas {results.length} análise(s)</div>
                      </div>
                    </div>
                    <p style={{ lineHeight: 1.8, color: 'var(--st-text)', margin: 0, fontSize: '0.95rem', opacity: 0.85 }}>
                      O lote analisado apresentou <strong>{aproveitamento}% de aproveitamento</strong>, com {stats.inteiras} sementes inteiras, {stats.quebradas} quebradas e {stats.predadas} predadas de um total de <strong>{totalSementes} sementes</strong>.{' '}
                      {aproveitamento >= 75 ? '✅ O lote está em ótimas condições e pode seguir para processamento ou armazenamento sem restrições.' : aproveitamento >= 50 ? '⚠️ O lote apresenta qualidade regular. Recomenda-se triagem adicional antes do processamento.' : '❌ O lote apresenta baixa qualidade. Não recomendado para uso sem triagem rigorosa.'}
                    </p>
                  </div>
                  <div className="st-report-card" style={{ marginBottom: '24px' }}>
                    <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: 'var(--st-text)' }}>🏆 Ranking de Amostras</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {rankingData.map((r, i) => {
                        const badge = getQualityBadge(r.pct);
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', borderRadius: '12px', background: 'var(--st-metric-bg)', border: '1px solid var(--st-border)' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? 'rgba(251,191,36,0.3)' : i === 1 ? 'var(--st-border)' : i === 2 ? 'rgba(251,146,60,0.2)' : 'var(--st-metric-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0, color: 'var(--st-text)' }}>{i + 1}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--st-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.name}</div>
                              <div style={{ height: '5px', borderRadius: '99px', background: 'var(--st-border)', marginTop: '6px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${r.pct}%`, background: badge.color === '#16a34a' ? '#22c55e' : badge.color === '#d97706' ? '#f59e0b' : '#ef4444', borderRadius: '99px' }} />
                              </div>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, flexShrink: 0 }}>{r.pct}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="st-report-card">
                    <h3 style={{ margin: '0 0 20px', fontSize: '1rem', fontWeight: 700, color: 'var(--st-text)' }}>💡 Recomendações</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        aproveitamento < 75 && { icon: '⚙️', text: 'Ajuste o limiar de confiança para análises mais rigorosas.', color: '#d97706', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
                        stats.predadas > stats.inteiras * 0.2 && { icon: '🐛', text: 'Alto índice de predação detectado. Verifique condições de armazenamento.', color: '#dc2626', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
                        stats.quebradas > stats.inteiras * 0.3 && { icon: '⚠️', text: 'Muitas sementes quebradas. Avalie o processo de colheita ou transporte.', color: '#d97706', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
                        aproveitamento >= 75 && { icon: '✅', text: 'Excelente qualidade! Lote aprovado para processamento.', color: '#16a34a', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
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

          {/* ── ABA PERFIL ── */}
          {activeTab === 'perfil' && (
            <div style={{ animation: 'fadeIn 0.4s ease' }}>
              <header style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px', margin: 0, color: 'var(--st-text)' }}>👤 Meu Perfil</h1>
                <p style={{ color: 'var(--st-text-muted)', marginTop: '6px' }}>Resumo geral da sua conta.</p>
              </header>
              <ProfilePage profile={profile} />
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
