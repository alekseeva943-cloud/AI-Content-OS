import React, { ReactNode } from 'react';
import { cn } from '@/src/shared/utils/cn';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "bg-[#161B26]/40 backdrop-blur-xl border border-white/[0.05] rounded-2xl overflow-hidden self-start shadow-[0_4px_24px_rgba(0,0,0,0.2)] ring-1 ring-white/[0.03]",
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
    primary: "bg-emerald-500 hover:bg-emerald-400 text-white shadow-sm hover:shadow-md transition-shadow",
    secondary: "bg-white/[0.03] hover:bg-white/[0.06] text-white border border-white/[0.05] hover:border-white/[0.08]",
    ghost: "bg-transparent hover:bg-white/[0.04] text-white/40 hover:text-white/80",
    outline: "bg-transparent border border-white/[0.08] hover:border-emerald-500/20 text-white/70 hover:text-white hover:bg-emerald-500/[0.02]",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider",
    md: "px-4.5 py-2.5 text-xs font-bold uppercase tracking-widest",
    lg: "px-7 py-3.5 text-sm font-bold uppercase tracking-[0.12em]",
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
