// ============================================
// FILE: src/features/newsletter/components/CampaignResult.tsx
// ============================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    Mail,
    Send,
    Copy,
    Save,
    RefreshCw,
    Check,
    ArrowRight,
    ExternalLink,
    MessageCircle,
    FileText,
    Download,
    Image as ImageIcon,
    Sparkles,
    Info
} from 'lucide-react';

import { CampaignResult } from '@/src/types/newsletter';
import { GlassCard, Button } from '@/src/shared/components/UI';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { useFavoritesStore } from '@/src/stores/favoritesStore';
import ReactMarkdown from 'react-markdown';
import { generateCampaignImage } from '@/src/services/ai/client';

interface CampaignResultDisplayProps {
    result: CampaignResult;
    onRegenerate?: () => void;
    sourceInfo?: any;
}

export function CampaignResultDisplay({
    result,
    onRegenerate,
    sourceInfo
}: CampaignResultDisplayProps) {

    const channels =
        result.channels || [];

    const [activeTab, setActiveTab] =
        useState<string>(
            channels[0]?.id || 'email'
        );

    const [copied, setCopied] =
        useState<string | null>(
            null
        );

    const [imageUrls, setImageUrls] =
        useState<Record<string, string>>(
            {}
        );

    const [
        isGeneratingImage,
        setIsGeneratingImage
    ] = useState<Record<string, boolean>>(
        {}
    );

    const availableTabs = [
        {
            id: 'email',
            icon: Mail,
            label: 'Email'
        },

        {
            id: 'telegram',
            icon: Send,
            label: 'Telegram'
        },

        {
            id: 'vk',
            icon: MessageCircle,
            label: 'VK'
        }
    ].filter(
        tab =>
            channels.some(
                c => c.id === tab.id
            )
    );

    useEffect(() => {

        if (
            channels.length > 0 &&
            !channels.some(
                c =>
                    c.id === activeTab
            )
        ) {
            setActiveTab(
                channels[0].id
            );
        }

    }, [channels, activeTab]);

    const activeChannel =
        channels.find(
            c =>
                c.id === activeTab
        ) || channels[0];

    const addFavorite =
        useFavoritesStore(
            state =>
                state.addFavorite
        );

    const normalizeContentBody = (
        body: string
    ) => {

        if (!body) {
            return '';
        }

        return body
            .replace(
                /<br\s*\/?>/gi,
                '\n'
            )
            .replace(
                /<\/p>/gi,
                '\n\n'
            )
            .replace(
                /<p>/gi,
                ''
            )
            .replace(
                /<[^>]*>/g,
                ''
            )
            .trim();
    };

    const activeChannelBody =
        normalizeContentBody(
            activeChannel
                .content?.body || ''
        );

    const handleGenerateImage =
        async (
            channelId: string,
            prompt: string
        ) => {

            if (
                isGeneratingImage[
                    channelId
                ]
            ) {
                return;
            }

            setIsGeneratingImage(
                prev => ({
                    ...prev,
                    [channelId]: true
                })
            );

            try {

                const url =
                    await generateCampaignImage(
                        prompt,
                        channelId
                    );

                if (url) {

                    setImageUrls(
                        prev => ({
                            ...prev,
                            [channelId]: url
                        })
                    );

                    toast.success(
                        'Визуал создан'
                    );
                }

            } catch (err) {

                console.error(err);

                toast.error(
                    'Не удалось создать изображение'
                );

            } finally {

                setIsGeneratingImage(
                    prev => ({
                        ...prev,
                        [channelId]: false
                    })
                );
            }
        };

    const handleCopy = (
        content: string,
        type: string
    ) => {

        navigator.clipboard.writeText(
            content
        );

        setCopied(type);

        toast.success(
            'Контент скопирован'
        );

        setTimeout(
            () =>
                setCopied(null),
            2000
        );
    };

    const handleSave = () => {

        addFavorite({
            id:
                `campaign-${Date.now()}`,

            moduleId:
                'newsletters',

            type:
                'result',

            title:
                result.name,

            content:
                result,

            metadata: {
                generatedAt:
                    new Date()
                        .toISOString(),

                sourceModule:
                    sourceInfo?.module,

                sourceId:
                    sourceInfo?.id
            }
        });

        toast.success(
            'Кампания сохранена'
        );
    };

    const exportAsTxt = () => {

        const text =
            `КАМПАНИЯ: ${result?.name || 'Без названия'}\n\n` +

            channels.map(
                c =>
                    `--- ${(c?.id || 'Unknown').toUpperCase()} ---\n${c?.content?.body || ''}\n`
            ).join('\n');

        const blob =
            new Blob(
                [text],
                {
                    type:
                        'text/plain'
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                'a'
            );

        a.href = url;

        a.download =
            `${result?.name || 'campaign'}.txt`;

        a.click();
    };

    if (
        !activeChannel ||
        !activeChannel.content
    ) {

        return (
            <div className="p-20 text-center bg-white border border-[#E5E7EB] rounded-[3.5rem] shadow-2xl">

                <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6">
                    <Info size={40} />
                </div>

                <h3 className="text-xl font-bold text-[#111827] mb-2">
                    Ошибка данных
                </h3>

                <p className="text-[#6B7280]">
                    Кампания повреждена
                    или имеет неверный формат
                </p>

            </div>
        );
    }

    return (
        <div className="space-y-10">

            {/* HEADER */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 20
                }}

                animate={{
                    opacity: 1,
                    y: 0
                }}

                className="
                    p-8
                    bg-[#111827]
                    rounded-[2.5rem]
                    border
                    border-white/10
                    shadow-2xl
                "
            >

                <div className="flex items-start gap-6">

                    <div className="
                        w-14
                        h-14
                        rounded-2xl
                        bg-emerald-500/20
                        flex
                        items-center
                        justify-center
                        text-emerald-400
                    ">
                        <Sparkles size={28} />
                    </div>

                    <div>

                        <span className="
                            text-[10px]
                            font-black
                            text-emerald-400
                            uppercase
                            tracking-[0.2em]
                        ">
                            Стратегия кампании
                        </span>

                        <h2 className="
                            text-2xl
                            font-bold
                            text-white
                            mt-2
                            mb-3
                        ">
                            {result.name}
                        </h2>

                        <p className="
                            text-white/60
                            text-sm
                            leading-relaxed
                        ">
                            {result.strategy}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* MAIN */}

            <GlassCard className="
                p-0
                bg-white
                border-[#E5E7EB]
                shadow-2xl
                rounded-[3.5rem]
                overflow-hidden
            ">

                {/* TABS */}

                <div className="
                    flex
                    items-center
                    justify-between
                    px-10
                    pt-10
                    border-b
                    border-[#F3F4F6]
                ">

                    <div className="flex gap-10">

                        {availableTabs.map(
                            (tab) => (

                                <button
                                    key={tab.id}

                                    onClick={() =>
                                        setActiveTab(
                                            tab.id
                                        )
                                    }

                                    className={cn(
                                        `
                                        flex
                                        items-center
                                        gap-2.5
                                        pb-8
                                        border-b-2
                                        transition-all
                                        relative
                                        `,
                                        activeTab ===
                                            tab.id

                                            ? `
                                                border-[#10B981]
                                                text-[#111827]
                                            `

                                            : `
                                                border-transparent
                                                text-[#9CA3AF]
                                            `
                                    )}
                                >

                                    <tab.icon size={18} />

                                    <span className="
                                        text-[14px]
                                        font-bold
                                        uppercase
                                        tracking-wider
                                    ">
                                        {tab.label}
                                    </span>
                                </button>
                            )
                        )}
                    </div>
                </div>

                {/* BODY */}

                <div className="
                    flex
                    flex-col
                    lg:flex-row
                    min-h-[600px]
                ">

                    {/* CONTENT */}

                    <div className="
                        flex-1
                        p-10
                        lg:p-16
                        border-r
                        border-[#F3F4F6]
                    ">

                        <div className="
                            max-w-[700px]
                            mx-auto
                            space-y-10
                        ">

                            {activeTab ===
                                'email' && (

                                <div className="
                                    p-8
                                    rounded-[2rem]
                                    bg-[#F9FAFB]
                                    border
                                    border-[#E5E7EB]
                                    space-y-4
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-6
                                        text-[13px]
                                    ">

                                        <span className="
                                            w-20
                                            font-bold
                                            text-[#9CA3AF]
                                            uppercase
                                        ">
                                            Тема:
                                        </span>

                                        <span className="
                                            font-bold
                                            text-[#111827]
                                        ">
                                            {activeChannel.content?.subject}
                                        </span>
                                    </div>

                                    <div className="
                                        flex
                                        items-center
                                        gap-6
                                        text-[13px]
                                    ">

                                        <span className="
                                            w-20
                                            font-bold
                                            text-[#9CA3AF]
                                            uppercase
                                        ">
                                            Превью:
                                        </span>

                                        <span className="
                                            font-medium
                                            text-[#6B7280]
                                            italic
                                        ">
                                            {activeChannel.content?.preheader}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="
                                prose
                                prose-slate
                                prose-lg
                                max-w-none
                            ">

                                <ReactMarkdown>
                                    {activeChannelBody}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR */}

                    <div className="
                        w-full
                        lg:w-[400px]
                        bg-[#F9FAFB]/50
                        p-10
                        flex
                        flex-col
                        gap-8
                    ">

                        {/* IMAGE */}

                        <div className="space-y-4">

                            <div className="
                                flex
                                items-center
                                justify-between
                            ">

                                <h4 className="
                                    text-[11px]
                                    font-black
                                    text-[#9CA3AF]
                                    uppercase
                                    tracking-widest
                                ">
                                    Визуальное сопровождение
                                </h4>

                                <button
                                    onClick={() =>
                                        activeChannel
                                            .content
                                            .imagePrompt &&
                                        handleGenerateImage(
                                            activeChannel.id,
                                            activeChannel.content.imagePrompt
                                        )
                                    }

                                    disabled={
                                        isGeneratingImage[
                                            activeChannel.id
                                        ]
                                    }

                                    className="
                                        p-2
                                        rounded-lg
                                        bg-white
                                        border
                                        border-[#E5E7EB]
                                    "
                                >

                                    <RefreshCw
                                        size={14}
                                        className={cn(
                                            isGeneratingImage[
                                                activeChannel.id
                                            ] &&
                                            'animate-spin'
                                        )}
                                    />
                                </button>
                            </div>

                            <div className="
                                aspect-square
                                rounded-[2rem]
                                bg-white
                                border
                                border-[#E5E7EB]
                                overflow-hidden
                                relative
                            ">

                                {imageUrls[
                                    activeChannel.id
                                ] ? (

                                    <img
                                        src={
                                            imageUrls[
                                                activeChannel.id
                                            ]
                                        }

                                        alt="Campaign"

                                        className="
                                            w-full
                                            h-full
                                            object-cover
                                        "
                                    />

                                ) : (

                                    <div className="
                                        w-full
                                        h-full
                                        flex
                                        flex-col
                                        items-center
                                        justify-center
                                        gap-4
                                        p-8
                                    ">

                                        {isGeneratingImage[
                                            activeChannel.id
                                        ] ? (

                                            <>
                                                <div className="
                                                    w-12
                                                    h-12
                                                    rounded-full
                                                    border-2
                                                    border-[#10B981]/20
                                                    border-t-[#10B981]
                                                    animate-spin
                                                " />

                                                <p className="
                                                    text-[11px]
                                                    font-bold
                                                    text-[#6B7280]
                                                ">
                                                    Создаю визуал...
                                                </p>
                                            </>

                                        ) : (

                                            <>
                                                <ImageIcon
                                                    size={40}
                                                    className="text-[#D1D5DB]"
                                                />

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl"

                                                    onClick={() =>
                                                        activeChannel
                                                            .content
                                                            .imagePrompt &&
                                                        handleGenerateImage(
                                                            activeChannel.id,
                                                            activeChannel.content.imagePrompt
                                                        )
                                                    }
                                                >
                                                    Создать visual
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* VARIABLES */}

                        <div className="
                            p-6
                            rounded-[2rem]
                            bg-white
                            border
                            border-[#E5E7EB]
                            shadow-sm
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                                mb-4
                            ">

                                <div className="
                                    w-8
                                    h-8
                                    rounded-xl
                                    bg-[#F3F4F6]
                                    flex
                                    items-center
                                    justify-center
                                    text-[#9CA3AF]
                                ">
                                    <Info size={16} />
                                </div>

                                <div>

                                    <h4 className="
                                        text-[12px]
                                        font-bold
                                        text-[#111827]
                                        uppercase
                                    ">
                                        Персонализация кампании
                                    </h4>

                                    <p className="
                                        text-[10px]
                                        text-[#9CA3AF]
                                        mt-0.5
                                    ">
                                        AI использовал эти данные
                                    </p>
                                </div>
                            </div>

                            {Object.entries(
                                result.variables || {}
                            ).length > 0 ? (

                                <div className="space-y-3">

                                    {Object.entries(
                                        result.variables || {}
                                    ).map(
                                        ([key, val]) => {

                                            const readableKey =
                                                key
                                                    .replace(/_/g, ' ')
                                                    .replace(
                                                        /\b\w/g,
                                                        l =>
                                                            l.toUpperCase()
                                                    );

                                            return (

                                                <div
                                                    key={key}

                                                    className="
                                                        p-4
                                                        rounded-2xl
                                                        border
                                                        border-[#F3F4F6]
                                                        bg-[#FAFAFA]
                                                    "
                                                >

                                                    <div className="
                                                        text-[10px]
                                                        font-black
                                                        uppercase
                                                        tracking-[0.15em]
                                                        text-[#9CA3AF]
                                                        mb-1
                                                    ">
                                                        {readableKey}
                                                    </div>

                                                    <div className="
                                                        text-[13px]
                                                        font-semibold
                                                        text-[#111827]
                                                        break-words
                                                    ">
                                                        {String(val)}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>

                            ) : (

                                <div className="
                                    p-5
                                    rounded-2xl
                                    bg-[#F9FAFB]
                                    border
                                    border-dashed
                                    border-[#E5E7EB]
                                    text-center
                                ">

                                    <p className="
                                        text-[12px]
                                        font-semibold
                                        text-[#6B7280]
                                    ">
                                        Переменные не использовались
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ACTIONS */}

                        <div className="
                            mt-auto
                            space-y-3
                        ">

                            <Button
                                variant="secondary"
                                size="xl"

                                className="
                                    w-full
                                    bg-[#111827]
                                    text-white
                                    rounded-2xl
                                    h-14
                                "

                                onClick={() =>
                                    handleCopy(
                                        activeChannel.content.body,
                                        activeTab
                                    )
                                }
                            >

                                {copied === activeTab

                                    ? <Check size={20} className="mr-2" />

                                    : <Copy size={20} className="mr-2" />
                                }

                                <span>
                                    {copied === activeTab
                                        ? 'Скопировано'
                                        : 'Копировать контент'
                                    }
                                </span>
                            </Button>

                            <div className="
                                grid
                                grid-cols-2
                                gap-3
                            ">

                                <Button
                                    variant="outline"

                                    className="
                                        rounded-xl
                                        h-12
                                    "

                                    onClick={exportAsTxt}
                                >

                                    <FileText
                                        size={16}
                                        className="mr-2"
                                    />

                                    .TXT
                                </Button>

                                <Button
                                    variant="outline"

                                    className="
                                        rounded-xl
                                        h-12
                                    "
                                >

                                    <Download
                                        size={16}
                                        className="mr-2"
                                    />

                                    .MD
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </GlassCard>

            {/* FOOTER */}

            <div className="
                flex
                items-center
                justify-center
                gap-6
            ">

                <Button
                    variant="outline"
                    size="xl"

                    className="
                        rounded-[2.5rem]
                        px-12
                        gap-3
                        border-[#E5E7EB]
                        h-16
                    "

                    onClick={onRegenerate}
                >

                    <RefreshCw size={24} />

                    Перегенерировать всё
                </Button>

                <Button
                    size="xl"

                    className="
                        rounded-[2.5rem]
                        px-12
                        gap-3
                        h-16
                    "

                    onClick={handleSave}
                >

                    <Save size={24} />

                    Сохранить в Workspace
                </Button>
            </div>
        </div>
    );
}