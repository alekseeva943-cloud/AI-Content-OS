import React from 'react';
import ReactMarkdown from 'react-markdown';

interface ContentBodyProps {
    activeChannel: any;
    activeTab: string;
}

export function ContentBody({ activeChannel, activeTab }: ContentBodyProps) {
    const normalizeContentBody = (body: string) => {
        if (!body) {
            return '';
        }

        return body
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n\n')
            .replace(/<p>/gi, '')
            .replace(/<[^>]*>/g, '')
            .trim();
    };

    const activeChannelBody = normalizeContentBody(
        activeChannel.content?.body || ''
    );

    return (
        <div className="
            flex-1
            p-10
            lg:p-16
            border-r
            border-[#F3F4F6]
        ">
            <div className="
                max-w-[700px]
                mx-auto
                space-y-10
            ">
                {activeTab === 'email' && (
                    <div className="
                        p-8
                        rounded-[2rem]
                        bg-[#F9FAFB]
                        border
                        border-[#E5E7EB]
                        space-y-4
                    ">
                        <div className="
                            flex
                            items-center
                            gap-6
                            text-[13px]
                        ">
                            <span className="
                                w-20
                                font-bold
                                text-[#9CA3AF]
                                uppercase
                            ">
                                Тема:
                            </span>
                            <span className="
                                font-bold
                                text-[#111827]
                            ">
                                {activeChannel.content?.subject}
                            </span>
                        </div>

                        <div className="
                            flex
                            items-center
                            gap-6
                            text-[13px]
                        ">
                            <span className="
                                w-20
                                font-bold
                                text-[#9CA3AF]
                                uppercase
                            ">
                                Превью:
                            </span>
                            <span className="
                                font-medium
                                text-[#6B7280]
                                italic
                            ">
                                {activeChannel.content?.preheader}
                            </span>
                        </div>
                    </div>
                )}

                <div className="
                    prose
                    prose-slate
                    prose-lg
                    max-w-none
                ">
                    <ReactMarkdown>
                        {activeChannelBody}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    );
}
