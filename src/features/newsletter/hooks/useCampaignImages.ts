import { useState } from 'react';
import { toast } from 'sonner';
import { generateCampaignImage } from '@/src/services/ai/client';

export function useCampaignImages(channels: any[]) {
    const [imageUrls, setImageUrls] = useState<Record<string, string>>(() => {
        const initialImages: Record<string, string> = {};
        channels.forEach((channel) => {
            if (channel.content?.imageUrl) {
                initialImages[channel.id] = channel.content.imageUrl;
            }
        });
        return initialImages;
    });

    const [isGeneratingImage, setIsGeneratingImage] = useState<Record<string, boolean>>(
        {}
    );

    const handleGenerateImage = async (channelId: string, prompt: string) => {
        if (isGeneratingImage[channelId]) {
            return;
        }

        setIsGeneratingImage(prev => ({
            ...prev,
            [channelId]: true
        }));

        try {
            const url = await generateCampaignImage(prompt, channelId);

            if (url) {
                setImageUrls(prev => ({
                    ...prev,
                    [channelId]: url
                }));
                toast.success('Визуал создан');
            }
        } catch (err) {
            console.error(err);
            toast.error('Не удалось создать изображение');
        } finally {
            setIsGeneratingImage(prev => ({
                ...prev,
                [channelId]: false
            }));
        }
    };

    const handleDownloadImage = (channelId: string) => {
        const url = imageUrls[channelId];
        if (!url) {
            return;
        }
        const link = document.createElement('a');
        link.href = url;
        link.download = `${channelId}-visual.png`;
        link.click();
    };

    return {
        imageUrls,
        isGeneratingImage,
        handleGenerateImage,
        handleDownloadImage
    };
}
