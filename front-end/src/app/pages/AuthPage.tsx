import { useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ChevronLeft } from "lucide-react";
import { toast, Toaster } from "sonner";
import type { AppUser, AuthMode } from "../../types/app";
import { CREDENTIALS } from "../../features/auth/constants/credentials";
import { ChronosLogo } from "../../shared/components/ChronosLogo";
import { apiRequest } from "../../lib/api";
import { FormField } from "../components/FormField";

interface AuthPageProps {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onBack: () => void;
  onLogin: (user: AppUser) => void;
}

export function AuthPage({ mode, onModeChange, onBack, onLogin }: AuthPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
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
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const users = await apiRequest<Array<{ id: number; name: string; email: string; password: string; role: string }>>("/users");
        const existingUser = users.find((userRecord) => userRecord.email.toLowerCase() === email.toLowerCase() && userRecord.password === password);

        if (existingUser) {
          onLogin({ email: existingUser.email, name: existingUser.name, role: existingUser.role === "admin" ? "admin" : "user" });
          return;
        }

        const fallbackCred = CREDENTIALS[email.toLowerCase()];
        if (fallbackCred && fallbackCred.password === password) {
          onLogin(fallbackCred.user);
          return;
        }

        setError("E-mail ou senha incorretos. Verifique e tente novamente.");
      } else {
        const createdUser = await apiRequest<{ id: number; name: string; email: string; role: string }> ("/users", {
          method: "POST",
          body: JSON.stringify({ name, email, password }),
        });

        onLogin({ email: createdUser.email, name: createdUser.name, role: createdUser.role === "admin" ? "admin" : "user" });
        toast.success("Conta criada com sucesso!", {
          style: { background: "#1e4278", border: "1px solid rgba(96,184,255,0.25)", color: "#e8f0fc" },
        });
      }
    } catch (error) {
      const fallbackCred = CREDENTIALS[email.toLowerCase()];
      if (mode === "login" && fallbackCred && fallbackCred.password === password) {
        onLogin(fallbackCred.user);
        return;
      }

      setError(error instanceof Error ? error.message : "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
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
            <FormField label="Nome completo" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
          )}

          <FormField
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="seu@email.com"
          />

          <FormField
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
            action={isLogin ? <button type="button" className="text-sm text-primary/70 hover:text-primary transition-colors">Esqueci a senha</button> : undefined}
          />

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
