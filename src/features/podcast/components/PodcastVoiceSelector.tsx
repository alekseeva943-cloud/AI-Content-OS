import { useState } from 'react';
import { PodcastVoice, VoiceSelection } from '../types/podcast.types';
import { Volume2, Check, User, Sparkles } from 'lucide-react';

const HOST_VOICES: PodcastVoice[] = [
  { id: 'pNInz6obpgdq5TaqLwtY', name: 'Adam', gender: 'male', description: 'Глубокий, профессиональный и размеренный экспертный голос (Бизнес)' },
  { id: 'TxGEqn7nUaNZTRmsh7M3', name: 'Josh', gender: 'male', description: 'Энергичный, живой, позитивный подкаст-стиль общения' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'female', description: 'Приятный, доверительный, экспертный женский голос' }
];

const GUEST_VOICES: PodcastVoice[] = [
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'male', description: 'Теплый, интригующий и повествовательный рассказчик' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'female', description: 'Мягкий, обволакивающий, спокойный голос' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', gender: 'female', description: 'Естественный, вовлеченный и общительный тембр' }
];

interface PodcastVoiceSelectorProps {
  selection: VoiceSelection;
  onChange: (val: VoiceSelection) => void;
  guestEnabled: boolean;
  guestName?: string;
}

export function PodcastVoiceSelector({ selection, onChange, guestEnabled, guestName = 'Гость' }: PodcastVoiceSelectorProps) {
  const handleHostVoiceSelect = (voiceId: string) => {
    onChange({ ...selection, hostVoiceId: voiceId });
  };

  const handleGuestVoiceSelect = (voiceId: string) => {
    onChange({ ...selection, guestVoiceId: voiceId });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
        <Sparkles size={16} className="text-[#10B981]" />
        <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Голоса ведущего и гостя</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Host Voice Card List */}
        <div className="space-y-3">
          <label className="text-[12px] font-black text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 leading-none">
            <User size={13} className="text-[#10B981]" />
            Ведущий (Host)
          </label>
          <div className="space-y-2">
            {HOST_VOICES.map((voice) => {
              const isSelected = selection.hostVoiceId === voice.id;
              return (
                <div
                  key={voice.id}
                  onClick={() => handleHostVoiceSelect(voice.id)}
                  id={`voice-host-${voice.id}`}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/60 border-[#10B981] shadow-sm'
                      : 'bg-white border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-neutral-100 text-neutral-500'}`}>
                    <Volume2 size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-neutral-800">{voice.name}</span>
                      <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                        {voice.gender === 'male' ? 'Мужской' : 'Женский'}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-snug">{voice.description}</p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 self-center">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Guest Voice Card List */}
        {guestEnabled ? (
          <div className="space-y-3">
            <label className="text-[12px] font-black text-neutral-500 uppercase tracking-wider flex items-center gap-1.5 leading-none">
              <User size={13} className="text-emerald-600" />
              {guestName} (Guest)
            </label>
            <div className="space-y-2">
              {GUEST_VOICES.map((voice) => {
                const isSelected = selection.guestVoiceId === voice.id;
                return (
                  <div
                    key={voice.id}
                    onClick={() => handleGuestVoiceSelect(voice.id)}
                    id={`voice-guest-${voice.id}`}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/60 border-[#10B981] shadow-sm'
                        : 'bg-white border-neutral-200 hover:border-neutral-300'
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${isSelected ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-neutral-100 text-neutral-500'}`}>
                      <Volume2 size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-neutral-800">{voice.name}</span>
                        <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                          {voice.gender === 'male' ? 'Мужской' : 'Женский'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-snug">{voice.description}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center shrink-0 self-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-neutral-200 rounded-3rem bg-neutral-50 h-full text-center">
            <User size={32} className="text-neutral-300 mb-2" />
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Гость отключен</p>
            <p className="text-[11px] text-neutral-400 mt-1 max-w-[200px]">
              Будет сгенерирован сольный выпуск с участием только Ведущего
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
