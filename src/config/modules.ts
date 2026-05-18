import { LayoutGrid, Mail, Mic2, Video, FileText } from 'lucide-react';

export type FieldType = 'text' | 'textarea' | 'select' | 'toggle';

export interface ModuleField {
  id: string;
  label: string;
  placeholder?: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  defaultValue?: any;
}

export interface ModuleConfig {
  id: string;
  title: string;
  icon: any;
  description: string;
  moduleName: string;
  fields: ModuleField[];
  actionLabel: string;
}

export const MODULE_CONFIGS: Record<string, ModuleConfig> = {
  planner: {
    id: 'planner',
    title: 'Планировщик',
    icon: LayoutGrid,
    moduleName: 'planner',
    description: 'Разработка стратегии и графика выпуска контента с учетом контекста.',
    actionLabel: 'Сформировать план',
    fields: [
      {
        id: 'goal',
        label: 'Вектор кампании',
        placeholder: 'Например: Запуск нового продукта или прогрев аудитории',
        type: 'text',
      },
      {
        id: 'context',
        label: 'Смысловой фундамент',
        placeholder: 'Опишите главную мысль, которую должен считать зритель...',
        type: 'textarea',
      },
      {
        id: 'period',
        label: 'Период планирования',
        type: 'select',
        options: [
          { value: '3days', label: '3 дня' },
          { value: '7days', label: 'Неделя' },
          { value: '30days', label: 'Месяц' },
        ],
        defaultValue: '7days',
      },
      {
        id: 'tone',
        label: 'Тональность',
        type: 'select',
        options: [
          { value: 'friendly', label: 'Дружелюбная' },
          { value: 'expert', label: 'Экспертная' },
          { value: 'minimal', label: 'Минимализм' },
        ],
        defaultValue: 'friendly',
      },
      {
        id: 'channels',
        label: 'Каналы вещания',
        type: 'select',
        options: [
          { value: 'telegram', label: 'Telegram' },
          { value: 'vk', label: 'VK' },
          { value: 'email', label: 'Email' },
        ],
        defaultValue: ['telegram'],
      },
    ],
  },
  newsletters: {
    id: 'newsletters',
    title: 'Почтовые рассылки',
    icon: Mail,
    moduleName: 'newsletter',
    description: 'Создание прогревающих цепочек и писем-событий.',
    actionLabel: 'Сформировать письмо',
    fields: [
      {
        id: 'subject',
        label: 'Смысловой импульс',
        placeholder: 'О чем будет письмо?',
        type: 'text',
      },
      {
        id: 'insights',
        label: 'Тезисный ряд',
        placeholder: 'Перечислите основные идеи, которые нужно раскрыть...',
        type: 'textarea',
      },
    ],
  },
  podcasts: {
    id: 'podcasts',
    title: 'Сценарии',
    icon: Mic2,
    moduleName: 'podcast',
    description: 'Синтез структуры эпизода, вопросов и ключевых смыслов.',
    actionLabel: 'Создать сценарий',
    fields: [
      {
        id: 'guest',
        label: 'Контекст гостя',
        placeholder: 'Имя, экспертиза или уникальный опыт...',
        type: 'text',
      },
      {
        id: 'theme',
        label: 'ДНК эпизода',
        type: 'select',
        options: [
          { value: 'deep', label: 'Погружение' },
          { value: 'story', label: 'История' },
          { value: 'mastermind', label: 'Практика' },
        ],
        defaultValue: 'deep',
      },
    ],
  },
  avatars: {
    id: 'avatars',
    title: 'AI Ведущие',
    icon: Video,
    moduleName: 'avatar',
    description: 'Подготовка скриптов для AI-ведущих с учетом интонаций.',
    actionLabel: 'Сформировать скрипт',
    fields: [
      {
        id: 'style',
        label: 'Ролевая модель',
        type: 'select',
        options: [
          { value: 'business', label: 'Эксперт' },
          { value: 'casual', label: 'Ментор' },
        ],
        defaultValue: 'business',
      },
      {
        id: 'script',
        label: 'Смысловое ядро',
        placeholder: 'Основное сообщение, которое должен транслировать аватар...',
        type: 'textarea',
      },
    ],
  },
  longreads: {
    id: 'longreads',
    title: 'Статьи',
    icon: FileText,
    moduleName: 'longread',
    description: 'Создание экспертных статей и белых книг на основе сырых данных.',
    actionLabel: 'Сформировать структуру',
    fields: [
      {
        id: 'title',
        label: 'Архитектура лонгрида',
        placeholder: 'Аналитический отчет: Рынок AI в 2024...',
        type: 'text',
      },
      {
        id: 'style',
        label: 'Формат',
        type: 'select',
        options: [
          { value: 'scientific', label: 'Научный' },
          { value: 'editorial', label: 'Авторский' },
          { value: 'whitepaper', label: 'Бизнес' },
        ],
        defaultValue: 'editorial',
      },
      {
        id: 'layers',
        label: 'Фактологические слои',
        placeholder: 'Добавьте специфические темы, данные или исследования...',
        type: 'textarea',
      },
    ],
  },
};
