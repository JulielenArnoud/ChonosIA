import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Upload, LogOut, FileText, FileImage, Trash2, Eye, ShieldCheck, User, ChevronLeft, AlertCircle } from "lucide-react";
import { toast, Toaster } from "sonner";

// ── Types ─────────────────────────────────────────────────────────────────────

type Screen = "landing" | "auth" | "dashboard";
type AuthMode = "login" | "register";
type Role = "admin" | "user";

interface AppUser {
  email: string;
  name: string;
  role: Role;
}

interface DocFile {
  id: string;
  name: string;
  type: "pdf" | "image";
  size: string;
  date: string;
  ownerEmail: string;
  ownerName: string;
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const CREDENTIALS: Record<string, { password: string; user: AppUser }> = {
  "admin@gmail.com": {
    password: "Adm123",
    user: { email: "admin@gmail.com", name: "Administrador", role: "admin" },
  },
  "usuario@gmail.com": {
    password: "Usuario123",
    user: { email: "usuario@gmail.com", name: "João Almeida", role: "user" },
  },
};

const SEED_FILES: DocFile[] = [
  { id: "CHR-0001", name: "Contrato_Servicos_2024.pdf", type: "pdf", size: "1.8 MB", date: "10/06/2024", ownerEmail: "usuario@gmail.com", ownerName: "João Almeida" },
  { id: "CHR-0002", name: "Nota_Fiscal_052024.pdf", type: "pdf", size: "420 KB", date: "08/06/2024", ownerEmail: "usuario@gmail.com", ownerName: "João Almeida" },
  { id: "CHR-0003", name: "Comprovante_Residencia.png", type: "image", size: "980 KB", date: "05/06/2024", ownerEmail: "usuario@gmail.com", ownerName: "João Almeida" },
  { id: "CHR-0004", name: "Relatorio_Mensal_MAI.pdf", type: "pdf", size: "3.2 MB", date: "01/06/2024", ownerEmail: "admin@gmail.com", ownerName: "Administrador" },
];

// ── Logo ──────────────────────────────────────────────────────────────────────

function ChronosLogo({ size = 34 }: { size?: number }) {
  const r = 15, cx = 20, cy = 20;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx={cx} cy={cy} r={r} stroke="#60b8ff" strokeWidth="2"
        strokeDasharray={`${circ * 0.78} ${circ * 0.22}`}
        strokeDashoffset={`${circ * 0.055}`} strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + 8 * Math.sin((-30 * Math.PI) / 180)} y2={cy - 8 * Math.cos((-30 * Math.PI) / 180)}
        stroke="#60b8ff" strokeWidth="2.5" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={cx + 11 * Math.sin((60 * Math.PI) / 180)} y2={cy - 11 * Math.cos((60 * Math.PI) / 180)}
        stroke="#60b8ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
      <circle cx={cx} cy={cy} r="2.5" fill="#60b8ff" />
      <line x1={cx} y1={cy - r + 2.5} x2={cx} y2={cy - r + 5.5} stroke="#60b8ff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1={cx + r - 2.5} y1={cy} x2={cx + r - 5.5} y2={cy} stroke="#60b8ff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1={cx - r + 2.5} y1={cy} x2={cx - r + 5.5} y2={cy} stroke="#60b8ff" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Document Illustration ─────────────────────────────────────────────────────

function DocIllustration() {
  return (
    <svg width="200" height="230" viewBox="0 0 200 230" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back doc */}
      <g transform="rotate(-7, 100, 115)">
        <rect x="30" y="18" width="130" height="165" rx="8" fill="#1a3a6b" stroke="rgba(96,184,255,0.15)" strokeWidth="1.5" />
      </g>
      {/* Middle doc */}
      <g transform="rotate(-3, 100, 115)">
        <rect x="30" y="18" width="130" height="165" rx="8" fill="#1e4278" stroke="rgba(96,184,255,0.25)" strokeWidth="1.5" />
      </g>
      {/* Front doc body */}
      <rect x="30" y="14" width="130" height="165" rx="8" fill="#1e4278" stroke="rgba(96,184,255,0.6)" strokeWidth="1.5" />
      {/* Dog-ear clip path effect: cover the top-right corner and draw the fold */}
      <polygon points="130,14 160,14 160,44 130,44" fill="#1e4278" />
      <polygon points="130,14 160,44 130,44" fill="#254a85" stroke="rgba(96,184,255,0.35)" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Title line */}
      <rect x="48" y="60" width="86" height="4" rx="2" fill="rgba(96,184,255,0.45)" />
      {/* Text lines */}
      <rect x="48" y="80" width="100" height="3" rx="1.5" fill="rgba(96,184,255,0.18)" />
      <rect x="48" y="92" width="80" height="3" rx="1.5" fill="rgba(96,184,255,0.14)" />
      <rect x="48" y="104" width="92" height="3" rx="1.5" fill="rgba(96,184,255,0.14)" />
      <rect x="48" y="116" width="60" height="3" rx="1.5" fill="rgba(96,184,255,0.14)" />
      {/* Separator */}
      <line x1="48" y1="135" x2="152" y2="135" stroke="rgba(96,184,255,0.12)" strokeWidth="1" />
      {/* Chronos mark embedded in document */}
      <g transform="translate(95, 160) scale(0.7)" opacity="0.55">
        <circle cx="0" cy="0" r="13" stroke="#60b8ff" strokeWidth="1.5" fill="none"
          strokeDasharray="56 26" strokeDashoffset="3" strokeLinecap="round" />
        <line x1="0" y1="0" x2="0" y2="-7" stroke="#60b8ff" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="0" x2="6" y2="3" stroke="#60b8ff" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        <circle cx="0" cy="0" r="2" fill="#60b8ff" />
      </g>
    </svg>
  );
}

// ── Landing Page ──────────────────────────────────────────────────────────────

function LandingPage({ onNav }: { onNav: (mode: AuthMode) => void }) {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <ChronosLogo size={36} />
          <div>
            <div className="font-display font-semibold text-base text-foreground leading-none tracking-tight">CHRONOS</div>
            <div className="text-[9px] font-mono text-primary tracking-[0.3em] mt-0.5">IA</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNav("login")}
            className="px-5 py-2.5 rounded border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:text-primary transition-colors"
          >
            Entrar
          </button>
          <button
            onClick={() => onNav("register")}
            className="px-5 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Criar conta
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <DocIllustration />
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight mb-4">
            Gestão de<br />
            <span style={{ color: "#60b8ff" }}>Documentos</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed mb-10">
            Armazene, organize e acesse seus documentos com segurança e controle total.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNav("login")}
              className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground text-base font-medium rounded hover:opacity-90 transition-opacity min-w-[200px]"
            >
              Entrar na minha conta
            </button>
            <button
              onClick={() => onNav("register")}
              className="w-full sm:w-auto px-8 py-4 border border-border text-foreground text-base font-medium rounded hover:border-primary/60 hover:text-primary transition-colors min-w-[200px]"
            >
              Criar uma conta
            </button>
          </div>
        </motion.div>
      </div>

      <footer className="text-center py-6 border-t border-border">
        <p className="text-xs text-muted-foreground font-mono">© 2026 CHRONOS IA · Todos os direitos reservados</p>
      </footer>
    </div>
  );
}

// ── Auth Page ─────────────────────────────────────────────────────────────────

function AuthPage({
  mode,
  onModeChange,
  onBack,
  onLogin,
}: {
  mode: AuthMode;
  onModeChange: (m: AuthMode) => void;
  onBack: () => void;
  onLogin: (user: AppUser) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (mode === "login") {
        const cred = CREDENTIALS[email.toLowerCase()];
        if (cred && cred.password === password) {
          onLogin(cred.user);
        } else {
          setError("E-mail ou senha incorretos. Verifique e tente novamente.");
        }
      } else {
        if (!name.trim()) { setError("Por favor, informe seu nome completo."); return; }
        if (!email.includes("@")) { setError("Informe um e-mail válido."); return; }
        if (password.length < 6) { setError("A senha deve ter no mínimo 6 caracteres."); return; }
        // New register → create user account (demo only)
        onLogin({ email, name, role: "user" });
        toast.success("Conta criada com sucesso!", {
          style: { background: "#1e4278", border: "1px solid rgba(96,184,255,0.25)", color: "#e8f0fc" },
        });
      }
    }, 900);
  };

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col items-center justify-center px-6 py-12">
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38 }}
        className="w-full max-w-[420px]"
      >
        {/* Back */}
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft size={16} />
          Voltar ao início
        </button>

        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <ChronosLogo size={38} />
          <div>
            <div className="font-display font-semibold text-lg text-foreground tracking-tight leading-none">CHRONOS IA</div>
            <div className="text-[10px] font-mono text-muted-foreground mt-0.5">Gestão de Documentos</div>
          </div>
        </div>

        <div className="mb-7">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-1.5">
            {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Informe seus dados para acessar seus documentos." : "Preencha os dados para começar a usar o CHRONOS IA."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-card border border-border rounded px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary/55 focus:ring-2 focus:ring-primary/20 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              placeholder="seu@email.com"
              className="w-full bg-card border border-border rounded px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary/55 focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              {isLogin && (
                <button type="button" className="text-sm text-primary/70 hover:text-primary transition-colors">
                  Esqueci a senha
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
              className="w-full bg-card border border-border rounded px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary/55 focus:ring-2 focus:ring-primary/20 transition-colors"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-red-500/8 border border-red-500/25 rounded text-sm text-red-400">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-medium py-4 rounded text-base hover:opacity-90 transition-opacity disabled:opacity-65 flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {isLogin ? "Verificando..." : "Criando conta..."}
              </>
            ) : (
              isLogin ? "Entrar na minha conta" : "Criar conta agora"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-7">
          {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
          <button
            onClick={() => { onModeChange(isLogin ? "register" : "login"); setError(""); }}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

function Dashboard({ user, onLogout }: { user: AppUser; onLogout: () => void }) {
  const [files, setFiles] = useState<DocFile[]>(SEED_FILES);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const visible = user.role === "admin" ? files : files.filter((f) => f.ownerEmail === user.email);

  const addFile = (fileName: string, rawSize: number) => {
    const next: DocFile = {
      id: `CHR-${String(files.length + 1).padStart(4, "0")}`,
      name: fileName,
      type: /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName) ? "image" : "pdf",
      size: `${(rawSize / 1024 / 1024).toFixed(1)} MB`,
      date: new Date().toLocaleDateString("pt-BR"),
      ownerEmail: user.email,
      ownerName: user.name,
    };
    setFiles((p) => [next, ...p]);
    toast.success("Documento enviado com sucesso!", {
      description: fileName,
      style: { background: "#0c1525", border: "1px solid rgba(0,200,232,0.18)", color: "#c8dcf0" },
    });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) addFile(f.name, f.size);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) addFile(f.name, f.size);
  };

  const confirmDelete = (id: string) => {
    setFiles((p) => p.filter((f) => f.id !== id));
    setDeleteTarget(null);
    toast.success("Documento excluído.", {
      style: { background: "#0c1525", border: "1px solid rgba(0,200,232,0.18)", color: "#c8dcf0" },
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b border-border px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <ChronosLogo size={32} />
          <div className="hidden sm:block">
            <div className="font-display font-semibold text-sm text-foreground leading-none">CHRONOS IA</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${user.role === "admin" ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-primary/15 text-primary border border-primary/25"}`}>
              {user.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-foreground leading-none mb-0.5">{user.name}</div>
              <div className="flex items-center gap-1">
                {user.role === "admin" ? (
                  <span className="text-[10px] font-mono text-violet-400 flex items-center gap-1">
                    <ShieldCheck size={10} /> Administrador
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                    <User size={10} /> Usuário
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-8 py-10 space-y-10">

        {/* Upload section */}
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-1">Enviar documento</h2>
          <p className="text-sm text-muted-foreground mb-5">Formatos aceitos: PDF, PNG, JPG. Máximo 50 MB por arquivo.</p>

          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl py-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all select-none ${isDragging ? "border-primary/70 bg-primary/5" : "border-border/60 hover:border-primary/45 hover:bg-primary/[0.025]"}`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors ${isDragging ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"}`}>
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-foreground">
                Arraste um arquivo aqui
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ou <span className="text-primary font-medium">clique para selecionar</span>
              </p>
            </div>
          </div>
          <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleSelect} />
        </section>

        {/* Files section */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                {user.role === "admin" ? "Todos os documentos" : "Meus documentos"}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {visible.length} {visible.length === 1 ? "documento" : "documentos"}
                {user.role === "admin" && " · visão do administrador"}
              </p>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 border border-border/50 rounded-xl">
              <FileText size={32} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Nenhum documento enviado ainda</p>
              <button
                onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity mt-1"
              >
                <Upload size={15} />
                Enviar primeiro documento
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-border/80 transition-colors"
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${file.type === "image" ? "bg-violet-500/10 border-violet-500/20" : "bg-primary/10 border-primary/20"}`}>
                    {file.type === "image"
                      ? <FileImage size={18} className="text-violet-400" />
                      : <FileText size={18} className="text-primary" />
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground font-mono">{file.size}</span>
                      <span className="text-xs text-muted-foreground font-mono">{file.date}</span>
                      {user.role === "admin" && (
                        <span className="text-xs text-muted-foreground">
                          · {file.ownerName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      className="flex items-center gap-2 px-3.5 py-2 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
                      onClick={() => toast.info("Visualização disponível na versão completa.", {
                        style: { background: "#1e4278", border: "1px solid rgba(96,184,255,0.25)", color: "#e8f0fc" },
                      })}
                    >
                      <Eye size={13} />
                      <span className="hidden sm:inline">Visualizar</span>
                    </button>

                    {user.role === "admin" && (
                      <button
                        onClick={() => setDeleteTarget(file.id)}
                        className="flex items-center gap-2 px-3.5 py-2 border border-red-500/25 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors"
                      >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Excluir</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* User notice (non-admin) */}
        {user.role === "user" && (
          <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
            <ShieldCheck size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Os documentos enviados são permanentes e protegidos. A exclusão só pode ser realizada pelo administrador do sistema.
            </p>
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-7 max-w-sm w-full"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mb-5">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Excluir documento?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Esta ação é permanente e não pode ser desfeita. O documento será removido do sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 border border-border rounded-lg text-sm font-medium text-foreground hover:border-border/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => confirmDelete(deleteTarget)}
                className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
              >
                Sim, excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<AppUser | null>(null);

  const goAuth = (mode: AuthMode) => { setAuthMode(mode); setScreen("auth"); };

  const handleLogin = (u: AppUser) => { setUser(u); setScreen("dashboard"); };

  const handleLogout = () => { setUser(null); setScreen("landing"); };

  if (screen === "landing") return <LandingPage onNav={goAuth} />;
  if (screen === "auth")
    return (
      <AuthPage
        mode={authMode}
        onModeChange={setAuthMode}
        onBack={() => setScreen("landing")}
        onLogin={handleLogin}
      />
    );
  if (screen === "dashboard" && user) return <Dashboard user={user} onLogout={handleLogout} />;
  return null;
}

