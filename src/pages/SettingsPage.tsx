import { Shield, Key, Database, Zap } from 'lucide-react';
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
    <div className="max-w-4xl space-y-8 pb-12">
      <section className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight text-white flex items-center gap-3">
          Orchestration Settings
          <Shield className="text-emerald-400 w-8 h-8" />
        </h1>
        <p className="text-white/40 max-w-lg leading-relaxed">
          Configure your tactical AI infrastructure. All keys are stored locally in your encrypted session state.
        </p>
      </section>

      <div className="space-y-6">
        <GlassCard className="p-8 w-full">
           <div className="flex items-center gap-3 mb-8">
             <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
               <Key className="w-5 h-5 text-emerald-400" />
             </div>
             <h2 className="text-xl font-bold uppercase tracking-tight">API Infrastructure</h2>
           </div>

           <div className="space-y-8">
              {AI_PROVIDERS.map((provider) => (
                <div key={provider.id} className="flex flex-col gap-3">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white uppercase tracking-tight">{provider.name}</span>
                        {!provider.isEnabled && (
                          <span className="text-[10px] font-mono text-white/20 bg-white/5 px-2 py-0.5 rounded uppercase tracking-widest leading-none">Coming Soon</span>
                        )}
                      </div>
                      <a href={provider.documentationUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-emerald-400 hover:underline uppercase">Doc Reference</a>
                   </div>
                   
                   <p className="text-xs text-white/40 mb-2 leading-relaxed">{provider.description}</p>
                   
                   <div className="relative group">
                      <input 
                        type="password"
                        placeholder={`${provider.name} API Key`}
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
                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                      />
                      <div className="absolute inset-0 rounded-xl bg-emerald-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-12 flex justify-end">
              <Button onClick={handleSave} className="w-48">
                Confirm All Keys
              </Button>
           </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-6">
           <GlassCard className="p-6 h-auto">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-tight">State Persistence</h3>
              </div>
              <p className="text-xs text-white/30 leading-relaxed mb-6">
                You can manually clear all tactical data and cached AI responses from locally stored session persistence.
              </p>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                Clear System Cache
              </Button>
           </GlassCard>

           <GlassCard className="p-6 h-auto">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-tight">Performance Mode</h3>
              </div>
              <p className="text-xs text-white/30 leading-relaxed mb-6">
                Optimize neural latency or visual fidelity. High fidelity increases translucency effects.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-white/40">Neural High Fidelity</span>
                <div className="w-10 h-5 rounded-full bg-white/5 border border-white/10 p-1 flex items-center justify-end">
                   <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
}
