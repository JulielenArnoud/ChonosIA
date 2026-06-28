import { useState, useRef } from "react";
import { motion } from "motion/react";
import { Upload, LogOut, FileText, FileImage, Trash2, Eye, ShieldCheck, User, ChevronLeft, AlertCircle } from "lucide-react";
import { toast, Toaster } from "sonner";
import type { AppUser, AuthMode, DocFile, Screen } from "../types/app";
import { CREDENTIALS } from "../features/auth/constants/credentials";
import { SEED_FILES } from "../features/documents/data/seed";
import { ChronosLogo } from "../shared/components/ChronosLogo";
import { DocIllustration } from "../shared/components/DocIllustration";
import { apiRequest, formatBytes } from "../lib/api";

function LandingPage({ onNav }: { onNav: (mode: AuthMode) => void }) {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <nav className=" bg-[var(--nav_background)] flex items-center justify-between px-8 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <ChronosLogo size={36} />
          <div>
            <div className="font-display font-semibold text-base text-foreground leading-none tracking-tight">CHRONOS</div>
            <div className="text-[9px] font-mono text-primary tracking-[0.3em] mt-0.5">IA</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onNav("login")} className="px-5 py-2.5 rounded border border-border text-foreground text-sm font-medium hover:border-primary/50 hover:text-primary transition-colors">
            Entrar
          </button>
          <button onClick={() => onNav("register")} className="px-5 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">
            Criar conta
          </button>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <DocIllustration />
          </div>

          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight mb-4">
            Gestão de<br />
            <span style={{ color: "#ffffff" }}>Documentos</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-sm mx-auto leading-relaxed mb-10">
            Armazene, organize e acesse seus documentos com segurança e controle total.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onNav("login")} className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground text-base font-medium rounded hover:opacity-90 transition-opacity min-w-[200px]">
              Entrar na minha conta
            </button>
            <button onClick={() => onNav("register")} className="w-full sm:w-auto px-8 py-4 border border-border text-foreground text-base font-medium rounded hover:border-primary/60 hover:text-primary transition-colors min-w-[200px]">
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
        if (!name.trim()) {
          setError("Por favor, informe seu nome completo.");
          return;
        }
        if (!email.includes("@")) {
          setError("Informe um e-mail válido.");
          return;
        }
        if (password.length < 6) {
          setError("A senha deve ter no mínimo 6 caracteres.");
          return;
        }
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
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }} className="w-full max-w-[420px]">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft size={16} />
          Voltar ao início
        </button>

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
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className="w-full bg-card border border-border rounded px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary/55 focus:ring-2 focus:ring-primary/20 transition-colors" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">E-mail</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="seu@email.com" className="w-full bg-card border border-border rounded px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary/55 focus:ring-2 focus:ring-primary/20 transition-colors" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">Senha</label>
              {isLogin && <button type="button" className="text-sm text-primary/70 hover:text-primary transition-colors">Esqueci a senha</button>}
            </div>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"} className="w-full bg-card border border-border rounded px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary/55 focus:ring-2 focus:ring-primary/20 transition-colors" />
          </div>

          {error && (
            <div className="flex items-start gap-3 p-3.5 bg-red-500/8 border border-red-500/25 rounded text-sm text-red-400">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-medium py-4 rounded text-base hover:opacity-90 transition-opacity disabled:opacity-65 flex items-center justify-center gap-2 mt-1">
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {isLogin ? "Verificando..." : "Criando conta..."}
              </>
            ) : isLogin ? "Entrar na minha conta" : "Criar conta agora"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-7">
          {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
          <button onClick={() => { onModeChange(isLogin ? "register" : "login"); setError(""); }} className="text-primary hover:underline font-medium">
            {isLogin ? "Criar conta" : "Entrar"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function Dashboard({ user, onLogout }: { user: AppUser; onLogout: () => void }) {
  const [files, setFiles] = useState<DocFile[]>(SEED_FILES);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const visible = user.role === "admin" ? files : files.filter((f) => f.ownerEmail === user.email);

  const loadDocuments = async () => {
    try {
      const data = await apiRequest<{ id: number; title: string; s3Key: string; s3Url: string; fileSize: number; fileType: string }[]>("/documents");
      const mapped = data.map((item) => ({
        id: String(item.id),
        name: item.title,
        type: item.fileType.includes("image") ? "image" : "pdf",
        size: formatBytes(item.fileSize),
        date: new Date().toLocaleDateString("pt-BR"),
        ownerEmail: user.email,
        ownerName: user.name,
      }));
      setFiles(mapped);
    } catch {
      setFiles(SEED_FILES);
    }
  };

  const addFile = async (file: File) => {
    try {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const payload = {
          title: file.name,
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          fileContent: base64.split(",")[1] || "",
        };

        const response = await apiRequest<{ id: number; title: string; s3Key: string; s3Url: string; fileSize: number; fileType: string }>("/documents/upload", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const next: DocFile = {
          id: String(response.id),
          name: response.title,
          type: response.fileType.includes("image") ? "image" : "pdf",
          size: formatBytes(response.fileSize),
          date: new Date().toLocaleDateString("pt-BR"),
          ownerEmail: user.email,
          ownerName: user.name,
        };

        setFiles((p) => [next, ...p]);
        toast.success("Documento enviado com sucesso!", {
          description: file.name,
          style: { background: "#0c1525", border: "1px solid rgba(0,200,232,0.18)", color: "#c8dcf0" },
        });
        setIsUploading(false);
      };
      reader.onerror = () => {
        setIsUploading(false);
        toast.error("Não foi possível ler o arquivo.");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar documento.");
    }
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) await addFile(f);
    e.target.value = "";
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) await addFile(f);
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
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2.5 border border-border rounded text-sm text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors">
            <LogOut size={14} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-8 py-10 space-y-10">
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground mb-1">Enviar documento</h2>
          <p className="text-sm text-muted-foreground mb-5">Formatos aceitos: PDF, PNG, JPG. Máximo 50 MB por arquivo.</p>

          <div onClick={() => !isUploading && inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl py-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all select-none ${isDragging ? "border-primary/70 bg-primary/5" : "border-border/60 hover:border-primary/45 hover:bg-primary/[0.025]"}`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors ${isDragging ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"}`}>
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-foreground">{isUploading ? "Enviando arquivo..." : "Arraste um arquivo aqui"}</p>
              <p className="text-sm text-muted-foreground mt-1">ou <span className="text-primary font-medium">clique para selecionar</span></p>
            </div>
          </div>
          <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleSelect} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">{user.role === "admin" ? "Todos os documentos" : "Meus documentos"}</h2>
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
              <button onClick={() => inputRef.current?.click()} className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity mt-1">
                <Upload size={15} />
                Enviar primeiro documento
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((file) => (
                <motion.div key={file.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-border/80 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${file.type === "image" ? "bg-violet-500/10 border-violet-500/20" : "bg-primary/10 border-primary/20"}`}>
                    {file.type === "image" ? <FileImage size={18} className="text-violet-400" /> : <FileText size={18} className="text-primary" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground font-mono">{file.size}</span>
                      <span className="text-xs text-muted-foreground font-mono">{file.date}</span>
                      {user.role === "admin" && <span className="text-xs text-muted-foreground">· {file.ownerName}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="flex items-center gap-2 px-3.5 py-2 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors" onClick={() => toast.info("Visualização disponível na versão completa.", { style: { background: "#1e4278", border: "1px solid rgba(96,184,255,0.25)", color: "#e8f0fc" } })}>
                      <Eye size={13} />
                      <span className="hidden sm:inline">Visualizar</span>
                    </button>

                    {user.role === "admin" && (
                      <button onClick={() => setDeleteTarget(file.id)} className="flex items-center gap-2 px-3.5 py-2 border border-red-500/25 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors">
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

        {user.role === "user" && (
          <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-xl">
            <ShieldCheck size={16} className="text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Os documentos enviados são permanentes e protegidos. A exclusão só pode ser realizada pelo administrador do sistema.
            </p>
          </div>
        )}
      </main>

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl p-7 max-w-sm w-full">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mb-5">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Excluir documento?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Esta ação é permanente e não pode ser desfeita. O documento será removido do sistema.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 border border-border rounded-lg text-sm font-medium text-foreground hover:border-border/80 transition-colors">
                Cancelar
              </button>
              <button onClick={() => confirmDelete(deleteTarget)} className="flex-1 py-3 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                Sim, excluir
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("landing");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<AppUser | null>(null);

  const goAuth = (mode: AuthMode) => { setAuthMode(mode); setScreen("auth"); };
  const handleLogin = (u: AppUser) => { setUser(u); setScreen("dashboard"); };
  const handleLogout = () => { setUser(null); setScreen("landing"); };

  if (screen === "landing") return <LandingPage onNav={goAuth} />;
  if (screen === "auth") return <AuthPage mode={authMode} onModeChange={setAuthMode} onBack={() => setScreen("landing")} onLogin={handleLogin} />;
  if (screen === "dashboard" && user) return <Dashboard user={user} onLogout={handleLogout} />;
  return null;
}

