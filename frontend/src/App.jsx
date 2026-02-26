import axios from 'axios';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import { useEffect, useMemo, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import './App.css';

// Registro dos componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function App() {
  // --- ESTADOS ---
  const [isRegistering, setIsRegistering] = useState(false);
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState('analise');
  const [credentials, setCredentials] = useState({ username: '', password: '', email: '' });
  
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]); 
  const [confidence, setConfidence] = useState(0.5);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- BUSCAR HISTÓRICO ---
  useEffect(() => {
    const fetchHistory = async () => {
      if (token) {
        try {
          const res = await axios.get('http://localhost:8000/analysis/history', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          const historyData = res.data.map(item => ({
            id: item.id,
            name: `Análise #${item.id}`, 
            inteiras: item.inteiras,
            quebradas: item.quebradas,
            predadas: item.predadas,
            total: item.total,
            url: null // Histórico não traz URL de preview local
          }));

          setResults(historyData);
        } catch (err) {
          console.error("Erro ao carregar histórico:", err);
        }
      }
    };
    fetchHistory();
  }, [token]);

  // --- LÓGICA DE PREVIEW ---
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  useEffect(() => {
    return () => previewUrls.forEach(url => URL.revokeObjectURL(url));
  }, [previewUrls]);

  // --- AUTENTICAÇÃO ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/users/login', 
        `username=${credentials.username}&password=${credentials.password}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      setToken(response.data.access_token);
    } catch (err) {
      alert("Falha no login. Verifique usuário e senha.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/users/signup', {
        username: credentials.username,
        email: credentials.email,
        password: credentials.password
      });
      alert("Conta criada com sucesso! Faça seu login.");
      setIsRegistering(false);
    } catch (err) {
      alert("Erro ao cadastrar. Verifique se o usuário já existe.");
    }
  };

  // --- ANÁLISE ---
  const handleAnalyzeAll = async () => {
    if (files.length === 0) return alert("Selecione imagens primeiro!");
    setLoading(true);
    const newResults = [];
    
    for (let file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const res = await axios.post(`http://localhost:8000/analysis/upload?conf=${confidence}`, formData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        newResults.push({ 
          name: file.name, 
          ...res.data, 
          url: URL.createObjectURL(file) 
        });
      } catch (err) {
        newResults.push({ name: file.name, error: "Erro na análise" });
      }
    }
    setResults(newResults);
    setLoading(false);
  };

  const downloadCSV = () => {
    const headers = ["Arquivo", "Inteiras", "Quebradas", "Predadas", "Total"];
    const rows = results.map(r => [
      r.name, r.inteiras, r.quebradas, r.predadas, (r.inteiras + r.quebradas + r.predadas)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "relatorio_sementes.csv";
    link.click();
  };

  // --- CÁLCULO DE ESTATÍSTICAS ---
  const stats = useMemo(() => {
    return results.reduce((acc, curr) => ({
      inteiras: acc.inteiras + (Number(curr.inteiras) || 0),
      quebradas: acc.quebradas + (Number(curr.quebradas) || 0),
      predadas: acc.predadas + (Number(curr.predadas) || 0),
    }), { inteiras: 0, quebradas: 0, predadas: 0 });
  }, [results]);

  const chartData = {
    labels: ['Inteiras', 'Quebradas', 'Predadas'],
    datasets: [{
      label: 'Quantidade Total',
      data: [stats.inteiras, stats.quebradas, stats.predadas],
      backgroundColor: ['#4CAF50', '#FF4B4B', '#FFA500'],
      hoverOffset: 15,
      borderWidth: 0,
    }]
  };

  // --- RENDERIZAÇÃO LOGIN ---
  if (!token) {
    return (
      <div className="st-login-wrapper">
        <div className="st-login-card">
          <h1>🌱 Seed Detector AI</h1>
          <p>{isRegistering ? 'Crie sua conta' : 'Acesse o painel de análise'}</p>
          <form onSubmit={isRegistering ? handleRegister : handleLogin}>
            <input type="text" placeholder="Usuário" required onChange={e => setCredentials({...credentials, username: e.target.value})} />
            {isRegistering && (
              <input type="email" placeholder="E-mail" required onChange={e => setCredentials({...credentials, email: e.target.value})} />
            )}
            <input type="password" placeholder="Senha" required onChange={e => setCredentials({...credentials, password: e.target.value})} />
            <button type="submit" className="st-button-primary">
              {isRegistering ? 'Cadastrar Agora' : 'Entrar'}
            </button>
          </form>
          <button className="st-toggle-link" onClick={() => setIsRegistering(!isRegistering)}>
            {isRegistering ? 'Já tem conta? Login' : 'Não tem conta? Registre-se'}
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO DASHBOARD ---
  return (
    <div className="st-app">
      <aside className="st-sidebar">
        <div className="st-sidebar-header">
          <h2>🌱 Seed AI</h2>
          <span className="st-badge">v3.0</span>
        </div>

        <div className="st-menu">
            <button className={activeTab === 'analise' ? 'active' : ''} onClick={() => setActiveTab('analise')}>🔍 Análise Local</button>
            <button className={activeTab === 'estatisticas' ? 'active' : ''} onClick={() => setActiveTab('estatisticas')}>📊 Estatísticas Gerais</button>
        </div>

        <hr className="st-divider" />
        
        <div className="st-sidebar-item">
          <label>📁 Carregar Imagens</label>
          <input type="file" multiple onChange={handleFileChange} />
          
          {previewUrls.length > 0 && (
            <div className="st-sidebar-preview-container">
               <img src={previewUrls[0]} className="st-upload-preview" alt="Preview" />
               {files.length > 1 && <p>+ {files.length - 1} fotos selecionadas</p>}
            </div>
          )}
        </div>

        <div className="st-sidebar-item">
          <label>🎯 Confiança: <strong>{Math.round(confidence * 100)}%</strong></label>
          <input 
            type="range" 
            min="0.01" 
            max="1.00" 
            step="0.01" 
            value={confidence} 
            onChange={e => setConfidence(parseFloat(e.target.value))} 
            className="st-slider" 
          />
        </div>

        <button onClick={handleAnalyzeAll} className="st-button-primary" disabled={loading}>
          {loading ? 'Processando...' : results.length > 0 ? '🔄 Refazer Análise' : 'Rodar Análise 🚀'}
        </button>

        <div className="st-sidebar-footer">
          {results.length > 0 && (
            <button onClick={downloadCSV} className="st-button-csv">📥 Exportar Planilha</button>
          )}
          <button onClick={() => setToken(null)} className="st-button-logout">Sair do Sistema</button>
        </div>
      </aside>

      <main className="st-main">
        {activeTab === 'analise' ? (
          <div className="st-analysis-view">
            <header className="st-main-header">
              <h1>🔍 Detecção por Imagem</h1>
              <p>Resultados individuais para cada amostra.</p>
            </header>
            <div className="st-grid">
              {results.map((res, i) => (
                <div key={i} className="st-metric-card">
                  {res.url ? (
                    <img src={res.url} className="st-img-preview" alt="amostra" />
                  ) : (
                    <div className="st-img-placeholder">
                      <span>📷 Sem visualização no histórico</span>
                    </div>
                  )}
                  <div className="card-content">
                    <h3>{res.name}</h3>
                    <div className="st-metrics">
                      <div className="st-metric"><span>Inteiras</span><strong>{res.inteiras}</strong></div>
                      <div className="st-metric"><span>Quebradas</span><strong>{res.quebradas}</strong></div>
                      <div className="st-metric"><span>Predadas</span><strong>{res.predadas}</strong></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="st-stats-view">
            <header className="st-main-header">
              <h1>📊 Estatísticas do Lote</h1>
              <p>Resumo total de <strong>{results.length}</strong> análises.</p>
            </header>
            
            {results.length > 0 ? (
              <div className="st-chart-grid">
                <div className="st-chart-card">
                  <h3>Distribuição Relativa</h3>
                  <div style={{width: '100%', height: '300px'}}>
                    <Pie data={chartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
                <div className="st-chart-card">
                  <h3>Volume Total</h3>
                  <div style={{width: '100%', height: '300px'}}>
                    <Bar data={chartData} options={{ maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="st-empty-state">
                 <p>Nenhuma análise realizada para gerar estatísticas.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;