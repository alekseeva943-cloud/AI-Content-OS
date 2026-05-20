import React from 'react';
import { Button } from '@/src/shared/components/UI';
import { RefreshCw, Save } from 'lucide-react';

interface FooterActionsProps {
    onRegenerate?: () => void;
    handleSave: () => void;
}

export function FooterActions({ onRegenerate, handleSave }: FooterActionsProps) {
    return (
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
    );
}
