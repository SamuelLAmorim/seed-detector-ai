
// 1. Extração de Dados 
const PLANOS = [
  {
    nome: "Semente Free",
    preco: "Gratuito",
    confianca: "50% (Fixo)",
    desc: "Perfeito para estudantes e pequenos produtores testarem a tecnologia.",
    beneficios: ["Até 5 fotos por análise", "Relatório simples", "Suporte via comunidade"],
    classe: "plan-free"
  },
  {
    nome: "Lavoura Pro",
    preco: "R$ 99/mês",
    confianca: "30% a 70% (Ajustável)",
    desc: "O equilíbrio ideal entre flexibilidade e produtividade para o dia a dia.",
    beneficios: ["Fotos ilimitadas", "Exportação CSV completa", "Histórico de 30 dias"],
    classe: "plan-pro",
    popular: true
  },
  {
    nome: "Safra Ultra",
    preco: "R$ 299/mês",
    confianca: "85% a 100% (Rigoroso)",
    desc: "Máxima precisão para laboratórios e empresas de exportação de sementes.",
    beneficios: ["IA de alta sensibilidade", "Análises prioritárias", "Dashboard de estatísticas avançado"],
    classe: "plan-ultra"
  }
];

const DIFERENCIAIS = [
  { icon: "🔬", title: "Precisão Científica", desc: "Modelos treinados com milhares de imagens reais, garantindo acerto superior a 94%." },
  { icon: "⚡", title: "Velocidade Real-Time", desc: "Processe lotes inteiros de imagens em menos de 2 segundos por amostra." },
  { icon: "📈", title: "Gestão de Dados", desc: "Transforme visualizações em planilhas CSV e gráficos de pizza para decisão estratégica." }
];

const Home = ({ onStart }) => {
  return (
    <div className="home-wrapper">
      {/* HEADER: Navegação Principal */}
      <nav className="home-nav" aria-label="Navegação principal">
        <div className="logo" aria-label="Seedetector AI Home">
          🌱 Seedetector AI <span>v3.0</span>
        </div>
        <div className="nav-links">
          <a href="#sobre">Sobre</a>
          <a href="#planos">Planos</a>
          <button className="btn-login-small" onClick={onStart}>Entrar</button>
        </div>
      </nav>

      {/* MAIN: Conteúdo Principal do Site */}
      <main>
        {/* HERO SECTION */}
        <header className="hero-section">
          <div className="hero-content">
            <span className="badge-new">Automatização com YOLO no Agro 🚀</span>
            <h1>A revolução da <span>análise de sementes</span> na palma da sua mão.</h1>
            <p>Utilize visão computacional avançada para classificar amostras em segundos. Precisão industrial para quem não pode perder tempo.</p>
            <div className="hero-btns">
              <button className="btn-main" onClick={onStart}>Iniciar Diagnóstico Grátis</button>
              <button
                className="btn-secondary"
                onClick={() =>
                  document.getElementById("demo").scrollIntoView({ behavior: "smooth" })
                }
              >
                Ver Demonstração
              </button>
            </div>
          </div>
        </header>
               
        {/* DEMONSTRAÇÃO */}
        <section id="demo" className="demo-section">
          <h2>Veja a IA em ação</h2>
        
          <div className="demo-container">
            <img
              src="https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=800&q=80"
              alt="sementes sendo analisadas"
            />
        
            <div className="demo-info">
              <p>
                Nosso modelo YOLOv11 analisa sementes automaticamente,
                classificando amostras em segundos.
              </p>
        
              <button className="btn-main" onClick={onStart}>
                Testar Agora
              </button>
            </div>
          </div>
        </section>
        {/* SECTION: SOBRE NÓS */}
        <section id="sobre" className="about-section">
          <div className="about-container">
            <article className="about-text-content">
              <span className="section-subtitle">Inovação no Campo</span>
              <h2>Tecnologia que entende a terra</h2>
              <p>
                O Seed AI nasceu da necessidade de eliminar o erro humano na triagem de qualidade. 
                Nossa plataforma utiliza redes neurais profundas para identificar padrões que o olho humano 
                pode deixar passar, garantindo lotes mais homogêneos e lucrativos.
              </p>
              <ul className="about-list">
                <li>✅ Redução de 90% no tempo de triagem</li>
                <li>✅ Relatórios auditáveis em tempo real</li>
                <li>✅ Integração total com seu estoque</li>
              </ul>
            </article>
            
            <figure className="about-image-wrapper">
              <div className="about-image-placeholder">
                <img 
                   src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=800" 
                   alt="Close-up de sementes de soja de alta qualidade sendo analisadas" 
                />
                <figcaption className="image-overlay-card">
                  <strong>+94%</strong>
                  <span>de Precisão Média</span>
                </figcaption>
              </div>
            </figure>
          </div>

          {/* GRID DE DIFERENCIAIS */}
          <div className="about-grid">
            {DIFERENCIAIS.map((item, idx) => (
              <div key={idx} className="about-card">
                <div className="icon" aria-hidden="true">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: PLANOS */}
        <section id="planos" className="pricing-section">
          <header className="section-header">
            <h2>Escolha sua potência de análise</h2>
            <p>Planos flexíveis para produtores de todos os tamanhos.</p>
          </header>

          <div className="pricing-container">
            {PLANOS.map((p, i) => (
              <article key={i} className={`price-card ${p.classe} ${p.popular ? 'featured' : ''}`}>
                {p.popular && <div className="popular-tag">Mais Popular</div>}
                <h3>{p.nome}</h3>
                <div className="price-tag" aria-label={`Preço: ${p.preco}`}>{p.preco}</div>
                <p className="conf-info">Limiar: <strong>{p.confianca}</strong></p>
                <ul className="benefits-list">
                  {p.benefits?.map((b, idx) => <li key={idx}><span>✅</span> {b}</li>) || 
                   p.beneficios.map((b, idx) => <li key={idx}><span>✅</span> {b}</li>)}
                </ul>
                <button className="btn-plan" onClick={onStart}>
                  {p.preco === "Gratuito" ? "Começar Agora" : "Selecionar Plano"}
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER: Rodapé */}
      <footer className="main-footer">
        <div className="footer-content">
          <section className="footer-info">
            <h4>🌱 Seedetector AI</h4>
            <p>Inovação digital para o agronegócio moderno.</p>
          </section>
          <section className="footer-contact" aria-label="Informações de contato">
            <p>Suporte: <a href="mailto:contato@seedai.com.br">contato@seedai.com.br</a></p>
            <p>Telefone: <a href="tel:11999999999">(11) 99999-9999</a></p>
          </section>
        </div>
      </footer>
    </div>
  );
};

export default Home;