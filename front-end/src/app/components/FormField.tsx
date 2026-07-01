import type { ChangeEvent, ReactNode } from "react";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  action?: ReactNode;
}

export function FormField({ label, value, onChange, type = "text", placeholder, action }: FormFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {action}
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-card border border-border rounded px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary/55 focus:ring-2 focus:ring-primary/20 transition-colors"
      />
    </div>
  );
}
