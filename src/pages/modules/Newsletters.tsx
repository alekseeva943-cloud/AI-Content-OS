import { MODULE_CONFIGS } from '@/src/config/modules';
import { ModulePage } from '@/src/shared/components/ModulePage';

export function Newsletters() {
  return <ModulePage config={MODULE_CONFIGS.newsletters} />;
}
