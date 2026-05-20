export interface ChannelConfig {
    id: string;
    label: string;
    aspectRatio: string;
    imageSize: string;
    iconName: 'Mail' | 'Send' | 'MessageCircle';
}

export const NEWSLETTER_CHANNELS: Record<string, ChannelConfig> = {
    email: {
        id: 'email',
        label: 'Email',
        aspectRatio: 'aspect-[16/9]',
        imageSize: '1024x1024',
        iconName: 'Mail'
    },
    telegram: {
        id: 'telegram',
        label: 'Telegram',
        aspectRatio: 'aspect-[9/16]',
        imageSize: '1024x1024',
        iconName: 'Send'
    },
    vk: {
        id: 'vk',
        label: 'VK',
        aspectRatio: 'aspect-square',
        imageSize: '1024x1024',
        iconName: 'MessageCircle'
    }
};
