import { LayoutGrid, Mail, Mic2, Video, FileText } from 'lucide-react';

export type FieldType = 'text' | 'textarea' | 'select' | 'toggle' | 'date';

export interface ModuleField {
  id: string;
  label: string;
  description?: string;
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
        id: 'topic',
        label: 'О чём хотите писать?',
        description: 'Например: запуск нового курса по английскому',
        placeholder: 'Опишите главную тему...',
        type: 'text',
      },
      {
        id: 'context',
        label: 'Что хотите донести?',
        description: 'Например: помочь людям начать инвестировать без страха',
        placeholder: 'Опишите главную мысль, которую должен считать зритель...',
        type: 'textarea',
      },
      {
        id: 'startDate',
        label: 'Дата старта публикаций',
        description: 'Когда начнем выкладывать контент?',
        type: 'date',
        defaultValue: new Date().toISOString().split('T')[0],
      },
      {
        id: 'period',
        label: 'На какой срок?',
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
        label: 'Какой стиль нужен?',
        type: 'select',
        options: [
          { value: 'friendly', label: 'Дружелюбный' },
          { value: 'expert', label: 'Экспертный' },
          { value: 'minimal', label: 'Минимализм' },
        ],
        defaultValue: 'friendly',
      },
      {
        id: 'channels',
        label: 'Где публиковать?',
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
        label: 'О чём будет письмо?',
        description: 'Например: запуск нового продукта или итоги месяца',
        placeholder: 'Введите тему...',
        type: 'text',
      },
      {
        id: 'insights',
        label: 'Основные идеи',
        description: 'О чем обязательно нужно упомянуть?',
        placeholder: 'Перечислите основные моменты...',
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
        label: 'Кто Ваш гость?',
        description: 'Имя, экспертиза или уникальный бэкграунд',
        placeholder: 'Например: Иван Иванов, серийный предприниматель',
        type: 'text',
      },
      {
        id: 'theme',
        label: 'Стиль выпуска',
        description: 'Какой формат беседы выберем?',
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
        label: 'Голос и стиль',
        description: 'Как должен звучать Ваш аватар?',
        type: 'select',
        options: [
          { value: 'business', label: 'Экспертный' },
          { value: 'casual', label: 'Дружелюбный' },
        ],
        defaultValue: 'business',
      },
      {
        id: 'script',
        label: 'Текст для аватара',
        description: 'О чем он должен рассказать сегодня?',
        placeholder: 'Основное сообщение...',
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
        label: 'Тема статьи',
        description: 'Например: Рынок AI в 2024 году',
        placeholder: 'Введите заголовок...',
        type: 'text',
      },
      {
        id: 'style',
        label: 'Формат подачи',
        description: 'Выберите тон повествования',
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
        label: 'Что добавить?',
        description: 'Данные исследований, специфика отрасли или Ваши мысли',
        placeholder: 'Введите дополнительный контекст...',
        type: 'textarea',
      },
    ],
  },
};
