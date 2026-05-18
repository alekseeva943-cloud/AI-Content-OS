import React, { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/shared/utils/cn';

type AIFieldProps = {
  label: string;
  children: ReactNode;
  id?: string;
  key?: React.Key;
};

export function AIField({ label, children, id }: AIFieldProps) {
  return (
    <div className="space-y-2 group">
      <label 
        htmlFor={id}
        className="text-[11px] font-bold font-mono text-white/50 uppercase tracking-[0.16em] group-focus-within:text-emerald-400 transition-colors ml-1"
      >
        {label}
      </label>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

export function AIInput({ 
  className, 
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-5 py-3.5 text-[13px] focus:outline-none focus:border-emerald-500/30 font-sans transition-all placeholder:text-white/20 text-white/90 focus:bg-white/[0.05] shadow-sm",
        className
      )}
      {...props}
    />
  );
}

export function AITextarea({ 
  className, 
  ...props 
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-5 py-3.5 text-[13px] focus:outline-none focus:border-emerald-500/30 font-sans resize-none transition-all placeholder:text-white/20 text-white/90 focus:bg-white/[0.05] shadow-sm min-h-[120px]",
        className
      )}
      {...props}
    />
  );
}

export function AISelect({ 
  className, 
  options,
  ...props 
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <div className="relative group">
      <select
        className={cn(
          "w-full bg-white/[0.03] border border-white/[0.1] rounded-xl px-5 py-3.5 text-[13px] focus:outline-none focus:border-emerald-500/30 font-sans transition-all appearance-none text-white/70 focus:bg-white/[0.05] shadow-sm",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1B2230] text-white/80">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-white/30 group-focus-within:text-emerald-400 group-hover:text-white/50 transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

export function AISectionCard({ title, children, icon: Icon }: { title: string; children: ReactNode; icon?: any }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-emerald-400" />}
        <h3 className="text-xs font-bold uppercase tracking-tight text-white/60">{title}</h3>
      </div>
      {children}
    </div>
  );
}
