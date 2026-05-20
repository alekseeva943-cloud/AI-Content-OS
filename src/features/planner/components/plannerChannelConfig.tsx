import React from 'react';
import { Send, Mail, Youtube, Linkedin } from 'lucide-react';
import { NEWSLETTER_CHANNELS } from '@/src/config/newsletterChannels';

export const VkIcon = ({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M15.012 3h-6.024C5.116 3 3 5.116 3 8.988v6.024C3 18.884 5.116 21 8.988 21h6.024c3.872 0 5.988-2.116 5.988-5.988V8.988C21 5.116 18.884 3 15.012 3zm2.592 11.808h-1.128c-.804 0-1.164-.672-1.92-1.428-.684-.66-.996-.744-1.164-.744-.24 0-.312.072-.312.444v1.20c0 .336-.096.528-.864.528-1.284 0-2.712-.804-3.72-2.22-1.92-2.676-2.436-3.816-2.436-4.14 0-.216.084-.408.432-.408h1.128c.3 0 .42.144.528.444.6 1.416 1.452 2.724 1.836 2.724.144 0 .204-.06.204-.408V9.756c-.048-.792-.516-.864-.516-1.152 0-.144.12-.276.3-.276h1.776c.252 0 .348.132.348.42v2.244c0 .24.108.324.18.324.144 0 .252-.084.504-.336.876-1.056 1.44-2.304 1.44-2.304.084-.18.216-.324.528-.324h1.128c.336 0 .42.156.348.42-.144.6-1.44 2.376-1.44 2.376-.144.204-.204.288 0 .492 1.044 1.056 2.016 2.376 2.364 2.94.132.228-.024.432-.348.432z" />
  </svg>
);

export const getChannelLabel = (ch: string) => {
  const key = ch.toLowerCase().trim();
  if (NEWSLETTER_CHANNELS[key]) {
    return NEWSLETTER_CHANNELS[key].label;
  }
  const defaultLabels: Record<string, string> = {
    telegram: 'Telegram',
    vk: 'VK',
    email: 'Email',
    youtube: 'YouTube',
    linkedin: 'LinkedIn'
  };
  return defaultLabels[key] || ch;
};

export const channelConfig = {
  telegram: { 
      icon: Send, 
      label: getChannelLabel('telegram'), 
      color: '#0EA5E9', 
      bg: 'bg-sky-50/70', 
      border: 'border-sky-100', 
      text: 'text-sky-600',
      accentBg: 'bg-sky-500',
      lightBg: 'bg-sky-500/10',
      hoverBorder: 'hover:border-sky-300',
      hoverBorderLeft: 'group-hover/card:border-l-sky-400',
      hoverGradient: 'from-sky-500/5'
  },
  vk: { 
      icon: VkIcon, 
      label: getChannelLabel('vk'), 
      color: '#0077FF', 
      bg: 'bg-blue-50/70', 
      border: 'border-blue-100', 
      text: 'text-[#0077FF]', 
      accentBg: 'bg-[#0077FF]',
      lightBg: 'bg-[#0077FF]/10',
      hoverBorder: 'hover:border-blue-300',
      hoverBorderLeft: 'group-hover/card:border-l-blue-400',
      hoverGradient: 'from-blue-500/5'
  },
  email: { 
      icon: Mail, 
      label: getChannelLabel('email'), 
      color: '#10B981', 
      bg: 'bg-emerald-50/70', 
      border: 'border-emerald-100', 
      text: 'text-emerald-600',
      accentBg: 'bg-emerald-500',
      lightBg: 'bg-emerald-500/10',
      hoverBorder: 'hover:border-emerald-300',
      hoverBorderLeft: 'group-hover/card:border-l-emerald-400',
      hoverGradient: 'from-emerald-500/5'
  },
  youtube: { 
      icon: Youtube, 
      label: getChannelLabel('youtube'), 
      color: '#EF4444', 
      bg: 'bg-rose-50/70', 
      border: 'border-rose-100', 
      text: 'text-rose-600',
      accentBg: 'bg-rose-600',
      lightBg: 'bg-rose-600/10',
      hoverBorder: 'hover:border-rose-300',
      hoverBorderLeft: 'group-hover/card:border-l-rose-400',
      hoverGradient: 'from-rose-500/5'
  },
  linkedin: { 
      icon: Linkedin, 
      label: getChannelLabel('linkedin'), 
      color: '#0A66C2', 
      bg: 'bg-indigo-50/70', 
      border: 'border-indigo-100', 
      text: 'text-[#0A66C2]',
      accentBg: 'bg-[#0A66C2]',
      lightBg: 'bg-[#0A66C2]/10',
      hoverBorder: 'hover:border-indigo-300',
      hoverBorderLeft: 'group-hover/card:border-l-indigo-400',
      hoverGradient: 'from-indigo-500/5'
  }
};
