import { getAvatarFromRegistry, PUBLIC_HEYGEN_FALLBACKS } from '../constants/avatarRegistry';
import { fetchWorkspaceLooks } from './heygenAvatarService';

export interface ResolvedAvatar {
  heygenAvatarId: string;
  heygenLookId?: string;
  origin: 'public' | 'workspace_custom' | 'fallback_reassigned';
  validationMessage: string;
  isFallback: boolean;
}

/**
 * Resolves local human-readable drafts (e.g. sophia-casual) into validated physical HeyGen IDs.
 * First tries to locate custom matching clones in the actual active workspace looks.
 * If not, resolves to beautiful, vetted fallback public identities.
 */
export async function resolveAndValidateAvatar(
  localId: string,
  apiKey?: string,
  onLog?: (logEntry: any) => void
): Promise<ResolvedAvatar> {
  const localAvatar = getAvatarFromRegistry(localId);
  const fallbackGender = localAvatar?.gender || 'female';
  
  // High quality premium live Defaults
  const defaultPublicId = fallbackGender === 'female' ? 'Sophia_casual_20210303' : 'Daniel_casual_20210303';
  const defaultPublicLook = fallbackGender === 'female' ? 'sophia_casual_v2' : 'daniel_casual_v2';
  const displayName = localAvatar?.displayName || 'Sophia';

  let resolvedId = localAvatar?.heygenAvatarId || defaultPublicId;
  let resolvedLookId = localAvatar?.heygenLookId || defaultPublicLook;
  let origin: 'public' | 'workspace_custom' | 'fallback_reassigned' = 'public';
  let isFallback = false;
  let validationMessage = '[AVATAR ROUTING] Успешно сопоставлен публичный аватар HeyGen.';

  if (!apiKey || apiKey.trim().length <= 10) {
    return {
      heygenAvatarId: resolvedId,
      heygenLookId: resolvedLookId,
      origin: 'public',
      validationMessage: '[AVATAR ROUTING] Соединение HeyGen API отсутствует (симуляция). Возвращен публичный аватар.',
      isFallback: false
    };
  }

  try {
    const workspaceLooks = await fetchWorkspaceLooks(apiKey);

    if (workspaceLooks && workspaceLooks.length > 0) {
      // 1. Exact Name/ID Matching in Workspace (e.g. users personal cloning twins)
      const searchTarget = (localAvatar?.displayName || '').toLowerCase();
      
      const exactMatch = workspaceLooks.find(look => {
        const lookName = (look.look_name || look.avatar_name || '').toLowerCase();
        const lookId = (look.look_id || '').toLowerCase();
        return (
          lookName.includes(searchTarget) || 
          lookId.includes(localId.replace('-', '_')) || 
          lookId.includes(localId)
        );
      });

      if (exactMatch) {
        resolvedId = exactMatch.look_id;
        resolvedLookId = exactMatch.look_id; // Set look_id to map 1:1 correctly
        origin = 'workspace_custom';
        validationMessage = `[AVATAR ROUTING] Точное совпадение из воркспейса HeyGen: "${exactMatch.look_name}" (${exactMatch.look_id})`;
        
        if (onLog) {
          onLog({
            type: 'info',
            module: 'AVATAR ROUTING',
            message: validationMessage,
            data: {
              localId,
              matchedLookId: exactMatch.look_id,
              matchedLookName: exactMatch.look_name
            }
          });
        }

        return {
          heygenAvatarId: resolvedId,
          heygenLookId: resolvedLookId,
          origin,
          validationMessage,
          isFallback: false
        };
      }

      // 2. Validate registry fallback existence in workspace:
      // If our originally mapped avatar_id is NOT in the workspace Looks, and they have at least one custom avatar,
      // it is safer to automatically match it to their first custom workspace avatar of the same gender!
      const isOriginalFallbackInWorkspace = workspaceLooks.some(look => 
        look.look_id === resolvedId || look.avatar_id === resolvedId
      );

      if (!isOriginalFallbackInWorkspace) {
        // Find best match of same gender in workspace
        const genderMatched = workspaceLooks.filter(look => (look.gender || '').toLowerCase() === fallbackGender);
        if (genderMatched.length > 0) {
          const categoryTarget = localAvatar?.category || 'casual';
          const categoryMatch = genderMatched.find(look => 
            (look.look_name || look.avatar_name || '').toLowerCase().includes(categoryTarget)
          );

          const bestLook = categoryMatch || genderMatched[0];
          resolvedId = bestLook.look_id;
          resolvedLookId = bestLook.look_id;
          origin = 'fallback_reassigned';
          isFallback = true;
          validationMessage = `[AVATAR ROUTING] Аватар "${displayName}" (${localId}) недоступен в этом ворксейсе. Авто-переключение на: "${bestLook.look_name}" (${bestLook.look_id})`;

          if (onLog) {
            onLog({
              type: 'warning',
              module: 'AVATAR ROUTING',
              message: validationMessage,
              data: {
                requestedLocalId: localId,
                reassignedId: resolvedId,
                reassignedName: bestLook.look_name
              }
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[AVATAR ROUTING] Ошибка при авто-сопоставлении Workspace Looks, используем базовые паблик ID: ', err);
  }

  return {
    heygenAvatarId: resolvedId,
    heygenLookId: resolvedLookId,
    origin,
    validationMessage,
    isFallback
  };
}
