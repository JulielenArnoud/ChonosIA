import { motion } from "motion/react";
import type { AuthMode } from "../../types/app";
import { ChronosLogo } from "../../shared/components/ChronosLogo";
import { DocIllustration } from "../../shared/components/DocIllustration";

interface LandingPageProps {
  onNav: (mode: AuthMode) => void;
}

export function LandingPage({ onNav }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <nav className="bg-[var(--nav_background)] flex items-center justify-between px-8 py-5 border-b border-border">
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
