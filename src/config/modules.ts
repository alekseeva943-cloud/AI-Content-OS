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
    title: 'Планировщик контента',
    icon: LayoutGrid,
    moduleName: 'planner',
    description: 'Разработка стратегии и графика выпуска контента на неделю или месяц.',
    actionLabel: 'Спланировать',
    fields: [
      {
        id: 'goal',
        label: 'Цель кампании',
        placeholder: 'Например: Запуск нового продукта',
        type: 'text',
      },
      {
        id: 'narrative',
        label: 'Основной нарратив',
        placeholder: 'Опишите главную мысль или историю...',
        type: 'textarea',
      },
      {
        id: 'timeline',
        label: 'Срок планирования',
        type: 'select',
        options: [
          { value: '30days', label: 'Ближайшие 30 дней' },
          { value: 'quarter', label: 'Квартал' },
        ],
        defaultValue: '30days',
      },
      {
        id: 'focus',
        label: 'Каналы',
        type: 'select',
        options: [
          { value: 'social', label: 'Соцсети (TG, VK)' },
          { value: 'all', label: 'Все платформы' },
        ],
        defaultValue: 'social',
      },
    ],
  },
  newsletters: {
    id: 'newsletters',
    title: 'Почтовые рассылки',
    icon: Mail,
    moduleName: 'newsletter',
    description: 'Создание прогревающих последовательностей и продающих писем.',
    actionLabel: 'Сгенерировать письмо',
    fields: [
      {
        id: 'subject',
        label: 'Тема письма (черновик)',
        placeholder: 'О чем будет письмо?',
        type: 'text',
      },
      {
        id: 'insights',
        label: 'Ключевые тезисы',
        placeholder: 'Перечислите основные идеи, которые нужно раскрыть...',
        type: 'textarea',
      },
    ],
  },
  podcasts: {
    id: 'podcasts',
    title: 'Сценарии подкастов',
    icon: Mic2,
    moduleName: 'podcast',
    description: 'Генерация структуры эпизода, вопросов для гостя и кратких выжимок.',
    actionLabel: 'Создать сценарий',
    fields: [
      {
        id: 'guest',
        label: 'Информация о госте',
        placeholder: 'Имя, экспертиза или ссылка на био...',
        type: 'text',
      },
      {
        id: 'theme',
        label: 'Тема эпизода',
        type: 'select',
        options: [
          { value: 'deep', label: 'Глубокое погружение' },
          { value: 'story', label: 'История успеха' },
          { value: 'mastermind', label: 'Мастермайнд' },
        ],
        defaultValue: 'deep',
      },
    ],
  },
  avatars: {
    id: 'avatars',
    title: 'Видео-аватары',
    icon: Video,
    moduleName: 'avatar',
    description: 'Подготовка скриптов для HeyGen с учетом эмоциональных оттенков.',
    actionLabel: 'Подготовить скрипт',
    fields: [
      {
        id: 'style',
        label: 'Тип аватара',
        type: 'select',
        options: [
          { value: 'business', label: 'Бизнес-стиль' },
          { value: 'casual', label: 'Повседневный' },
        ],
        defaultValue: 'business',
      },
      {
        id: 'script',
        label: 'Текст выступления',
        placeholder: 'Основное сообщение, которое должен озвучить аватар...',
        type: 'textarea',
      },
    ],
  },
  longreads: {
    id: 'longreads',
    title: 'Глубокие лонгриды',
    icon: FileText,
    moduleName: 'longread',
    description: 'Создание экспертных статей и белых книг на основе сырых данных.',
    actionLabel: 'Написать статью',
    fields: [
      {
        id: 'title',
        label: 'Заголовок документа',
        placeholder: 'Аналитический отчет: Рынок AI в 2024...',
        type: 'text',
      },
      {
        id: 'style',
        label: 'Архитектурный стиль',
        type: 'select',
        options: [
          { value: 'scientific', label: 'Научный журнал' },
          { value: 'editorial', label: 'Редакционный (Wired)' },
          { value: 'whitepaper', label: 'Бизнес-отчет' },
        ],
        defaultValue: 'editorial',
      },
      {
        id: 'layers',
        label: 'Тематические слои',
        placeholder: 'Добавьте специфические темы или данные для интеграции...',
        type: 'textarea',
      },
    ],
  },
};
