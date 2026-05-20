import React from 'react';
import { cn } from '@/src/lib/utils';
import { Download, RefreshCw } from 'lucide-react';

interface ChannelTabsProps {
    activeTab: string;
    setActiveTab: (tabId: string) => void;
    availableTabs: Array<{
        id: string;
        icon: React.ComponentType<{ size: number }>;
        label: string;
    }>;
    activeChannel: any;
    imageUrls: Record<string, string>;
    isGeneratingImage: Record<string, boolean>;
    handleGenerateImage: (channelId: string, prompt: string) => Promise<void>;
    handleDownloadImage: (channelId: string) => void;
}

export function ChannelTabs({
    activeTab,
    setActiveTab,
    availableTabs,
    activeChannel,
    imageUrls,
    isGeneratingImage,
    handleGenerateImage,
    handleDownloadImage
}: ChannelTabsProps) {
    return (
        <div className="p-10 pb-0 border-b border-[#F3F4F6]">
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

                <div className="flex items-center gap-2">
                    {imageUrls[activeChannel.id] && (
                        <button
                            onClick={() => handleDownloadImage(activeChannel.id)}
                            className="
                                p-2
                                rounded-lg
                                bg-white
                                border
                                border-[#E5E7EB]
                            "
                        >
                            <Download size={14} />
                        </button>
                    )}

                    <button
                        onClick={() =>
                            activeChannel.content?.imagePrompt &&
                            handleGenerateImage(
                                activeChannel.id,
                                activeChannel.content.imagePrompt
                            )
                        }
                        disabled={isGeneratingImage[activeChannel.id]}
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
                                isGeneratingImage[activeChannel.id] && 'animate-spin'
                            )}
                        />
                    </button>
                </div>
            </div>

            <div className="flex gap-10">
                {availableTabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
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
                            activeTab === tab.id
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
                ))}
            </div>
        </div>
    );
}
