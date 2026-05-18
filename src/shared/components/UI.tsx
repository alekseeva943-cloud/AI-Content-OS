import React, { ReactNode } from 'react';
import { cn } from '@/src/shared/utils/cn';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "bg-[#15181E] border border-[#242933] rounded-2xl overflow-hidden self-start shadow-xl ring-1 ring-white/[0.02]",
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
    primary: "bg-[#10B981] hover:bg-[#059669] text-[#0D0F12] font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]",
    secondary: "bg-[#242933] hover:bg-[#2D333F] text-[#E2E4E9] border border-[#383E4C] hover:border-[#4B5262] shadow-sm",
    ghost: "bg-transparent hover:bg-[#1C2028] text-[#898E9E] hover:text-[#E2E4E9] transition-colors",
    outline: "bg-transparent border border-[#383E4C] hover:border-[#10B981]/50 text-[#898E9E] hover:text-[#E2E4E9] hover:bg-[#10B981]/[0.02] shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider",
    md: "px-5 py-2.5 text-xs font-bold uppercase tracking-widest",
    lg: "px-7 py-3.5 text-sm font-bold uppercase tracking-wider",
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
