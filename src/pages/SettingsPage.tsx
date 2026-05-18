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
    <div className="max-w-5xl space-y-10 pb-20">
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
            <h1 className="text-4xl font-bold tracking-tight text-white uppercase">
              Настройки Инфраструктуры
            </h1>
            <Shield className="text-emerald-400 w-8 h-8" />
        </div>
        <p className="text-white/30 max-w-xl text-[14px] leading-relaxed font-medium">
          Управляйте вашими API-ключами и настройками безопасности. Все данные хранятся локально в зашифрованном виде.
        </p>
      </section>

      <div className="space-y-8">
        <GlassCard className="p-12 w-full bg-[#111827]/40 ring-1 ring-white/[0.03]">
           <div className="flex items-center gap-4 mb-12">
             <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
               <Key className="w-6 h-6 text-emerald-400" />
             </div>
             <div className="flex flex-col">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white/90">API Провайдеры</h2>
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Подключение облачных технологий</span>
             </div>
           </div>

           <div className="grid grid-cols-1 gap-12">
              {AI_PROVIDERS.map((provider) => (
                <div key={provider.id} className="flex flex-col md:flex-row md:items-start gap-8 group">
                   <div className="w-full md:w-64 flex-shrink-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{provider.name}</span>
                        {provider.isEnabled ? (
                          <CheckCircle2 size={14} className="text-emerald-500" />
                        ) : (
                          <span className="text-[9px] font-mono text-white/10 bg-white/5 px-2 py-0.5 rounded-md uppercase tracking-widest border border-white/5">Скоро</span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/30 leading-relaxed font-medium mb-4">{provider.description}</p>
                      <a 
                        href={provider.documentationUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-[10px] font-mono text-emerald-400/60 hover:text-emerald-400 transition-colors uppercase tracking-widest"
                      >
                        Документация
                        <ExternalLink size={10} />
                      </a>
                   </div>
                   
                   <div className="flex-1 relative">
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
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-emerald-500/30 transition-all font-mono placeholder:text-white/5 disabled:opacity-30 disabled:cursor-not-allowed group-hover:border-white/10"
                      />
                      <div className="absolute inset-0 rounded-2xl bg-emerald-500/[0.01] opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-16 pt-10 border-t border-white/[0.03] flex justify-end">
              <Button 
                onClick={handleSave} 
                className="w-64 py-4 uppercase tracking-[0.2em] font-bold text-xs shadow-xl shadow-emerald-500/10"
              >
                Сохранить ключи
              </Button>
           </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <GlassCard className="p-10 h-auto group bg-white/[0.01] hover:bg-white/[0.02] transition-colors ring-1 ring-white/[0.03]">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <Database className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest">Очистка Кэша</h3>
              </div>
              <p className="text-xs text-white/30 leading-relaxed mb-8 font-medium">
                Вы можете вручную очистить все временные данные и кэшированные ответы нейросетей из локального хранилища.
              </p>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-0 hover:px-4">
                Удалить кэш системы
              </Button>
           </GlassCard>

           <GlassCard className="p-10 h-auto group bg-white/[0.01] hover:bg-white/[0.02] transition-colors ring-1 ring-white/[0.03]">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest">Визуальные Эффекты</h3>
              </div>
              <p className="text-xs text-white/30 leading-relaxed mb-8 font-medium">
                Настройте баланс между визуальной глубиной интерфейса и скоростью отрисовки.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">Glassmorphism High-Fidelity</span>
                <div className="w-12 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 p-1 flex items-center justify-end shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]">
                   <motion.div 
                     layout
                     className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                   />
                </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
