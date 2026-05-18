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
  Send,
  Sparkles
} from 'lucide-react';
import { useFavoritesStore, FavoriteItem } from '@/src/stores/favoritesStore';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

const moduleIcons: Record<string, any> = {
  planner: LayoutGrid,
  newsletters: Mail,
  podcasts: Mic2,
  avatars: Video,
  longreads: FileText,
};

const moduleLabels: Record<string, string> = {
  planner: 'Планировщик',
  newsletters: 'Рассылки',
  podcasts: 'Подкасты',
  avatars: 'AI-Аватары',
  longreads: 'Лонгриды',
};

export function FavoritesPage() {
  const { favorites, removeFavorite } = useFavoritesStore();
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | 'all'>('all');
  const navigate = useNavigate();

  const filteredFavorites = useMemo(() => {
    return favorites.filter(f => {
      const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase()) || 
                           (f.type && f.type.toLowerCase().includes(search.toLowerCase()));
      const matchesModule = selectedModule === 'all' || f.moduleId === selectedModule;
      return matchesSearch && matchesModule;
    });
  }, [favorites, search, selectedModule]);

  const favoritesByModule = useMemo(() => {
    const grouped: Record<string, FavoriteItem[]> = {};
    filteredFavorites.forEach(f => {
      if (!grouped[f.moduleId]) grouped[f.moduleId] = [];
      grouped[f.moduleId].push(f);
    });
    return grouped;
  }, [filteredFavorites]);

  const modules = ['all', ...Object.keys(moduleIcons).filter(m => favorites.some(f => f.moduleId === m))];

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden pb-10 mx-auto w-full max-w-[1700px] px-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-12 shrink-0">
        <div className="space-y-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-[#111827] text-white flex items-center justify-center shadow-lg shadow-black/10">
              <Star size={32} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#111827] font-display tracking-tight">Избранное</h1>
              <p className="text-[#6B7280] mt-1.5 font-medium text-lg leading-relaxed">Ваша коллекция лучших идей и сгенерированного контента.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-[#E5E7EB] shadow-sm">
           <Search size={18} className="text-[#9CA3AF] ml-3" />
           <input 
              type="text" 
              placeholder="Поиск по избранному..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[14px] font-medium text-[#111827] placeholder:text-[#9CA3AF] w-64 px-2 h-10"
           />
        </div>
      </header>

      <div className="flex gap-10 items-start flex-1 overflow-hidden pb-10">
        <div className="w-64 shrink-0 flex flex-col gap-2">
            <h3 className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-[0.2em] mb-4 ml-2">Фильтр модулей</h3>
            {modules.map(m => (
                <button
                    key={m}
                    onClick={() => setSelectedModule(m)}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-[14px]",
                        selectedModule === m 
                            ? "bg-[#10B981]/5 text-[#059669] border border-[#10B981]/10" 
                            : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                    )}
                >
                    {m === 'all' ? <Layers size={18} /> : React.createElement(moduleIcons[m] || Layers, { size: 18 })}
                    <span>{m === 'all' ? 'Все модули' : moduleLabels[m]}</span>
                    {selectedModule === m && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    )}
                </button>
            ))}
        </div>

        <div className="flex-1 h-full overflow-y-auto pr-4 no-scrollbar custom-scroll space-y-12">
            {favorites.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                    <div className="w-40 h-40 rounded-[3.5rem] bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center mb-8">
                        <Star size={56} className="text-[#E5E7EB]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#111827] mb-3 font-display">Тут пока пусто</h3>
                    <p className="text-[#6B7280] max-w-[400px] leading-relaxed font-medium">Сохраняйте лучшие результаты генерации, используя иконку звездочки, чтобы они появились в этом разделе.</p>
                    <Button 
                        onClick={() => navigate('/')} 
                        className="mt-10 rounded-2xl px-10"
                    >
                        Начать создание
                    </Button>
                </div>
            ) : filteredFavorites.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                    <Search size={56} className="text-[#E5E7EB] mb-8" />
                    <h3 className="text-2xl font-bold text-[#111827] mb-3 font-display">Ничего не найдено</h3>
                    <p className="text-[#6B7280] font-medium">Попробуйте изменить параметры поиска или фильтр модулей.</p>
                </div>
            ) : (
                (Object.entries(favoritesByModule) as [string, FavoriteItem[]][]).map(([moduleId, moduleItems]) => (
                    <section key={moduleId} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-[#9CA3AF]">
                                {React.createElement(moduleIcons[moduleId] || Layers, { size: 20 })}
                            </div>
                            <h2 className="text-xl font-black text-[#111827] tracking-tighter uppercase">{moduleLabels[moduleId]}</h2>
                            <div className="h-[1px] flex-1 bg-[#F3F4F6]" />
                            <span className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">{moduleItems.length} объекта</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {moduleItems.map(item => (
                                <FavoriteCard 
                                    key={item.id} 
                                    item={item} 
                                    onDelete={() => removeFavorite(item.id)}
                                    onOpen={() => navigate(item.moduleId === 'planner' ? '/planner' : `/${item.moduleId}`)}
                                />
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
      </div>
    </div>
  );
}

function FavoriteCard({ item, onDelete, onOpen }: { item: FavoriteItem; onDelete: () => void; onOpen: () => void; key?: any }) {
  const date = new Date(item.timestamp).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="group/card"
    >
        <GlassCard className="p-6 bg-white border-[#E5E7EB] hover:border-[#10B981]/30 transition-all duration-300 shadow-sm hover:shadow-xl rounded-2xl flex flex-col h-full relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Clock size={12} className="text-[#9CA3AF]" />
                    <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest">{date}</span>
                </div>
                {item.type && (
                    <span className="text-[10px] font-black text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#10B981]/20">
                        {item.type}
                    </span>
                )}
            </div>

            <h4 className="text-lg font-bold text-[#111827] mb-3 leading-snug font-display line-clamp-2">
                {item.title}
            </h4>

            <div className="text-[14px] text-[#6B7280] font-medium leading-relaxed flex-1 line-clamp-4">
                {typeof item.content === 'string' ? item.content : (item.content.summary || item.content.description || 'Нет описания')}
            </div>

            <div className="mt-6 pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
                <button 
                    onClick={onDelete}
                    className="p-2 rounded-xl text-[#9CA3AF] hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Удалить"
                >
                    <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onOpen}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] hover:border-[#10B981]/30 hover:text-[#10B981] transition-all text-[12px] font-bold"
                    >
                        <span>Использовать</span>
                        <ExternalLink size={14} />
                    </button>
                </div>
            </div>
        </GlassCard>
    </motion.div>
  );
}
