import { motion } from "motion/react";
import { Eye, FileImage, FileText, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { DocFile } from "../../../types/app";

interface DocumentListProps {
  files: DocFile[];
  role: "admin" | "user";
  ownerName?: string;
  onDelete: (id: string) => void;
  onPreview: (file: DocFile) => void;
  onUploadClick: () => void;
}

export function DocumentList({ files, role, ownerName, onDelete, onPreview, onUploadClick }: DocumentListProps) {
  if (files.length === 0) {
    return (
      <div className="py-16 flex flex-col items-center gap-3 border border-border/50 rounded-xl">
        <FileText size={32} className="text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">Nenhum documento enviado ainda</p>
        <button onClick={onUploadClick} className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground text-sm font-medium rounded hover:opacity-90 transition-opacity mt-1">
          <Upload size={15} />
          Enviar primeiro documento
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {files.map((file) => (
        <motion.div key={file.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-border/80 transition-colors">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${file.type === "image" ? "bg-violet-500/10 border-violet-500/20" : "bg-primary/10 border-primary/20"}`}>
            {file.type === "image" ? <FileImage size={18} className="text-violet-400" /> : <FileText size={18} className="text-primary" />}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-muted-foreground font-mono">{file.size}</span>
              <span className="text-xs text-muted-foreground font-mono">{file.date}</span>
              {role === "admin" && <span className="text-xs text-muted-foreground">· {ownerName ?? file.ownerName}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-2 px-3.5 py-2 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors" onClick={() => onPreview(file)}>
              <Eye size={13} />
              <span className="hidden sm:inline">Visualizar</span>
            </button>

            {role === "admin" && (
              <button onClick={() => onDelete(file.id)} className="flex items-center gap-2 px-3.5 py-2 border border-red-500/25 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 hover:border-red-500/40 transition-colors">
                <Trash2 size={13} />
                <span className="hidden sm:inline">Excluir</span>
              </button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
