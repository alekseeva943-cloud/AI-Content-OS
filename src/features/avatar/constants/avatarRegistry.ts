import { DEFAULT_AVATARS } from './avatar.constants';
import { Avatar } from '../types/avatar.types';

export interface RegistryAvatar {
  localId: string;
  displayName: string;
  heygenAvatarId: string; // The physical HeyGen avatar/look ID
  heygenLookId?: string;  // Detailed look ID when applicable
  gender: 'male' | 'female';
  style: 'normal' | 'close-up';
  category: 'business' | 'casual' | 'educational' | 'creative';
  previewImage: string;
  supportedVoices: string[];
  supportedDurations: number[];
  age?: number;
  clothingStyle?: string;
  roleType?: string;
  origin?: 'public' | 'workspace_custom' | 'fallback_reassigned';
}

// Map of standard public HeyGen avatar IDs for local fallbacks
// Sophia, Elena, Charles, Daniel etc., are well-known high quality public IDs in HeyGen
const PUBLIC_HEYGEN_FALLBACKS: Record<string, { heygenAvatarId: string; heygenLookId?: string }> = {
  // FEMALE - CASUAL
  'sophia-casual': { heygenAvatarId: 'Sophia_casual_20210303', heygenLookId: 'sophia_casual_v2' },
  'anna-lifestyle': { heygenAvatarId: 'Daisy_casual_20210303', heygenLookId: 'daisy_casual_v2' },
  'irina-casual': { heygenAvatarId: 'Jennie_casual_20210303', heygenLookId: 'jennie_casual_v2' },
  'polina-lifestyle': { heygenAvatarId: 'Sophia_casual_20210303', heygenLookId: 'sophia_casual_v2' },
  
  // FEMALE - BUSINESS
  'elena-corporate': { heygenAvatarId: 'Elena_business_20210303', heygenLookId: 'elena_business_v2' },
  'ekaterina-news': { heygenAvatarId: 'Elena_business_20210303', heygenLookId: 'elena_business_v2' },
  'maria-consult': { heygenAvatarId: 'Elena_business_20210303', heygenLookId: 'elena_business_v2' },
  'olga-expert': { heygenAvatarId: 'Elena_business_20210303', heygenLookId: 'elena_business_v2' },
  'svetlana-executive': { heygenAvatarId: 'Elena_business_20210303', heygenLookId: 'elena_business_v2' },
  
  // FEMALE - CREATIVE
  'diana-creative': { heygenAvatarId: 'Daisy_casual_20210303', heygenLookId: 'daisy_casual_v2' },
  'victoria-coach': { heygenAvatarId: 'Daisy_casual_20210303', heygenLookId: 'daisy_casual_v2' },
  'julia-podcast': { heygenAvatarId: 'Sophia_casual_20210303', heygenLookId: 'sophia_casual_v2' },
  'anastasia-host': { heygenAvatarId: 'Daisy_casual_20210303', heygenLookId: 'daisy_casual_v2' },
  'margarita-psychology': { heygenAvatarId: 'Sophia_casual_20210303', heygenLookId: 'sophia_casual_v2' },
  'elizabeth-podcast-creative': { heygenAvatarId: 'Daisy_casual_20210303', heygenLookId: 'daisy_casual_v2' },

  // FEMALE - EDUCATIONAL
  'natalia-teacher': { heygenAvatarId: 'Kristin_casual_20210303', heygenLookId: 'kristin_casual_v2' },
  'daria-academy': { heygenAvatarId: 'Kristin_casual_20210303', heygenLookId: 'kristin_casual_v2' },
  'kristina-doc': { heygenAvatarId: 'Kristin_casual_20210303', heygenLookId: 'kristin_casual_v2' },
  'alina-tech-expert': { heygenAvatarId: 'Kristin_casual_20210303', heygenLookId: 'kristin_casual_v2' },
  'veronika-art': { heygenAvatarId: 'Kristin_casual_20210303', heygenLookId: 'kristin_casual_v2' },

  // MALE - BUSINESS
  'charles-business': { heygenAvatarId: 'Charles_business_20210303', heygenLookId: 'charles_business_v2' },
  'mikhail-expert': { heygenAvatarId: 'Charles_business_20210303', heygenLookId: 'charles_business_v2' },
  'maxim-sales': { heygenAvatarId: 'Charles_business_20210303', heygenLookId: 'charles_business_v2' },
  'ivan-lawyer': { heygenAvatarId: 'Charles_business_20210303', heygenLookId: 'charles_business_v2' },
  'vladislav-ceo': { heygenAvatarId: 'Charles_business_20210303', heygenLookId: 'charles_business_v2' },
  'artem-speaker': { heygenAvatarId: 'Charles_business_20210303', heygenLookId: 'charles_business_v2' },

  // MALE - CASUAL
  'alexander-street': { heygenAvatarId: 'Edward_casual_20210303', heygenLookId: 'edward_casual_v2' },
  'sergey-sport': { heygenAvatarId: 'Edward_casual_20210303', heygenLookId: 'edward_casual_v2' },
  'denis-young': { heygenAvatarId: 'Edward_casual_20210303', heygenLookId: 'edward_casual_v2' },
  'danila-crypto': { heygenAvatarId: 'Edward_casual_20210303', heygenLookId: 'edward_casual_v2' },

  // MALE - CREATIVE
  'alex-creative': { heygenAvatarId: 'Tyler_casual_20210303', heygenLookId: 'tyler_casual_v2' },
  'andrey-podcast': { heygenAvatarId: 'Tyler_casual_20210303', heygenLookId: 'tyler_casual_v2' },
  'roman-opinion': { heygenAvatarId: 'Tyler_casual_20210303', heygenLookId: 'tyler_casual_v2' },
  'konstantin-hr': { heygenAvatarId: 'Tyler_casual_20210303', heygenLookId: 'tyler_casual_v2' },
  'ilya-media': { heygenAvatarId: 'Tyler_casual_20210303', heygenLookId: 'tyler_casual_v2' },

  // MALE - EDUCATIONAL
  'marcus-tech': { heygenAvatarId: 'Daniel_casual_20210303', heygenLookId: 'daniel_casual_v2' },
  'dmitry-prof': { heygenAvatarId: 'Daniel_casual_20210303', heygenLookId: 'daniel_casual_v2' },
  'pavel-lecture': { heygenAvatarId: 'Daniel_casual_20210303', heygenLookId: 'daniel_casual_v2' },
  'arthur-tutor': { heygenAvatarId: 'Daniel_casual_20210303', heygenLookId: 'daniel_casual_v2' },
  'nikita-data': { heygenAvatarId: 'Daniel_casual_20210303', heygenLookId: 'daniel_casual_v2' },
};

// Global memory cache of workspace looks detected in the current session
interface WorkspaceLookCache {
  lastChecked: number;
  looks: Array<{
    look_id: string;
    look_name: string;
    avatar_id: string;
    avatar_name: string;
    gender?: string;
  }>;
}

let workspaceLookCache: WorkspaceLookCache | null = null;

// Construct full list of RegistryAvatars programmatically to ensure perfect coverage of all 40 DEFAULT_AVATARS
export const AVATAR_REGISTRY: RegistryAvatar[] = DEFAULT_AVATARS.map((av: Avatar) => {
  const matches = PUBLIC_HEYGEN_FALLBACKS[av.id] || {
    heygenAvatarId: av.gender === 'female' ? 'Sophia_casual_20210303' : 'Daniel_casual_20210303',
    heygenLookId: av.gender === 'female' ? 'sophia_casual_v2' : 'daniel_casual_v2'
  };

  return {
    localId: av.id,
    displayName: av.name,
    heygenAvatarId: matches.heygenAvatarId,
    heygenLookId: matches.heygenLookId,
    gender: av.gender,
    style: av.avatarStyle === 'close-up' ? 'close-up' : 'normal',
    category: av.category,
    previewImage: av.thumbnail,
    supportedVoices: av.gender === 'female' 
      ? ['EXAVITQu4vr4xnSDXMaL', 'ErXwobaYiN019PkySvjV', 'LcfcDJNPlY75OxArInZp'] 
      : ['pqH6THCHvgSzSg3749S8', 'IKne3meq5aC27shg036e', 'g5CIjv2V06O0Bdf0xW6K'],
    supportedDurations: [10, 15, 30, 60, 300],
    age: av.age,
    clothingStyle: av.clothingStyle,
    roleType: av.roleType,
    origin: 'public'
  };
});

/**
 * Gets an avatar from the local ID registry.
 */
export function getAvatarFromRegistry(localId: string): RegistryAvatar | undefined {
  return AVATAR_REGISTRY.find(av => av.localId === localId);
}

/**
 * Queries HeyGen API for all available avatar looks to optimize workspace mapping.
 * Uses cache or fetches live.
 */
export async function fetchWorkspaceLooks(apiKey?: string, forceRefresh = false): Promise<WorkspaceLookCache['looks']> {
  if (!apiKey || apiKey.trim().length <= 10) {
    return [];
  }

  const now = Date.now();
  // Return cached version if still within 5 min (300_000 ms) and not forced
  if (workspaceLookCache && !forceRefresh && (now - workspaceLookCache.lastChecked < 300000)) {
    return workspaceLookCache.looks;
  }

  try {
    console.log('[Avatar Mapping Engine] Querying HeyGen available workspace avatars...');
    
    // Step 1: Fetch Group Avatars list
    const response = await fetch('https://api.heygen.com/v2/avatars', {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[Avatar Mapping Engine] Failed to listing workspace avatars: HTTP ${response.status}`);
      return [];
    }

    const json = await response.json();
    const avatarGroups = json?.data?.avatars || json?.avatars || [];
    console.log(`[Avatar Mapping Engine] Received ${avatarGroups.length} avatar groups from HeyGen API.`);

    const extractedLooks: WorkspaceLookCache['looks'] = [];

    // Traverse groups and gather internal looks listed, or treat them as looks
    for (const group of avatarGroups) {
      const gId = group.avatar_id || group.id || '';
      const gName = group.avatar_name || group.name || '';
      const gGender = group.gender || '';

      // Check if looks list is already included nested in the group
      if (group.looks && Array.isArray(group.looks) && group.looks.length > 0) {
        group.looks.forEach((look: any) => {
          extractedLooks.push({
            look_id: look.look_id || look.id || gId,
            look_name: look.look_name || look.name || gName,
            avatar_id: gId,
            avatar_name: gName,
            gender: gGender
          });
        });
      } else {
        // HeyGen Workspace groups may have their own looking ID
        extractedLooks.push({
          look_id: gId,
          look_name: gName,
          avatar_id: gId,
          avatar_name: gName,
          gender: gGender
        });
      }
    }

    console.log(`[Avatar Mapping Engine] Successfully parsed ${extractedLooks.length} looks in HeyGen workspace.`);
    workspaceLookCache = {
      lastChecked: now,
      looks: extractedLooks
    };

    return extractedLooks;
  } catch (err) {
    console.error('[Avatar Mapping Engine] Fetch looks exceptions: ', err);
    return [];
  }
}

/**
 * Executes high-precision avatar ID resolution, mapping, pre-validation and workspace matching.
 */
export async function resolveAndValidateAvatar(
  localId: string,
  apiKey?: string,
  onLog?: (logEntry: any) => void
): Promise<{
  heygenAvatarId: string;
  heygenLookId?: string;
  origin: 'public' | 'workspace_custom' | 'fallback_reassigned';
  validationMessage: string;
  isFallback: boolean;
}> {
  const localAvatar = getAvatarFromRegistry(localId);
  const fallbacksGenderDefault = localAvatar?.gender || 'female';
  
  const defaultPublicId = fallbacksGenderDefault === 'female' ? 'Sophia_casual_20210303' : 'Daniel_casual_20210303';
  const defaultPublicLook = fallbacksGenderDefault === 'female' ? 'sophia_casual_v2' : 'daniel_casual_v2';
  const defaultTitle = localAvatar?.displayName || 'Sophia';

  // Base Registry Lookup Fallback Map
  let resolvedId = localAvatar?.heygenAvatarId || defaultPublicId;
  let resolvedLookId = localAvatar?.heygenLookId || defaultPublicLook;
  let origin: 'public' | 'workspace_custom' | 'fallback_reassigned' = 'public';
  let isFallback = false;
  let validationMessage = 'Успешно использован публичный аватар HeyGen.';

  if (!apiKey || apiKey.trim().length <= 10) {
    return {
      heygenAvatarId: resolvedId,
      heygenLookId: resolvedLookId,
      origin: 'public',
      validationMessage: 'Соединение HeyGen API отсутствует (симуляция). Возвращен публичный аватар.',
      isFallback: false
    };
  }

  // Look up available looks from live Workspace
  const workspaceLooks = await fetchWorkspaceLooks(apiKey);

  if (workspaceLooks.length > 0) {
    // 1. Exact Name/ID Matching in Workspace (User digital twins matching)
    // Try matching if any workspace Look contains the Russian name trans-phonetically, English name or IDs
    const searchTarget = (localAvatar?.displayName || '').toLowerCase();
    
    // Find look carrying matching names
    const exactMatch = workspaceLooks.find(look => {
      const name = (look.look_name || look.avatar_name || '').toLowerCase();
      const lookId = (look.look_id || '').toLowerCase();
      return name.includes(searchTarget) || lookId.includes(localId.replace('-', '_')) || lookId.includes(localId);
    });

    if (exactMatch) {
      resolvedId = exactMatch.look_id;
      resolvedLookId = exactMatch.look_id; // Set both just in case
      origin = 'workspace_custom';
      validationMessage = `[AVATAR ROUTING] Успешно сопоставлен персональный клон из воркспейса: "${exactMatch.look_name}" (${exactMatch.look_id})`;
      
      console.log(`[Avatar Routing] Matched user custom workspace avatar look for ${localId}: ${exactMatch.look_name}`);
      if (onLog) {
        onLog({
          type: 'response',
          module: 'AI-Avatar-Validation',
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
    // If our registry lists a fallback (e.g. Kristin_casual_20210303), let's ensure it is supported or exists.
    // However, public avatars are allowed in all workspaces usually, but standard workspaces can occasionally limit looks.
    // If a custom/user look was requested but not found, we look up if ANY workspace avatar fits the requested Gender & Category!
    const genderMatch = workspaceLooks.filter(look => (look.gender || '').toLowerCase() === fallbacksGenderDefault);
    
    if (genderMatch.length > 0) {
      // Find one in the same Category (casual, business, etc.)
      const catSearch = localAvatar?.category || 'casual';
      const categoryMatch = genderMatch.find(look => {
        const name = (look.look_name || look.avatar_name || '').toLowerCase();
        return name.includes(catSearch);
      });

      const bestAv = categoryMatch || genderMatch[0];
      
      // Let's check check if the original registry fallback is available.
      // If our originally mapped avatar_id is NOT in the workspace Looks, and they have at least one custom avatar,
      // it is safer to fallback directly to their first workspace avatar of the same gender!
      // This guarantees no "avatar look not found" errors!
      const isOriginalFallbackInWorkspace = workspaceLooks.some(look => 
        look.look_id === resolvedId || look.avatar_id === resolvedId
      );

      if (!isOriginalFallbackInWorkspace) {
        // Fallback to workspace avatar
        resolvedId = bestAv.look_id;
        resolvedLookId = bestAv.look_id;
        origin = 'fallback_reassigned';
        isFallback = true;
        validationMessage = `Аватар "${defaultTitle}" недоступен для текущего HeyGen воркспейса. Выполнен авто-матчинг на доступный копия: "${bestAv.look_name}" (${bestAv.look_id}).`;
        
        console.warn(`[Avatar Routing] Assigned registry avatar ${resolvedId} not in workspace. Switched to workspace fallback: ${bestAv.look_id}`);
        if (onLog) {
          onLog({
            type: 'error',
            module: 'AI-Avatar-Validation',
            message: validationMessage,
            data: {
              requestedLocalId: localId,
              assignedId: resolvedId,
              isOriginalFallbackInWorkspace
            }
          });
        }
      }
    }
  }

  return {
    heygenAvatarId: resolvedId,
    heygenLookId: resolvedLookId,
    origin,
    validationMessage,
    isFallback
  };
}
