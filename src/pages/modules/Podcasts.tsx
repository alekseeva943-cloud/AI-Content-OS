import { MODULE_CONFIGS } from '@/src/config/modules';
import { ModulePage } from '@/src/shared/components/ModulePage';

export function Podcasts() {
  return <ModulePage config={MODULE_CONFIGS.podcasts} />;
}
