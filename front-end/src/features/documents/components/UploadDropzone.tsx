import type { DragEvent, ChangeEvent } from "react";

interface UploadDropzoneProps {
  isDragging: boolean;
  isUploading: boolean;
  onBrowse: () => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: DragEvent) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function UploadDropzone({
  isDragging,
  isUploading,
  onBrowse,
  onDragOver,
  onDragLeave,
  onDrop,
  onChange,
  inputRef,
}: UploadDropzoneProps) {
  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-foreground mb-1">Enviar documento</h2>
      <p className="text-sm text-muted-foreground mb-5">Formatos aceitos: PDF, PNG, JPG. Máximo 50 MB por arquivo.</p>

      <div
        onClick={() => !isUploading && onBrowse()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl py-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all select-none ${
          isDragging ? "border-primary/70 bg-primary/5" : "border-border/60 hover:border-primary/45 hover:bg-primary/[0.025]"
        }`}
      >
        <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors ${isDragging ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-muted-foreground"}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
            <path d="M12 16V4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 9L12 4L17 9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 16V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base font-medium text-foreground">{isUploading ? "Enviando arquivo..." : "Arraste um arquivo aqui"}</p>
          <p className="text-sm text-muted-foreground mt-1">ou <span className="text-primary font-medium">clique para selecionar</span></p>
        </div>
      </div>
      <input ref={inputRef} type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={onChange} />
    </section>
  );
}
