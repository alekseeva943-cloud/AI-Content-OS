import { useState } from 'react';
import { toast } from 'sonner';

export function useCampaignExport(result: any, channels: any[]) {
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

    const exportAsMarkdown = (channelId: string, body: string) => {
        const blob = new Blob([body], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${channelId}-campaign.md`;
        a.click();
    };

    return {
        copied,
        handleCopy,
        exportAsTxt,
        exportAsMarkdown
    };
}
