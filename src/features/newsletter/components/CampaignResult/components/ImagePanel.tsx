import React from 'react';
import { cn } from '@/src/lib/utils';
import { Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/src/shared/components/UI';
import { NEWSLETTER_CHANNELS } from '@/src/config/newsletterChannels';

interface ImagePanelProps {
    activeChannel: any;
    imageUrls: Record<string, string>;
    isGeneratingImage: Record<string, boolean>;
    handleGenerateImage: (channelId: string, prompt: string) => Promise<void>;
    handleDownloadImage: (channelId: string) => void;
}

export function ImagePanel({
    activeChannel,
    imageUrls,
    isGeneratingImage,
    handleGenerateImage,
    handleDownloadImage
}: ImagePanelProps) {
    return (
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

            <div className={cn(
                `
                rounded-[2rem]
                bg-white
                border
                border-[#E5E7EB]
                overflow-hidden
                relative
                `,
                NEWSLETTER_CHANNELS[activeChannel.id]?.aspectRatio || 'aspect-square'
            )}>
                {imageUrls[activeChannel.id] ? (
                    <img
                        src={imageUrls[activeChannel.id]}
                        alt="Campaign"
                        loading="lazy"
                        referrerPolicy="no-referrer"
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
                        {isGeneratingImage[activeChannel.id] ? (
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
                                        activeChannel.content?.imagePrompt &&
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
    );
}
