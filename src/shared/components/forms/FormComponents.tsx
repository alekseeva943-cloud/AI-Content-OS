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
        className="text-[13px] font-bold text-[#6B7280] group-focus-within:text-[#059669] transition-colors ml-0.5"
      >
        {label}
      </label>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

export function AIToggleGroup({ 
  options, 
  value, 
  onChange,
  className 
}: { 
  options: { value: string; label: string }[]; 
  value: any; 
  onChange: (val: any) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border",
              isActive 
                ? "bg-[#10B981] border-[#10B981] text-white shadow-[0_4px_12px_rgba(16,185,129,0.2)]" 
                : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827]"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function AIPillSelector({ 
  options, 
  value, 
  onChange,
  className 
}: { 
  options: { value: string; label: string }[]; 
  value: any[]; 
  onChange: (val: any[]) => void;
  className?: string;
}) {
  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter(v => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((opt) => {
        const isActive = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            onClick={() => toggle(opt.value)}
            className={cn(
              "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-2",
              isActive 
                ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#059669]" 
                : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827]"
            )}
          >
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              isActive ? "bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-[#9CA3AF]"
            )} />
            {opt.label}
          </button>
        );
      })}
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
        "w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-[14px] leading-relaxed focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5 font-sans transition-all placeholder:text-[#9CA3AF] text-[#111827] shadow-sm",
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
        "w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-4 text-[14px] leading-relaxed focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5 font-sans resize-none transition-all placeholder:text-[#9CA3AF] text-[#111827] shadow-sm min-h-[140px]",
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
          "w-full bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 text-[14px] leading-relaxed focus:outline-none focus:border-[#10B981] focus:ring-4 focus:ring-[#10B981]/5 font-sans transition-all appearance-none text-[#111827] shadow-sm cursor-pointer",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-[#111827]">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF] group-hover:text-[#6B7280] transition-colors">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

export function AISectionCard({ title, children, icon: Icon }: { title: string; children: ReactNode; icon?: any }) {
  return (
    <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E7EB] space-y-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="w-4 h-4 text-[#10B981]" />}
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">{title}</h3>
      </div>
      {children}
    </div>
  );
}
