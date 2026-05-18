import React from 'react';
import { Shield, Key, Database, Zap, ExternalLink, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { useSettingsStore } from '@/src/stores/useSettingsStore';
import { AI_PROVIDERS } from '@/src/config/providers';

export function SettingsPage() {
  const { 
    openaiKey, setOpenAIKey,
    heygenKey, setHeygenKey,
    elevenlabsKey, setElevenlabsKey
  } = useSettingsStore();

  const handleSave = () => {
    // Logic to save/validate would go here
    console.log('Keys saved securely to internal state');
  };

  return (
    <div className="max-w-4xl space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold tracking-tight text-[#F1F2F4] font-display">
              Настройки
            </h1>
            <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                <Shield size={20} />
            </div>
        </div>
        <p className="text-[#898E9E] max-w-xl text-[16px] font-medium leading-relaxed mt-2">
          Управляйте вашими ключами и доступом к внешним сервисам. Все данные хранятся локально в зашифрованном виде.
        </p>
      </section>

      <div className="space-y-10">
        <GlassCard className="p-10 w-full bg-[#15181E] border-[#242933] shadow-xl">
           <div className="flex items-center gap-4 mb-10">
             <div className="p-3 rounded-xl bg-[#1C2028] border border-[#383E4C]">
               <Key className="w-6 h-6 text-[#10B981]" />
             </div>
             <div className="flex flex-col">
                <h2 className="text-xl font-bold text-[#F1F2F4] tracking-tight">API Интеграции</h2>
                <span className="text-[12px] font-medium text-[#4B5262]">Подключение облачных технологий для синтеза контента</span>
             </div>
           </div>

           <div className="space-y-10">
              {AI_PROVIDERS.map((provider) => (
                <div key={provider.id} className="flex flex-col md:flex-row md:items-start gap-8 group">
                   <div className="w-full md:w-64 flex-shrink-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[15px] font-bold text-[#E2E4E9] group-hover:text-[#10B981] transition-colors">{provider.name}</span>
                        {provider.isEnabled ? (
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#10B981]/10 border border-[#10B981]/20">
                             <CheckCircle2 size={10} className="text-[#10B981]" />
                             <span className="text-[9px] font-bold text-[#10B981] uppercase tracking-wider">Active</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold text-[#4B5262] bg-[#1C2028] px-2 py-0.5 rounded-md border border-[#383E4C]">Cкоро</span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#898E9E] leading-relaxed font-medium mb-4">{provider.description}</p>
                      <a 
                        href={provider.documentationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-[11px] font-bold text-[#10B981] opacity-60 hover:opacity-100 transition-all"
                      >
                        Как получить ключ
                        <ExternalLink size={12} />
                      </a>
                   </div>
                   
                   <div className="flex-1">
                      <div className="relative group/input">
                        <input 
                            type="password"
                            placeholder={`${provider.name} API Ключ`}
                            disabled={!provider.isEnabled}
                            value={
                                provider.id === 'openai' ? openaiKey :
                                provider.id === 'heygen' ? heygenKey :
                                elevenlabsKey
                            }
                            onChange={(e) => {
                                if (provider.id === 'openai') setOpenAIKey(e.target.value);
                                if (provider.id === 'heygen') setHeygenKey(e.target.value);
                                if (provider.id === 'elevenlabs') setElevenlabsKey(e.target.value);
                            }}
                            className="w-full bg-[#0D0F12] border border-[#242933] rounded-2xl px-6 py-4 text-[14px] font-mono text-[#F1F2F4] focus:outline-none focus:border-[#10B981]/40 transition-all placeholder:text-[#4B5262] disabled:opacity-30 disabled:cursor-not-allowed group-hover/input:border-[#383E4C]"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-[#10B981]/[0.02] opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 pt-10 border-t border-[#242933] flex justify-end">
              <Button 
                onClick={handleSave} 
                className="w-full md:w-64 shadow-xl shadow-[#10B981]/10 rounded-xl"
              >
                Сохранить настройки
              </Button>
           </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <GlassCard className="p-8 group bg-[#15181E] border-[#242933] transition-all hover:border-[#10B981]/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2.5 rounded-xl bg-[#1C2028] border border-[#383E4C] text-[#898E9E] group-hover:text-[#10B981] transition-colors">
                  <Database size={20} />
                </div>
                <h3 className="text-base font-bold text-[#F1F2F4]">Хранилище данных</h3>
              </div>
              <p className="text-[13px] text-[#898E9E] leading-relaxed mb-8 font-medium">
                Вы можете очистить все временные данные и сбросить кэш нейронной памяти.
              </p>
              <Button variant="outline" size="sm" className="text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 rounded-xl font-bold">
                Сбросить кэш
              </Button>
           </GlassCard>

           <GlassCard className="p-8 group bg-[#15181E] border-[#242933] transition-all hover:border-[#10B981]/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2.5 rounded-xl bg-[#1C2028] border border-[#383E4C] text-[#898E9E] group-hover:text-[#10B981] transition-colors">
                  <Zap size={20} />
                </div>
                <h3 className="text-base font-bold text-[#F1F2F4]">Глубина интерфейса</h3>
              </div>
              <p className="text-[13px] text-[#898E9E] leading-relaxed mb-8 font-medium">
                Настройте баланс между визуальными эффектами и скоростью работы.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#4B5262] uppercase tracking-wider">High Fidelity Mode</span>
                <div className="w-12 h-6 rounded-full bg-[#10B981]/10 border border-[#10B981]/30 p-1 flex items-center justify-end shadow-inner">
                   <motion.div 
                     layout
                     className="w-4 h-4 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)] cursor-pointer" 
                   />
                </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
