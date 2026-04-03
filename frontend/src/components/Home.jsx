import { useEffect, useRef, useState } from "react";
import seedsImg from "../assets/demo-seeds.png";
import futureImg from "../assets/multispectral-future.png";

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

const STATS = [
  { value: "94%", label: "Precisão média" },
  { value: "< 2s", label: "Por amostra" },
  { value: "10k+", label: "Análises feitas" },
  { value: "500+", label: "Produtores ativos" },
];

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, className, style }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        ...style
      }}
    >
      {children}
    </div>
  );
}

const Home = ({ onStart }) => {
  const [detecting, setDetecting] = useState(false);
  const [detectStep, setDetectStep] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleDetect = () => {
    setDetecting(false);
    setDetectStep(1);
    setTimeout(() => {
      setDetecting(true);
      setDetectStep(2);
    }, 900);
  };

  return (
    <div className="home-wrapper">

      {/* ── NAV ── */}
      <nav
        className="home-nav"
        aria-label="Navegação principal"
        style={{
          boxShadow: navScrolled ? "0 4px 24px rgba(0,0,0,0.08)" : "none",
          transition: "box-shadow 0.3s ease",
        }}
      >
        <div className="logo">
          🌱 Seedetector AI{" "}
          <span>v3.0</span>
        </div>
        <div className="nav-links">
          <a href="#sobre">Sobre</a>
          <a href="#planos">Planos</a>
          <button className="btn-login-small" onClick={onStart}>Entrar</button>
        </div>
      </nav>

      <main>

        {/* ── HERO ── */}
        <header className="hero-section" style={{ position: "relative", overflow: "hidden" }}>
          <div aria-hidden style={{
            position: "absolute",
            width: "700px", height: "700px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(46,125,50,0.06) 0%, transparent 70%)",
            top: "-200px", right: "-100px",
            pointerEvents: "none",
          }} />

          <div className="hero-content" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ marginBottom: "28px" }}>
              <span className="badge-new" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: "#2e7d32", display: "inline-block",
                  animation: "pulse-dot 2s infinite"
                }} />
                Automatização com YOLO no Agro 🚀
              </span>
            </div>

            <h1 style={{ letterSpacing: "-1.5px" }}>
              A revolução da{" "}
              <span style={{
                background: "linear-gradient(135deg, #2e7d32, #4caf50)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                análise de sementes
              </span>
              <br />na palma da sua mão.
            </h1>

            <p>
              Utilize visão computacional avançada para classificar amostras em segundos.
              Precisão industrial para quem não pode perder tempo.
            </p>

            <div className="hero-btns" style={{ marginBottom: "56px" }}>
              <button className="btn-main" onClick={onStart} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                Iniciar Diagnóstico Grátis <span>→</span>
              </button>
              <button
                className="btn-secondary"
                onClick={() => document.getElementById("demo").scrollIntoView({ behavior: "smooth" })}
                style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <span>▶</span> Ver Demonstração
              </button>
            </div>

            <div style={{
              display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap",
              paddingTop: "40px", borderTop: "1px solid rgba(46,125,50,0.15)",
              maxWidth: "700px", margin: "0 auto",
            }}>
              {STATS.map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 900, color: "#1b1f23", letterSpacing: "-1px", lineHeight: 1 }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: "11px", color: "#667085", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", marginTop: "6px" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* ── SOBRE ── */}
        <section id="sobre" className="about-section">

          <Reveal>
            <div className="about-container">
              <article className="about-text-content">
                <span className="section-subtitle">Quem Somos</span>
                <h2>Tecnologia que entende o Agro</h2>
                <p style={{ lineHeight: 1.8, color: "#667085", fontSize: "1.05rem" }}>
                  O Seedetector AI nasceu da necessidade de eliminar o erro humano na triagem de qualidade.
                  Nossa plataforma utiliza redes neurais profundas para identificar padrões que o olho humano
                  pode deixar passar, garantindo lotes mais homogêneos e lucrativos.
                </p>
                <ul className="about-list">
                  {[
                    "Redução de 90% no tempo de triagem",
                    "Relatórios auditáveis em tempo real",
                    "Integração total com seu estoque",
                  ].map((item, i) => (
                    <li key={i}>
                      <span style={{
                        width: "22px", height: "22px", borderRadius: "50%",
                        background: "#d1fadf", color: "#2e7d32",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 700, flexShrink: 0
                      }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </article>

              <figure className="about-image-wrapper">
                <div className="about-image-placeholder">
                  <img
                    src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=800"
                    alt="Close-up de sementes de soja sendo analisadas"
                  />
                  <figcaption className="image-overlay-card">
                    <strong>+94%</strong>
                    <span>de Precisão Média</span>
                  </figcaption>
                </div>
              </figure>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="about-container-mission-vision">
              <div className="mission-vision-text">
                {[
                  {
                    sub: "Nossa Missão", title: "Levar precisão ao campo",
                    text: "Democratizar o acesso à análise inteligente de sementes, tornando tecnologias avançadas acessíveis desde pequenos produtores até grandes operações."
                  },
                  {
                    sub: "Nossa Visão", title: "Ser referência no agro digital",
                    text: "Construir o futuro da análise agrícola com IA, integrando sensores, visão computacional e dados em tempo real para criar um novo padrão global de qualidade e eficiência."
                  }
                ].map((item, i) => (
                  <article key={i} className="about-text-content">
                    <span className="section-subtitle">{item.sub}</span>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "8px 0 10px", letterSpacing: "-0.5px" }}>{item.title}</h3>
                    <p style={{ lineHeight: 1.8, color: "#667085" }}>{item.text}</p>
                  </article>
                ))}
              </div>
              <figure className="mission-vision-image">
                <img
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800"
                  alt="Tecnologia no campo"
                />
              </figure>
            </div>
          </Reveal>

          <div className="about-grid" style={{ marginTop: "5rem" }}>
            {DIFERENCIAIS.map((item, idx) => (
              <Reveal key={idx} delay={idx * 100}>
                <div className="about-card" style={{ height: "100%", cursor: "default" }}>
                  <div className="icon">{item.icon}</div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "10px" }}>{item.title}</h3>
                  <p style={{ color: "#667085", lineHeight: 1.7, fontSize: "0.95rem" }}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

        </section>

        {/* ── DEMO ── */}
        <Reveal>
          <section id="demo" className="demo-section">
            <div style={{ marginBottom: "48px" }}>
              <span className="section-subtitle" style={{ display: "block", marginBottom: "10px" }}>
                Demonstração ao Vivo
              </span>
              <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)", fontWeight: 800, letterSpacing: "-0.8px", color: "#1b1f23", margin: 0 }}>
                Veja a IA em ação
              </h2>
            </div>

            <div
              className="demo-container"
              style={{
                background: "white", borderRadius: "24px",
                border: "1px solid #eaecf0", boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
                overflow: "hidden", padding: "0", alignItems: "stretch",
              }}
            >
              <div className="demo-image" style={{ position: "relative", flex: "none", overflow: "hidden" }}>
                <img src={seedsImg} alt="sementes sendo analisadas" style={{ display: "block", width: "100%" }} />

                {detectStep === 1 && !detecting && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "rgba(255,255,255,0.75)", backdropFilter: "blur(4px)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: "12px",
                  }}>
                    <div style={{
                      width: "36px", height: "36px",
                      border: "3px solid #d1fadf", borderTopColor: "#2e7d32",
                      borderRadius: "50%", animation: "spin 0.8s linear infinite"
                    }} />
                    <span style={{ color: "#2e7d32", fontWeight: 700, fontSize: "13px" }}>
                      Analisando amostras...
                    </span>
                  </div>
                )}

                {detecting && (
                  <>
                    <div className="yolo-box box1"><span>Whole Seed 94%</span></div>
                    <div className="yolo-box box2"><span>Broken Seed 88%</span></div>
                  </>
                )}
              </div>

              <div className="demo-info" style={{ padding: "40px", textAlign: "left" }}>
                <span className="section-subtitle">Modelo YOLO v8</span>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#1b1f23", margin: "10px 0 14px", letterSpacing: "-0.5px" }}>
                  Detecção automática em tempo real
                </h3>
                <p style={{ color: "#667085", lineHeight: 1.8, marginBottom: "28px" }}>
                  Nosso modelo analisa sementes automaticamente,
                  classificando amostras em segundos com precisão superior a 94%.
                </p>
                <button
                  className="btn-main"
                  onClick={handleDetect}
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}
                >
                  {detecting ? "🔁 Analisar Novamente" : "▶ Testar Agora"}
                </button>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── FUTURO ── */}
        <Reveal>
          <section className="future-section" style={{ position: "relative", overflow: "hidden" }}>
            <div aria-hidden style={{
              position: "absolute", width: "500px", height: "500px", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(76,175,80,0.1) 0%, transparent 70%)",
              top: "-100px", right: "-50px", pointerEvents: "none",
            }} />

            <div className="future-container" style={{ position: "relative", zIndex: 1 }}>
              <div className="future-text">
                <span className="section-subtitle" style={{ color: "#4caf50" }}>Próxima Evolução</span>
                <h2 style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", fontWeight: 800, letterSpacing: "-0.8px", margin: "12px 0 16px" }}>
                  Análise com câmeras multiespectrais
                </h2>
                <p style={{ opacity: 0.75, lineHeight: 1.8, maxWidth: "480px", marginBottom: "28px" }}>
                  Estamos expandindo o Seedetector AI para trabalhar com sensores
                  multiespectrais capazes de identificar propriedades invisíveis ao olho humano.
                </p>
                <ul>
                  {[
                    "📷 Integração com câmeras científicas",
                    "🌈 Análise espectral das sementes",
                    "🧬 Detecção de danos internos",
                    "📊 Diagnóstico avançado de qualidade",
                  ].map((item, i) => (
                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4caf50", flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="future-video">
                <img
                  src={futureImg}
                  alt="Análise multiespectral de sementes"
                  style={{ transition: "transform 0.5s ease" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                />
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── PLANOS ── */}
        <Reveal>
          <section id="planos" className="pricing-section">
            <header className="section-header">
              <span className="section-subtitle" style={{ display: "block", marginBottom: "12px" }}>Preços</span>
              <h2>Escolha sua potência de análise</h2>
              <p>Planos flexíveis para produtores de todos os tamanhos.</p>
            </header>

            <div className="pricing-container">
              {PLANOS.map((p, i) => (
                <article key={i} className={`price-card ${p.classe} ${p.popular ? "featured" : ""}`}>
                  {p.popular && <div className="popular-tag">⭐ Mais Popular</div>}
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 8px", color: "#667085" }}>{p.nome}</h3>
                  <div className="price-tag">{p.preco}</div>
                  <p className="conf-info">Limiar: <strong>{p.confianca}</strong></p>
                  <p style={{ color: "#667085", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "20px" }}>{p.desc}</p>

                  <ul className="benefits-list">
                    {p.beneficios.map((b, idx) => (
                      <li key={idx}>
                        <span style={{
                          width: "20px", height: "20px", borderRadius: "50%",
                          background: "#d1fadf", color: "#2e7d32",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          fontSize: "11px", fontWeight: 700, flexShrink: 0
                        }}>✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>

                  <button className="btn-plan" onClick={onStart}>
                    {p.preco === "Gratuito" ? "Começar Agora →" : "Selecionar Plano →"}
                  </button>
                </article>
              ))}
            </div>
          </section>
        </Reveal>

      </main>

      {/* ── FOOTER ── */}
      <footer className="main-footer">
        <div className="footer-content" style={{ flexDirection: "column", gap: "48px" }}>

          {/* Linha superior */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "40px", width: "100%" }}>

            {/* Logo + descrição + redes */}
            <div style={{ maxWidth: "260px" }}>
              <h4 style={{ fontSize: "1.3rem", marginBottom: "8px" }}>🌱 Seedetector AI</h4>
              <p style={{ color: "#98a2b3", lineHeight: 1.7, fontSize: "0.9rem" }}>
                Inovação digital para o agronegócio moderno. Precisão industrial ao alcance de todos.
              </p>
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                {[
                  { label: "Instagram", icon: "📸", href: "https://instagram.com" },
                  { label: "LinkedIn", icon: "💼", href: "https://linkedin.com" },
                ].map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    style={{
                      width: "38px", height: "38px", borderRadius: "10px",
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1rem", textDecoration: "none", transition: "background 0.2s ease",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links de navegação */}
            <div>
              <p style={{ fontWeight: 700, marginBottom: "16px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "#98a2b3" }}>
                Navegação
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Sobre", href: "#sobre" },
                  { label: "Planos", href: "#planos" },
                  { label: "Demonstração", href: "#demo" },
                ].map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    style={{ color: "#98a2b3", textDecoration: "none", fontSize: "0.95rem", fontWeight: 500, transition: "color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "white"}
                    onMouseLeave={e => e.currentTarget.style.color = "#98a2b3"}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Contato */}
            <div>
              <p style={{ fontWeight: 700, marginBottom: "16px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "1px", color: "#98a2b3" }}>
                Contato
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <a
                  href="mailto:contato@seedai.com.br"
                  style={{ color: "#98a2b3", textDecoration: "none", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "white"}
                  onMouseLeave={e => e.currentTarget.style.color = "#98a2b3"}
                >
                  📧 contato@seedai.com.br
                </a>
                <a
                  href="https://wa.me/5561999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#98a2b3", textDecoration: "none", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px", transition: "color 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = "white"}
                  onMouseLeave={e => e.currentTarget.style.color = "#98a2b3"}
                >
                  📱 (61) 99999-9999
                </a>
              </div>
            </div>

          </div>

          {/* Linha inferior — copyright */}
          <div style={{
            width: "100%", borderTop: "1px solid rgba(255,255,255,0.08)",
            paddingTop: "24px", display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: "12px",
          }}>
            <p style={{ color: "#667085", fontSize: "0.85rem", margin: 0 }}>
              © {new Date().getFullYear()} Seedetector AI. Todos os direitos reservados.
            </p>
            <p style={{ color: "#667085", fontSize: "0.85rem", margin: 0 }}>
              Feito com 🌱 para o agronegócio brasileiro
            </p>
          </div>

        </div>
      </footer>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 3px rgba(46,125,50,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(46,125,50,0.08); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default Home;