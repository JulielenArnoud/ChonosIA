import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { LogOut, ShieldCheck, Trash2, User, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import type { AppUser, DocFile } from "../../types/app";
import { SEED_FILES } from "../../features/documents/data/seed";
import { ChronosLogo } from "../../shared/components/ChronosLogo";
import { apiRequest, formatBytes } from "../../lib/api";
import { UploadDropzone } from "../../features/documents/components/UploadDropzone";
import { DocumentList } from "../../features/documents/components/DocumentList";

interface DashboardPageProps {
  user: AppUser;
  onLogout: () => void;
}

export function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const [files, setFiles] = useState<DocFile[]>(SEED_FILES);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [previewTarget, setPreviewTarget] = useState<DocFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const visible = user.role === "admin" ? files : files.filter((file) => file.ownerEmail === user.email);

  useEffect(() => {
    void loadDocuments();
  }, [user.email]);

  const loadDocuments = async () => {
    try {
      const data = await apiRequest<{ id: number; title: string; s3Key: string; s3Url: string; fileSize: number; fileType: string }[]>("/documents");
      const mapped = data.map((item) => ({
        id: String(item.id),
        name: item.title,
        type: (item.fileType.includes("image") ? "image" : "pdf") as "image" | "pdf",
        size: formatBytes(item.fileSize),
        date: new Date().toLocaleDateString("pt-BR"),
        ownerEmail: user.email,
        ownerName: user.name,
        previewUrl: item.s3Url,
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

        const response = await apiRequest<{ title: string; s3Key: string; s3Url: string; fileSize: number; fileType: string }>("/documents/upload", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const next: DocFile = {
          id: response.s3Key,
          name: response.title,
          type: (response.fileType.includes("image") ? "image" : "pdf") as "image" | "pdf",
          size: formatBytes(response.fileSize),
          date: new Date().toLocaleDateString("pt-BR"),
          ownerEmail: user.email,
          ownerName: user.name,
          previewUrl: response.s3Url,
        };

        setFiles((current) => [next, ...current]);
        toast.success("Documento enviado com sucesso!", {
          description: file.name,
          style: { background: "#0c1525", border: "1px solid rgba(0,200,232,0.18)", color: "#c8dcf0" },
        });
      };
      reader.onerror = () => {
        toast.error("Não foi possível ler o arquivo.");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar documento.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      await addFile(selectedFile);
    }
    event.target.value = "";
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      await addFile(droppedFile);
    }
  };

  const confirmDelete = (id: string) => {
    setFiles((current) => current.filter((file) => file.id !== id));
    setDeleteTarget(null);
    toast.success("Documento excluído.", {
      style: { background: "#0c1525", border: "1px solid rgba(0,200,232,0.18)", color: "#c8dcf0" },
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Toaster position="top-right" />

      <header className="border-b border-[color:var(--nav_background)] bg-[var(--nav_background)] px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 backdrop-blur-sm z-10">
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
          <button onClick={onLogout} className="flex items-center gap-2 px-4 py-2.5 border border-border/40 rounded text-sm text-foreground/80 hover:text-foreground hover:border-border/70 transition-colors bg-white/5">
            <LogOut size={14} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 md:px-8 py-10 space-y-10">
        <UploadDropzone
          isDragging={isDragging}
          isUploading={isUploading}
          onBrowse={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onChange={handleSelect}
          inputRef={inputRef}
        />

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

          <DocumentList
            files={visible}
            role={user.role}
            ownerName={user.name}
            onDelete={(id) => setDeleteTarget(id)}
            onPreview={(file) => setPreviewTarget(file)}
            onUploadClick={() => inputRef.current?.click()}
          />
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

      {previewTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-2xl w-full max-w-4xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">{previewTarget.name}</h3>
                <p className="text-sm text-muted-foreground">{previewTarget.size} · {previewTarget.date}</p>
              </div>
              <button onClick={() => setPreviewTarget(null)} className="p-2 rounded-full hover:bg-muted transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 sm:p-6 bg-background/70">
              {previewTarget.type === "image" && previewTarget.previewUrl ? (
                <img src={previewTarget.previewUrl} alt={previewTarget.name} className="max-h-[70vh] w-full object-contain rounded-lg" />
              ) : (
                <iframe src={previewTarget.previewUrl} title={previewTarget.name} className="w-full h-[70vh] rounded-lg border border-border" />
              )}
            </div>
          </motion.div>
        </div>
      )}

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
