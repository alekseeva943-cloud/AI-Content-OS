import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  Search, 
  Trash2, 
  ExternalLink, 
  Layers, 
  LayoutGrid, 
  Mail, 
  Mic2, 
  Video, 
  FileText,
  Clock,
  Calendar,
  Send,
  Sparkles,
  Filter,
  MoreVertical,
  ChevronRight,
  Plus,
  History,
  Grid,
  List as ListIcon,
  Tag,
  Youtube,
  Linkedin,
  MessageCircle
} from 'lucide-react';
import { useFavoritesStore, FavoriteItem } from '@/src/stores/favoritesStore';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const moduleIcons: Record<string, any> = {
  planner: LayoutGrid,
  newsletters: Mail,
  podcasts: Mic2,
  avatars: Video,
  longreads: FileText,
};

const channelConfig: Record<string, any> = {
    telegram: { icon: Send, label: 'Telegram', color: '#3B82F6', text: 'text-blue-600', lightBg: 'bg-blue-50', border: 'border-blue-100', accentBg: 'bg-blue-500' },
    vk: { icon: MessageCircle, label: 'ВКонтакте', color: '#0077FF', text: 'text-blue-700', lightBg: 'bg-blue-50', border: 'border-blue-100', accentBg: 'bg-blue-600' },
    email: { icon: Mail, label: 'Email', color: '#EA4335', text: 'text-red-600', lightBg: 'bg-red-50', border: 'border-red-100', accentBg: 'bg-red-500' },
    youtube: { icon: Youtube, label: 'YouTube', color: '#FF0000', text: 'text-rose-600', lightBg: 'bg-rose-50', border: 'border-rose-100', accentBg: 'bg-rose-600' },
    linkedin: { icon: Linkedin, label: 'LinkedIn', color: '#0077B5', text: 'text-indigo-600', lightBg: 'bg-indigo-50', border: 'border-indigo-100', accentBg: 'bg-indigo-600' },
};

const moduleLabels: Record<string, string> = {
  planner: 'Планировщик',
  newsletters: 'Рассылки',
  podcasts: 'Подкасты',
  avatars: 'AI-Аватары',
  longreads: 'Лонгриды',
};

const platforms = ['telegram', 'vk', 'email', 'youtube', 'linkedin'];
const contentTypes = ['plan', 'idea', 'result', 'script', 'draft', 'strategy'];

export function FavoritesPage() {
  const { favorites, removeFavorite } = useFavoritesStore();
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | 'all'>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<string | 'all'>('all');
  const [selectedType, setSelectedType] = useState<string | 'all'>('all');
  const [isCompact, setIsCompact] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const toggleGroup = (id: string) => {
    setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFavorites = useMemo(() => {
    return favorites.filter(f => {
      const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase()) || 
                           (f.type && f.type.toLowerCase().includes(search.toLowerCase())) ||
                           (typeof f.content === 'string' && f.content.toLowerCase().includes(search.toLowerCase()));
      const matchesModule = selectedModule === 'all' || f.moduleId === selectedModule;
      const matchesPlatform = selectedPlatform === 'all' || f.metadata?.platform === selectedPlatform || f.metadata?.channel === selectedPlatform;
      const matchesType = selectedType === 'all' || f.type === selectedType;
      return matchesSearch && matchesModule && matchesPlatform && matchesType;
    });
  }, [favorites, search, selectedModule, selectedPlatform, selectedType]);

  const favoritesByModule = useMemo(() => {
    const grouped: Record<string, FavoriteItem[]> = {};
    filteredFavorites.forEach(f => {
      if (!grouped[f.moduleId]) grouped[f.moduleId] = [];
      grouped[f.moduleId].push(f);
    });
    return grouped;
  }, [filteredFavorites]);

  const modulesInFavs = ['all', ...Object.keys(moduleIcons).filter(m => favorites.some(f => f.moduleId === m))];

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden pb-10 mx-auto w-full max-w-[1700px] px-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-12 shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-[#111827] text-white flex items-center justify-center shadow-lg shadow-black/10 transition-transform hover:scale-105 duration-300">
              <Star size={32} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#111827] font-display tracking-tight">Рабочая среда</h1>
              <p className="text-[#6B7280] mt-1.5 font-medium text-lg leading-relaxed">Ваша коллекция лучших идей и сгенерированного контента.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#E5E7EB] shadow-sm">
                <button 
                    onClick={() => setIsCompact(false)}
                    className={cn(
                        "p-2 rounded-xl transition-all",
                        !isCompact ? "bg-[#111827] text-white shadow-md" : "text-[#9CA3AF] hover:bg-[#F9FAFB]"
                    )}
                >
                    <Grid size={18} />
                </button>
                <button 
                    onClick={() => setIsCompact(true)}
                    className={cn(
                        "p-2 rounded-xl transition-all",
                        isCompact ? "bg-[#111827] text-white shadow-md" : "text-[#9CA3AF] hover:bg-[#F9FAFB]"
                    )}
                >
                    <ListIcon size={18} />
                </button>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-[#E5E7EB] shadow-sm">
               <Search size={18} className="text-[#9CA3AF] ml-3" />
               <input 
                  type="text" 
                  placeholder="Поиск по контексту..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-transparent border-none outline-none text-[14px] font-medium text-[#111827] placeholder:text-[#9CA3AF] w-64 px-2 h-10"
               />
            </div>
        </div>
      </header>

      <div className="flex gap-10 items-start flex-1 overflow-hidden pb-10">
        <aside className="w-72 shrink-0 flex flex-col gap-8 h-full overflow-y-auto no-scrollbar pr-4">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2 ml-2">
                    <Filter size={14} className="text-[#9CA3AF]" />
                    <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Модули</h3>
                </div>
                <div className="flex flex-col gap-1.5">
                    {modulesInFavs.map(m => (
                        <button
                            key={m}
                            onClick={() => setSelectedModule(m)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-[14px] border",
                                selectedModule === m 
                                    ? "bg-[#111827] text-white border-[#111827] shadow-lg shadow-black/5" 
                                    : "bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F9FAFB] hover:text-[#111827]"
                            )}
                        >
                            {m === 'all' ? <Layers size={18} /> : React.createElement(moduleIcons[m] || Layers, { size: 18 })}
                            <span>{m === 'all' ? 'Все компоненты' : moduleLabels[m]}</span>
                            {selectedModule === m && (
                                <motion.div layoutId="active-tick" className="ml-auto w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2 ml-2">
                    <Send size={14} className="text-[#9CA3AF]" />
                    <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Платформы</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedPlatform('all')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[12px] font-bold border transition-all uppercase tracking-wider",
                            selectedPlatform === 'all' 
                                ? "bg-[#10B981] text-white border-[#10B981]" 
                                : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#10B981]/30"
                        )}
                    >
                        Все
                    </button>
                    {platforms.map(p => (
                        <button
                            key={p}
                            onClick={() => setSelectedPlatform(p)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[12px] font-bold border transition-all uppercase tracking-wider",
                                selectedPlatform === p 
                                    ? "bg-[#10B981] text-white border-[#10B981]" 
                                    : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#10B981]/30 hover:text-[#10B981]"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2 ml-2">
                    <Tag size={14} className="text-[#9CA3AF]" />
                    <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em]">Типы контента</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setSelectedType('all')}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all uppercase tracking-wider",
                            selectedType === 'all' 
                                ? "bg-[#111827] text-white border-[#111827]" 
                                : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#111827]/30"
                        )}
                    >
                        Все
                    </button>
                    {contentTypes.map(t => (
                        <button
                            key={t}
                            onClick={() => setSelectedType(t)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all uppercase tracking-wider",
                                selectedType === t 
                                    ? "bg-[#111827] text-white border-[#111827]" 
                                    : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#111827]/30 hover:text-[#111827]"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

{/* 
            <div className="mt-auto pt-6 border-t border-[#F3F4F6]">
                <div className="p-5 rounded-[2rem] bg-gradient-to-br from-[#111827] to-[#1F2937] text-white overflow-hidden relative group">
                    <Sparkles className="absolute -top-4 -right-4 w-20 h-20 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                    <h4 className="text-lg font-bold mb-2 relative z-10 font-display"> Content Graph</h4>
                    <p className="text-white/60 text-[13px] font-medium leading-relaxed mb-4 relative z-10">Просматривайте связи между вашими идеями и готовым контентом.</p>
                    <button className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[12px] font-bold transition-all border border-white/5 backdrop-blur-sm">
                        Открыть граф
                    </button>
                </div>
            </div>
            */}
        </aside>

        <section className="flex-1 h-full overflow-y-auto pr-4 no-scrollbar custom-scroll space-y-10 scroll-smooth">
            {favorites.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                    <div className="w-40 h-40 rounded-[3.5rem] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center mb-8">
                        <Star size={56} className="text-[#E5E7EB]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#111827] mb-3 font-display">Ваше избранное пустует</h3>
                    <p className="text-[#6B7280] max-w-[400px] leading-relaxed font-medium">Сохраняйте лучшие результаты генерации, используя иконку звездочки, чтобы они появились в этом разделе.</p>
                    <Button 
                        onClick={() => navigate('/')} 
                        className="mt-10 rounded-2xl px-10 shadow-xl shadow-black/10"
                    >
                        Вернуться к созданию
                    </Button>
                </div>
            ) : filteredFavorites.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                    <Search size={56} className="text-[#E5E7EB] mb-8" />
                    <h3 className="text-2xl font-bold text-[#111827] mb-3 font-display">Результатов не найдено</h3>
                    <p className="text-[#6B7280] font-medium">Попробуйте изменить параметры поиска или фильтры в левой панели.</p>
                </div>
            ) : (
                (Object.entries(favoritesByModule) as [string, FavoriteItem[]][]).map(([moduleId, moduleItems]) => {
                    const isCollapsed = collapsedGroups[moduleId];
                    return (
                        <motion.section 
                            key={moduleId} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => toggleGroup(moduleId)}>
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                    isCollapsed ? "bg-[#F9FAFB] text-[#9CA3AF] border border-[#E5E7EB]" : "bg-[#111827] text-white shadow-lg shadow-black/5"
                                )}>
                                    {React.createElement(moduleIcons[moduleId] || Layers, { size: 20 })}
                                </div>
                                <h2 className="text-xl font-bold text-[#111827] tracking-tight font-display">{moduleLabels[moduleId]}</h2>
                                <div className="h-[1px] flex-1 bg-[#F3F4F6]" />
                                <div className="flex items-center gap-3">
                                    <span className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">{moduleItems.length} объекта</span>
                                    <button className={cn("p-1.5 rounded-lg hover:bg-[#F9FAFB] transition-all", isCollapsed && "rotate-180")}>
                                        <MoreVertical size={14} className="text-[#9CA3AF]" />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {!isCollapsed && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={cn(
                                                "grid gap-10 transition-all duration-500",
                                                isCompact ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
                                            )}
                                        >
                                        {moduleItems.map(item => (
                                            <FavoriteCard 
                                                key={item.id} 
                                                item={item} 
                                                isCompact={isCompact}
                                                onDelete={() => removeFavorite(item.id)}
                                                onOpen={() => navigate(item.moduleId === 'planner' ? '/planner' : `/${item.moduleId}`)}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.section>
                    );
                })
            )}
        </section>
      </div>
    </div>
  );
}

function FavoriteCard({ 
    item, 
    isCompact, 
    onDelete, 
    onOpen 
}: { 
    item: FavoriteItem; 
    isCompact: boolean;
    onDelete: () => void; 
    onOpen: () => void; 
    key?: string | number;
}) {
  const navigate = useNavigate();
  
  const date = new Date(item.timestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleRepurpose = (targetModule: string) => {
    toast.success(`Контекст перенесен в ${moduleLabels[targetModule]}`);
    navigate(`/${targetModule}`, { 
        state: { 
            sourceContent: item.content,
            sourceTitle: item.title,
            sourceModule: item.moduleId,
            sourceId: item.id
        } 
    });
  };

  const repurposeActions = Object.keys(moduleIcons).filter(m => m !== item.moduleId);

  if (isCompact) {
    const channel = item.metadata?.channel || item.metadata?.platform || (item.moduleId === 'planner' ? (item.content as any).channel : null);
    const config = channelConfig[channel] || null;
    const CompactIcon = config ? config.icon : (moduleIcons[item.moduleId] || FileText);

    return (
        <motion.div layout className="group/item py-2">
            <div className="flex items-center gap-6 p-4 bg-white border border-[#E5E7EB] rounded-2xl hover:border-[#10B981]/50 hover:shadow-xl hover:shadow-black/[0.02] transition-all duration-300">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
                    config ? `${config.lightBg} ${config.text}` : "bg-[#F9FAFB] text-[#9CA3AF]",
                    config ? `group-hover/item:${config.accentBg} group-hover/item:text-white` : "group-hover/item:bg-[#10B981]/10 group-hover/item:text-[#10B981]"
                )}>
                    <CompactIcon size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-bold text-[#111827] truncate font-display">{item.title}</h4>
                        <span className="text-[10px] font-black text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[12px] text-[#9CA3AF] font-medium">
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {date}</span>
                        {item.metadata?.channel && <span className="uppercase tracking-widest text-[#111827]/40 text-[10px]">{item.metadata.channel}</span>}
                        {item.metadata?.sourceId && (
                            <span className="flex items-center gap-1 text-[#10B981]/70">
                                <History size={12} /> Из {moduleLabels[item.metadata.sourceModule || ''] || 'другого модуля'}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2 pr-2">
                    <div className="flex items-center -space-x-1">
                        {repurposeActions.map(modId => {
                            const Icon = moduleIcons[modId];
                            return (
                                <button 
                                    key={modId}
                                    onClick={() => handleRepurpose(modId)}
                                    className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] hover:border-[#111827] hover:z-10 transition-all hover:scale-110"
                                    title={`Переиспользовать в ${moduleLabels[modId]}`}
                                >
                                    <Icon size={14} />
                                </button>
                            );
                        })}
                    </div>
                    <div className="w-[1px] h-6 bg-[#F3F4F6] mx-2" />
                    <button 
                        onClick={onDelete}
                        className="p-2 rounded-xl text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button 
                        onClick={onOpen}
                        className="p-2 rounded-xl text-[#9CA3AF] hover:text-[#10B981] hover:bg-[#10B981]/5 transition-all"
                    >
                        <ExternalLink size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
  }

  const channel = item.metadata?.channel || item.metadata?.platform || (item.moduleId === 'planner' ? (item.content as any).channel : null);
  const config = channelConfig[channel] || null;
  const Icon = config ? config.icon : (moduleIcons[item.moduleId] || FileText);

  return (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group/card h-full"
    >
        <GlassCard className={cn(
            "p-10 bg-white border-[#E5E7EB] transition-all duration-700 shadow-sm hover:shadow-2xl flex flex-col h-full rounded-[2.5rem] relative overflow-hidden group-hover/card:-translate-y-1",
            config ? `hover:border-[${config.color}]/50` : "hover:border-[#10B981]/50"
        )}>
            <div className={cn(
                "absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 -z-10",
                config ? `from-[${config.color}]/5` : "from-[#10B981]/5"
            )} />
            
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
                <div className="flex items-center gap-5 flex-wrap">
                    <div className={cn(
                        "w-14 h-14 shrink-0 rounded-[1.25rem] border flex items-center justify-center transition-all duration-500 shadow-sm",
                        "bg-[#F9FAFB] border-[#E5E7EB] text-[#9CA3AF]",
                        config ? `group-hover/card:${config.text} group-hover/card:${config.lightBg} group-hover/card:${config.border} group-hover/card:scale-110` : "group-hover/card:text-[#10B981] group-hover/card:bg-[#10B981]/10 group-hover/card:border-[#10B981]/30 group-hover/card:scale-110"
                    )}>
                        <Icon size={26} strokeWidth={2} />
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                       <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                                "text-[12px] font-black uppercase tracking-[0.15em] leading-none shrink-0",
                                config ? `group-hover/card:${config.text} transition-colors duration-500` : "text-[#111827]"
                            )}>{config ? config.label : moduleLabels[item.moduleId]}</span>
                            {item.type && (
                                 <span className={cn(
                                    "text-[10px] font-black text-white px-2.5 py-1 rounded-md uppercase tracking-widest whitespace-nowrap",
                                    config ? config.accentBg : "bg-[#111827]"
                                 )}>
                                    {item.type}
                                 </span>
                            )}
                       </div>
                       <div className="flex items-center gap-2.5 text-[#6B7280]">
                          <Clock size={14} strokeWidth={2.5} className="text-[#9CA3AF]" />
                          <span className="text-[13px] font-bold leading-none">{date}</span>
                          {item.moduleId === 'planner' && (item.content as any).publishDate && (
                             <>
                                <div className="w-[3px] h-[3px] rounded-full bg-[#D1D5DB]" />
                                <Calendar size={14} strokeWidth={2.5} className="text-[#9CA3AF]" />
                                <span className="text-[13px] font-bold leading-none">
                                    {new Date((item.content as any).publishDate).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                             </>
                          )}
                       </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6 flex-1 flex flex-col">
              <h4 className={cn(
                  "text-2xl font-bold text-[#111827] leading-[1.2] transition-colors font-display tracking-tight flex-1",
                  config ? `group-hover/card:${config.text}` : "group-hover/card:text-[#10B981]"
              )}>
                  {item.title}
              </h4>

              {item.metadata?.sourceId && (
                  <div className={cn(
                      "p-5 rounded-[1.5rem] bg-[#F9FAFB] border border-[#E5E7EB] border-l-4 shadow-sm",
                      config ? `group-hover/card:${config.border.replace('border-', 'border-l-')}` : "border-l-[#10B981]"
                  )}>
                      <div className="flex items-center gap-2 mb-2">
                        <History size={14} className={config ? config.text : "text-[#10B981]"} />
                        <span className={cn("text-[10px] font-black uppercase tracking-widest", config ? config.text : "text-[#10B981]")}>Основано на {moduleLabels[item.metadata.sourceModule || ''] || 'другом модуле'}</span>
                      </div>
                  </div>
              )}

              <div className="text-[16px] text-[#6B7280] leading-relaxed font-medium flex-1 line-clamp-4">
                  {typeof item.content === 'string' ? item.content : (item.content.summary || item.content.description || item.content.topic || 'Нет описания')}
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-[#F3F4F6]">
                <div className="flex flex-col gap-4">
                    <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest ml-1">Создать из этого:</span>
                    <div className="flex flex-wrap gap-2">
                        {repurposeActions.map(modId => {
                            const Icon = moduleIcons[modId];
                            return (
                                <button 
                                    key={modId}
                                    onClick={() => handleRepurpose(modId)}
                                    className="p-2.5 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#111827] hover:text-white hover:border-[#111827] transition-all flex items-center gap-2 group/btn"
                                    title={`Создать ${moduleLabels[modId].toLowerCase()}`}
                                >
                                    <Icon size={16} />
                                    <span className="hidden group-hover/btn:inline text-[10px] font-bold uppercase">{moduleLabels[modId]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#F3F4F6] flex items-center justify-between">
                    <button 
                        onClick={onDelete}
                        className="p-3 rounded-2xl bg-white border border-[#E5E7EB] text-[#9CA3AF] hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm active:scale-95"
                        title="Удалить"
                    >
                        <Trash2 size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={onOpen}
                            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-[#111827] text-white hover:bg-[#10B981] transition-all text-[13px] font-bold shadow-lg active:scale-95"
                        >
                            <span>Открыть</span>
                            <ExternalLink size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </GlassCard>
    </motion.div>
  );
}

