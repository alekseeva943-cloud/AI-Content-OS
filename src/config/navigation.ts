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
  component: string; // The module id it belongs to
}

export const NAVIGATION_CONFIG: NavItem[] = [
  {
    id: 'planner',
    label: 'Content Planner',
    path: '/planner',
    icon: LayoutGrid,
    component: 'content-planner',
  },
  {
    id: 'newsletters',
    label: 'Newsletters',
    path: '/newsletters',
    icon: Mail,
    component: 'newsletters',
  },
  {
    id: 'podcasts',
    label: 'Podcasts',
    path: '/podcasts',
    icon: Mic2,
    component: 'podcasts',
  },
  {
    id: 'avatars',
    label: 'Video Avatar',
    path: '/avatars',
    icon: Video,
    component: 'avatars',
  },
  {
    id: 'longreads',
    label: 'Longreads',
    path: '/longreads',
    icon: FileText,
    component: 'longreads',
  },
];

export const FOOTER_NAVIGATION: NavItem[] = [
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings2,
    component: 'settings',
  },
];
