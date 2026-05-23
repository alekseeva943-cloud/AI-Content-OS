import { Avatar } from '../types/avatar.types';

export const DEFAULT_AVATARS: Avatar[] = [
  {
    id: 'charles-business-hq',
    name: 'Charles',
    gender: 'male',
    category: 'business',
    language: 'Russian (RU) & English (US)',
    energyLevel: 8,
    speakingStyle: 'Confident, direct, expert presenter',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300&h=300',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-businessman-talking-to-camera-at-office-41849-large.mp4',
    description: 'Ведущий в деловом костюме. Подходит для финансовых отчетов, презентаций продуктов и корпоративных новостей.',
    avatarStyle: 'normal'
  },
  {
    id: 'sophia-casual-hq',
    name: 'Sophia',
    gender: 'female',
    category: 'casual',
    language: 'Russian (RU) & English (US)',
    energyLevel: 9,
    speakingStyle: 'Sunny, conversational, friendly',
    thumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-glasses-talking-to-camera-41851-large.mp4',
    description: 'Обаятельный блогер в очках и повседневной одежде. Идеально для блогов, лайфстайл контента и общения с подписчиками.',
    avatarStyle: 'close-up'
  },
  {
    id: 'elena-corporate-hq',
    name: 'Elena',
    gender: 'female',
    category: 'business',
    language: 'Russian (RU) & German (DE)',
    energyLevel: 7,
    speakingStyle: 'Professional, calm, structured, articulate',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-at-office-and-talking-41850-large.mp4',
    description: 'Бизнес-леди, эксперт по коммуникациям. Прекрасный выбор для обучающих курсов, гайдов и стратегических докладов.',
    avatarStyle: 'normal'
  },
  {
    id: 'marcus-tech-hq',
    name: 'Marcus',
    gender: 'male',
    category: 'educational',
    language: 'Russian (RU) & English (US)',
    energyLevel: 8,
    speakingStyle: 'Analytical, academic, informative',
    thumbnail: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300&h=300',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-man-holding-a-smartphone-and-talking-41857-large.mp4',
    description: 'Технический специалист в рубашке. Оптимален для ИТ-обзоров, разбора документации, кода и научных объяснений.',
    avatarStyle: 'normal'
  },
  {
    id: 'diana-creative-hq',
    name: 'Diana',
    gender: 'female',
    category: 'creative',
    language: 'Russian (RU) & French (FR)',
    energyLevel: 10,
    speakingStyle: 'Bright, highly expressive, enthusiastic',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300&h=300',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-excited-woman-talking-to-camera-41852-large.mp4',
    description: 'Креативный продюсер, яркая харизма. Прекрасно подходит для развлекательных шоу, анонсов мероприятий и фестивалей контента.',
    avatarStyle: 'close-up'
  },
  {
    id: 'alex-creative-hq',
    name: 'Alex',
    gender: 'male',
    category: 'creative',
    language: 'Russian (RU) & Spanish (ES)',
    energyLevel: 9,
    speakingStyle: 'Dynamic, modern storytelling cadence',
    thumbnail: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300&h=300',
    previewVideo: 'https://assets.mixkit.co/videos/preview/mixkit-young-creative-man-talking-to-camera-41853-large.mp4',
    description: 'Стильный дизайнер, медийный стартап-хост. Подойдет для презентаций арт-проектов, разборов трендов и молодежных новостей.',
    avatarStyle: 'close-up'
  }
];

export const CATEGORY_LABELS: Record<string, string> = {
  business: 'Бизнес / Костюм',
  casual: 'Повседневный',
  educational: 'Образование',
  creative: 'Креативный'
};

export const GENDER_LABELS: Record<string, string> = {
  male: 'Мужской',
  female: 'Женский'
};
