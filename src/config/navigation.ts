import { 
  LayoutGrid, 
  Mail, 
  Mic2, 
  Video, 
  FileText, 
  Settings2 
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: any;
  component: string;
}

export const NAVIGATION_CONFIG: NavItem[] = [
  {
    id: 'planner',
    label: 'Планировщик',
    path: '/planner',
    icon: LayoutGrid,
    component: 'content-planner',
  },
  {
    id: 'newsletters',
    label: 'Рассылки',
    path: '/newsletters',
    icon: Mail,
    component: 'newsletters',
  },
  {
    id: 'podcasts',
    label: 'Подкасты',
    path: '/podcasts',
    icon: Mic2,
    component: 'podcasts',
  },
  {
    id: 'avatars',
    label: 'AI-Аватары',
    path: '/avatars',
    icon: Video,
    component: 'avatars',
  },
  {
    id: 'longreads',
    label: 'Лонгриды',
    path: '/longreads',
    icon: FileText,
    component: 'longreads',
  },
];

export const FOOTER_NAVIGATION: NavItem[] = [
  {
    id: 'settings',
    label: 'Настройки',
    path: '/settings',
    icon: Settings2,
    component: 'settings',
  },
];
