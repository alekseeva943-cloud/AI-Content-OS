import { DEFAULT_AVATARS } from './avatar.constants';

export interface RegistryAvatar {
  localId: string;
  displayName: string;
  heygenAvatarId: string; // The physical HeyGen avatar/look ID
  heygenLookId?: string;  // Detailed look ID when applicable
  gender: 'male' | 'female';
  category: 'business' | 'casual' | 'educational' | 'creative';
  previewImage: string;
  avatarStyle: 'normal' | 'close-up';
  tags: string[];
  origin: 'public' | 'workspace_custom' | 'fallback_reassigned';
}

// Map of standard public HeyGen avatar IDs for local fallbacks
// Sophia, Elena, Charles, Daniel etc., are well-known high quality public IDs in HeyGen
export const PUBLIC_HEYGEN_FALLBACKS: Record<string, { heygenAvatarId: string; heygenLookId?: string }> = {
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

// Construct clean full list of RegistryAvatars programmatically (without any voice information)
export const AVATAR_REGISTRY: RegistryAvatar[] = DEFAULT_AVATARS.map((av) => {
  const matches = PUBLIC_HEYGEN_FALLBACKS[av.id] || {
    heygenAvatarId: av.gender === 'female' ? 'Sophia_casual_20210303' : 'Daniel_casual_20210303',
    heygenLookId: av.gender === 'female' ? 'sophia_casual_v2' : 'daniel_casual_v2'
  };

  const tagsList: string[] = [av.category, av.gender];
  if (av.roleType) {
    tagsList.push(av.roleType.toLowerCase());
  }
  if (av.clothingStyle) {
    tagsList.push(av.clothingStyle.toLowerCase());
  }

  return {
    localId: av.id,
    displayName: av.name,
    heygenAvatarId: matches.heygenAvatarId,
    heygenLookId: matches.heygenLookId,
    gender: av.gender,
    category: av.category,
    previewImage: av.thumbnail,
    avatarStyle: av.avatarStyle === 'close-up' ? 'close-up' : 'normal',
    tags: tagsList,
    origin: 'public'
  };
});

/**
 * Gets an avatar from the local registry, with optional fallback protection
 */
export function getAvatarFromRegistry(localId: string): RegistryAvatar | undefined {
  return AVATAR_REGISTRY.find(av => av.localId === localId);
}
