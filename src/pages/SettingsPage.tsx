import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Database, 
  Zap, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Lock,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { AI_PROVIDERS, AIProviderConfig } from '@/src/config/providers';
import { cn } from '@/src/lib/utils';

export function SettingsPage() {
  const { 
    openaiKey, setOpenAIKey,
    heygenKey, setHeygenKey,
    elevenlabsKey, setElevenlabsKey
  } = useSettingsStore();

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    // Simulate save delay
    setTimeout(() => {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const isVercelConfigured = Boolean((import.meta as any).env.VITE_OPENAI_API_KEY);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold tracking-tight text-[#111827] font-display">
              Настройки
            </h1>
            <div className="w-10 h-10 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] shadow-sm">
                <Shield size={20} />
            </div>
        </div>
        <p className="text-[#6B7280] max-w-2xl text-[17px] font-medium leading-relaxed">
          Управляйте вашими API-ключами и интеграциями. Мы обеспечиваем безопасность данных через локальное шифрование и прямые запросы к провайдерам.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-0 overflow-hidden bg-white border-[#E5E7EB] shadow-sm">
             <div className="p-8 border-b border-[#E5E7EB] bg-[#F9FAFB]/50">
               <div className="flex items-center gap-4">
                 <div className="p-2.5 rounded-xl bg-white border border-[#E5E7EB] text-[#10B981] shadow-sm">
                   <Key size={22} />
                 </div>
                 <div className="flex flex-col">
                    <h2 className="text-xl font-bold text-[#111827] tracking-tight">API Интеграции</h2>
                    <span className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Подключение облачных мощностей</span>
                 </div>
               </div>
             </div>

             <div className="p-8 space-y-10">
                {AI_PROVIDERS.map((provider) => (
                  <IntegrationCard 
                    key={provider.id} 
                    provider={provider}
                    value={
                      provider.id === 'openai' ? openaiKey :
                      provider.id === 'heygen' ? heygenKey :
                      elevenlabsKey
                    }
                    onChange={(val) => {
                      if (provider.id === 'openai') setOpenAIKey(val);
                      if (provider.id === 'heygen') setHeygenKey(val);
                      if (provider.id === 'elevenlabs') setElevenlabsKey(val);
                    }}
                    isVercelConfigured={provider.id === 'openai' && isVercelConfigured}
                  />
                ))}
             </div>

             <div className="p-8 bg-[#F9FAFB]/50 border-t border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] font-bold text-[#9CA3AF]">
                  <Lock size={14} />
                  <span>Ключи хранятся в зашифрованном виде в вашем браузере</span>
                </div>
                <Button 
                  onClick={handleSave} 
                  className="min-w-[200px] h-12 shadow-lg shadow-[#10B981]/10 rounded-2xl"
                  disabled={saveStatus !== 'idle'}
                >
                  {saveStatus === 'saving' ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={18} className="animate-spin" />
                      <span>Сохранение...</span>
                    </div>
                  ) : saveStatus === 'success' ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={18} />
                      <span>Сохранено!</span>
                    </div>
                  ) : (
                    "Обновить настройки"
                  )}
                </Button>
             </div>
          </GlassCard>
        </div>

        <div className="space-y-8">
           <GlassCard className="p-8 bg-white border-[#E5E7EB] shadow-sm group hover:border-[#10B981]/30 transition-all cursor-default">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] group-hover:text-[#10B981] transition-colors">
                  <Database size={20} />
                </div>
                <h3 className="text-base font-bold text-[#111827]">Хранилище данных</h3>
              </div>
              <p className="text-[14px] text-[#6B7280] leading-relaxed mb-8 font-medium">
                Вы можете полностью очистить кэш нейронной памяти и локальное хранилище. Это действие необратимо.
              </p>
              <Button variant="outline" className="w-full text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 rounded-2xl font-bold h-11 text-xs uppercase tracking-wider">
                Очистить все данные
              </Button>
           </GlassCard>

           <GlassCard className="p-8 bg-white border-[#E5E7EB] shadow-sm group">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] group-hover:text-[#10B981] transition-colors">
                  <Zap size={20} />
                </div>
                <h3 className="text-base font-bold text-[#111827]">Производительность</h3>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-[#374151]">Графические эффекты</span>
                    <span className="text-[11px] font-bold text-[#9CA3AF]">Сенсорные анимации и блюр</span>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 p-1 flex items-center justify-end">
                     <div className="w-4 h-4 rounded-full bg-[#10B981] shadow-sm" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-[#374151]">Турбо-генерация</span>
                    <span className="text-[11px] font-bold text-[#9CA3AF]">Приоритетные запросы</span>
                  </div>
                  <div className="w-12 h-6 rounded-full bg-[#E5E7EB] p-1 flex items-center justify-start">
                     <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              </div>
           </GlassCard>

           <div className="p-8 rounded-[2rem] bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-lg shadow-[#10B981]/20">
              <h4 className="text-lg font-bold mb-3 font-display">Нужна помощь?</h4>
              <p className="text-white/80 text-[13px] leading-relaxed mb-6 font-medium">
                Если у вас возникли сложности с получением API ключей, загляните в наш гайд для мейкеров.
              </p>
              <Button className="w-full bg-white text-[#10B981] hover:bg-white/90 rounded-2xl font-bold h-11">
                 Открыть базу знаний
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

interface IntegrationCardProps {
  key?: React.Key;
  provider: AIProviderConfig;
  value: string;
  onChange: (val: string) => void;
  isVercelConfigured?: boolean;
}

function IntegrationCard({ provider, value, onChange, isVercelConfigured }: IntegrationCardProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'none' | 'valid' | 'invalid'>('none');

  useEffect(() => {
    if (value.length > 10) {
      setIsValidating(true);
      const timer = setTimeout(() => {
        // Simple logic: OpenAI keys start with sk-, ElevenLabs are 32 chars, etc.
        let isValid = false;
        if (provider.id === 'openai' && value.startsWith('sk-')) isValid = true;
        if (provider.id === 'elevenlabs' && value.length >= 20) isValid = true;
        if (provider.id === 'heygen' && value.length >= 10) isValid = true;
        
        setValidationStatus(isValid ? 'valid' : 'invalid');
        setIsValidating(false);
      }, 600);
      return () => clearTimeout(timer);
    } else if (value.length > 0) {
      setValidationStatus('invalid');
    } else {
      setValidationStatus('none');
    }
  }, [value, provider.id]);

  return (
    <div className={cn(
      "space-y-6 transition-all",
      !provider.isEnabled && "opacity-50 grayscale pointer-events-none"
    )}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex-1 space-y-2">
           <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-[#111827]">{provider.name}</span>
              {provider.isEnabled ? (
                 isVercelConfigured ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 border border-blue-100">
                      <Globe size={11} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Vercel Connected</span>
                    </div>
                 ) : (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 size={11} className="text-[#10B981]" />
                      <span className="text-[10px] font-bold text-[#10B981] uppercase tracking-wider">Active</span>
                    </div>
                 )
              ) : (
                <span className="text-[10px] font-bold text-[#9CA3AF] bg-[#F9FAFB] px-2 py-0.5 rounded-lg border border-[#E5E7EB] uppercase tracking-widest">Coming Soon</span>
              )}
           </div>
           <p className="text-[14px] text-[#6B7280] font-medium leading-relaxed max-w-md">
             {provider.description}
           </p>
           <a 
              href={provider.documentationUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#10B981] hover:underline"
           >
              Как получить ключ
              <ExternalLink size={12} />
           </a>
        </div>

        <div className="w-full md:w-[360px] space-y-2">
           <div className="relative group">
              <input 
                type="password"
                placeholder={isVercelConfigured ? "Конфигурация через Vercel" : `${provider.name} API Ключ`}
                value={isVercelConfigured ? "" : value}
                disabled={!provider.isEnabled || isVercelConfigured}
                onChange={(e) => onChange(e.target.value)}
                className={cn(
                  "w-full h-14 bg-[#F9FAFB] border rounded-2xl px-6 py-4 text-[14px] font-mono transition-all pr-12 focus:outline-none focus:ring-4 focus:ring-[#10B981]/5",
                  validationStatus === 'valid' ? "border-[#10B981] text-[#059669]" :
                  validationStatus === 'invalid' ? "border-red-200 text-red-500" :
                  "border-[#E5E7EB] text-[#111827] focus:border-[#10B981]"
                )}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isValidating ? (
                  <Loader2 size={18} className="animate-spin text-[#9CA3AF]" />
                ) : validationStatus === 'valid' ? (
                  <CheckCircle2 size={18} className="text-[#10B981]" />
                ) : validationStatus === 'invalid' ? (
                  <AlertCircle size={18} className="text-red-400" />
                ) : null}
              </div>
           </div>
           <AnimatePresence mode="wait">
             {isVercelConfigured ? (
               <motion.p 
                 initial={{ opacity: 0, y: -4 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-[11px] font-bold text-blue-500 flex items-center gap-1.5 ml-1"
               >
                 <Info size={12} /> OpenAI уже подключён через Vercel Environment Variables
               </motion.p>
             ) : validationStatus === 'valid' ? (
               <motion.p 
                 initial={{ opacity: 0, y: -4 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-[11px] font-bold text-[#059669] flex items-center gap-1.5 ml-1"
               >
                 <CheckCircle2 size={12} /> Ключ выглядит корректно
               </motion.p>
             ) : validationStatus === 'invalid' && value.length > 0 && (
               <motion.p 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-[11px] font-bold text-red-500 flex items-center gap-1.5 ml-1"
               >
                 <AlertCircle size={12} /> Неверный формат ключа
               </motion.p>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Info({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
