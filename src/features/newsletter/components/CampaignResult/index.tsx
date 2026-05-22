import React, { useState, useEffect } from 'react';
import { Mail, Send, MessageCircle, Info } from 'lucide-react';
import { CampaignResult } from '@/src/types/newsletter';
import { GlassCard } from '@/src/shared/components/UI';
import { toast } from 'sonner';
import { useFavoritesStore } from '@/src/stores/favoritesStore';
import { useCampaignImages } from '../../hooks/useCampaignImages';
import { useCampaignExport } from '../../hooks/useCampaignExport';
import { NEWSLETTER_CHANNELS } from '@/src/config/newsletterChannels';

import { Header } from './components/Header';
import { ChannelTabs } from './components/ChannelTabs';
import { ContentBody } from './components/ContentBody';
import { ImagePanel } from './components/ImagePanel';
import { ExportActions } from './components/ExportActions';
import { FooterActions } from './components/FooterActions';

const ICON_COMPONENTS = {
    Mail,
    Send,
    MessageCircle
};

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
    const channels = result.channels || [];

    const [activeTab, setActiveTab] = useState<string>(
        channels[0]?.id || 'email'
    );

    const {
        imageUrls,
        isGeneratingImage,
        handleGenerateImage,
        handleDownloadImage
    } = useCampaignImages(channels);

    const {
        copied,
        handleCopy,
        exportAsTxt,
        exportAsMarkdown
    } = useCampaignExport(result, channels, imageUrls);

    const availableTabs = Object.values(NEWSLETTER_CHANNELS)
        .map((ch) => ({
            id: ch.id,
            label: ch.label,
            icon: ICON_COMPONENTS[ch.iconName]
        }))
        .filter(tab => channels.some(c => c.id === tab.id));

    useEffect(() => {
        if (
            channels.length > 0 &&
            !channels.some(c => c.id === activeTab)
        ) {
            setActiveTab(channels[0].id);
        }
    }, [channels, activeTab]);

    const activeChannel = channels.find(c => c.id === activeTab) || channels[0];

    const addFavorite = useFavoritesStore(state => state.addFavorite);

    const handleSave = () => {
        addFavorite({
            id: `campaign-${Date.now()}`,
            moduleId: 'newsletters',
            type: 'result',
            title: result.name,
            content: result,
            metadata: {
                generatedAt: new Date().toISOString(),
                sourceModule: sourceInfo?.module,
                sourceId: sourceInfo?.id
            }
        });
        toast.success('Кампания сохранена');
    };

    if (!activeChannel || !activeChannel.content) {
        return (
            <div className="p-20 text-center bg-white border border-[#E5E7EB] rounded-[3.5rem] shadow-2xl">
                <div className="w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-6">
                    <Info size={40} />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">
                    Ошибка данных
                </h3>
                <p className="text-[#6B7280]">
                    Кампания повреждена или имеет неверный формат
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            {/* HEADER */}
            <Header name={result.name} strategy={result.strategy} />

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
                <ChannelTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    availableTabs={availableTabs}
                    activeChannel={activeChannel}
                    imageUrls={imageUrls}
                    isGeneratingImage={isGeneratingImage}
                    handleGenerateImage={handleGenerateImage}
                    handleDownloadImage={handleDownloadImage}
                />

                {/* BODY */}
                <div className="
                    flex
                    flex-col
                    lg:flex-row
                    min-h-[600px]
                ">
                    {/* CONTENT */}
                    <ContentBody
                        activeChannel={activeChannel}
                        activeTab={activeTab}
                    />

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
                        <ImagePanel
                            activeChannel={activeChannel}
                            imageUrls={imageUrls}
                            isGeneratingImage={isGeneratingImage}
                            handleGenerateImage={handleGenerateImage}
                            handleDownloadImage={handleDownloadImage}
                        />

                        {/* ACTIONS */}
                        <ExportActions
                            activeChannel={activeChannel}
                            activeTab={activeTab}
                            copied={copied}
                            handleCopy={handleCopy}
                            exportAsTxt={exportAsTxt}
                            exportAsMarkdown={exportAsMarkdown}
                        />
                    </div>
                </div>
            </GlassCard>

            {/* FOOTER */}
            <FooterActions
                onRegenerate={onRegenerate}
                handleSave={handleSave}
            />
        </div>
    );
}
