import React from 'react';
import { Button } from '@/src/shared/components/UI';
import { Check, Copy, FileText, Download } from 'lucide-react';

interface ExportActionsProps {
    activeChannel: any;
    activeTab: string;
    copied: string | null;
    handleCopy: (content: string, type: string) => void;
    exportAsTxt: () => void;
    exportAsMarkdown: (channelId: string, body: string) => void;
}

export function ExportActions({
    activeChannel,
    activeTab,
    copied,
    handleCopy,
    exportAsTxt,
    exportAsMarkdown
}: ExportActionsProps) {
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
                    onClick={() => exportAsMarkdown(activeChannel.id, activeChannel.content?.body || '')}
                >
                    <Download size={16} className="mr-2" />
                    .MD
                </Button>
            </div>
        </div>
    );
}
