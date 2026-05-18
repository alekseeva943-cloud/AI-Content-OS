import React, { ReactNode } from 'react';
import { cn } from '@/src/shared/utils/cn';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "bg-[#111827]/30 backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden self-start shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/5 hover:border-white/10",
    ghost: "bg-transparent hover:bg-white/5 text-white/50 hover:text-white",
    outline: "bg-transparent border border-white/10 hover:border-emerald-500/30 text-white/80 hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-[11px] font-bold uppercase tracking-wider",
    md: "px-5 py-2.5 text-xs font-bold uppercase tracking-widest",
    lg: "px-8 py-4 text-sm font-bold uppercase tracking-[0.14em]",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      ) : null}
      {children}
    </button>
  );
}
