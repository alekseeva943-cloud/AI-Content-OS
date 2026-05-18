import React, { ReactNode } from 'react';
import { cn } from '@/src/shared/utils/cn';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "bg-[#15181E] border border-[#242933] rounded-[2.5rem] overflow-hidden self-start shadow-[0_8px_32px_rgba(0,0,0,0.3)] ring-1 ring-white/[0.02] transition-all duration-500",
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
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
    primary: "bg-[#10B981] hover:bg-[#059669] text-[#0D0F12] font-bold shadow-[0_4px_16px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_24px_rgba(16,185,129,0.3)] transition-all active:scale-[0.98]",
    secondary: "bg-[#242933] hover:bg-[#2D333F] text-[#E2E4E9] border border-[#383E4C] hover:border-[#4B5262] shadow-md",
    ghost: "bg-transparent hover:bg-white/[0.03] text-[#898E9E] hover:text-[#E2E4E9] transition-colors",
    outline: "bg-transparent border border-[#383E4C] hover:border-[#10B981]/30 text-[#898E9E] hover:text-[#E2E4E9] hover:bg-[#10B981]/5 shadow-sm",
  };

  const sizes = {
    sm: "px-4 py-2 text-[12px] font-bold",
    md: "px-6 py-3 text-[14px] font-bold",
    lg: "px-9 py-4 text-[15px] font-bold",
    xl: "px-11 py-4.5 text-[17px] font-bold",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl transition-all duration-500 active:scale-95 disabled:opacity-50 disabled:pointer-events-none font-sans tracking-tight",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      ) : null}
      {children}
    </button>
  );
}
