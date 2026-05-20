import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface HeaderProps {
    name: string;
    strategy: string;
}

export function Header({ name, strategy }: HeaderProps) {
    return (
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
                        {name}
                    </h2>

                    <p className="
                        text-white/60
                        text-sm
                        leading-relaxed
                    ">
                        {strategy}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
