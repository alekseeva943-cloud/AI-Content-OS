import React from 'react';
import { Button } from '@/src/shared/components/UI';
import { Check, Copy, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportActionsProps {
    activeChannel: any;
    activeTab: string;
    copied: string | null;
    setCopied: (copied: string | null) => void;
    exportAsTxt: () => void;
}

export function ExportActions({
    activeChannel,
    activeTab,
    copied,
    setCopied,
    exportAsTxt
}: ExportActionsProps) {
    const handleCopy = (content: string, type: string) => {
        navigator.clipboard.writeText(content);
        setCopied(type);
        toast.success('Контент скопирован');
        setTimeout(() => setCopied(null), 2000);
    };

    const exportAsMd = () => {
        const text = activeChannel.content?.body || '';
        const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeChannel.id}-campaign.md`;
        a.click();
    };

    return (
        <div className="mt-auto space-y-3">
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
                onClick={() => handleCopy(activeChannel.content?.body || '', activeTab)}
            >
                {copied === activeTab ? (
                    <Check size={20} className="mr-2" />
                ) : (
                    <Copy size={20} className="mr-2" />
                )}
                <span>
                    {copied === activeTab ? 'Скопировано' : 'Копировать контент'}
                </span>
            </Button>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    className="
                        rounded-xl
                        h-12
                    "
                    onClick={exportAsTxt}
                >
                    <FileText size={16} className="mr-2" />
                    .TXT
                </Button>

                <Button
                    variant="outline"
                    className="
                        rounded-xl
                        h-12
                    "
                    onClick={exportAsMd}
                >
                    <Download size={16} className="mr-2" />
                    .MD
                </Button>
            </div>
        </div>
    );
}
