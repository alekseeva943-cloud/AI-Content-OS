import { useState } from 'react';
import { toast } from 'sonner';
import JSZip from 'jszip';

export function useCampaignExport(result: any, channels: any[], imageUrls: Record<string, string> = {}) {
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = (content: string, type: string) => {
        navigator.clipboard.writeText(content);
        setCopied(type);
        toast.success('Контент скопирован');
        setTimeout(() => setCopied(null), 2000);
    };

    const exportAsTxt = () => {
        const text =
            `КАМПАНИЯ: ${result?.name || 'Без названия'}\n\n` +
            channels.map(
                c => `--- ${(c?.id || 'Unknown').toUpperCase()} ---\n${c?.content?.body || ''}\n`
            ).join('\n');

        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${result?.name || 'campaign'}.txt`;
        a.click();
    };

    const exportAsMarkdown = async (channelId: string, body: string) => {
        const zip = new JSZip();

        // 1. content.md
        zip.file("content.md", body);

        // 1.5. content.txt
        zip.file("content.txt", body);

        // 2. metadata.json
        const metadata = {
            channel: channelId,
            createdAt: new Date().toISOString(),
            campaignTitle: result?.name || 'Без названия'
        };
        zip.file("metadata.json", JSON.stringify(metadata, null, 2));

        // 3. image.png
        const imageUrl = imageUrls[channelId];
        if (imageUrl) {
            try {
                const response = await fetch(imageUrl);
                if (response.ok) {
                    const blob = await response.blob();
                    zip.file("image.png", blob);
                }
            } catch (err) {
                console.warn("Failed to fetch image for ZIP bundle:", err);
            }
        }

        try {
            const zipContent = await zip.generateAsync({ type: "blob" });
            const url = URL.createObjectURL(zipContent);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${result?.name || 'campaign'}-${channelId}.zip`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('ZIP-пакет успешно скачан');
        } catch (error) {
            console.error("ZIP generation error:", error);
            toast.error('Не удалось создать ZIP-пакет');
        }
    };

    return {
        copied,
        handleCopy,
        exportAsTxt,
        exportAsMarkdown
    };
}
