import React, { ReactNode } from 'react';
import { cn } from '@/src/shared/utils/cn';

type GlassCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div 
      className={cn(
        "bg-white border border-[#E5E7EB] rounded-[2rem] overflow-hidden self-start shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all duration-500",
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
    primary: "bg-[#10B981] hover:bg-[#059669] text-white font-bold shadow-[0_4px_12px_rgba(16,185,129,0.15)] hover:shadow-[0_8px_20px_rgba(16,185,129,0.25)] transition-all active:scale-[0.98]",
    secondary: "bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#374151] border border-[#E5E7EB] hover:border-[#D1D5DB] shadow-sm",
    ghost: "bg-transparent hover:bg-black/[0.03] text-[#6B7280] hover:text-[#111827] transition-colors",
    outline: "bg-transparent border border-[#E5E7EB] hover:border-[#10B981]/40 text-[#4B5563] hover:text-[#111827] hover:bg-[#10B981]/5 shadow-sm",
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
