// src/features/avatar/constants/avatarRegistry.ts

// ============================================================================
// AI Avatar Studio — Production Avatar Registry
// ----------------------------------------------------------------------------
// PURPOSE:
// - Stores ONLY avatar metadata.
// - NO voice routing.
// - NO provider routing.
// - NO fallback engines.
// - NO hardcoded fake look ids.
// - NO synthesis logic.
// - NO provider mixing.
//
// This registry is dynamically hydrated from HeyGen workspace avatars.
//
// ARCHITECTURE:
// HeyGen API
//    ↓
// fetchWorkspaceAvatars()
//    ↓
// normalizeHeyGenAvatar()
//    ↓
// buildAvatarRegistry()
//    ↓
// UI Avatar Cards
//
// ============================================================================

export type AvatarGender = 'male' | 'female';

export type AvatarCategory =
  | 'business'
  | 'casual'
  | 'educational'
  | 'creative';

export type AvatarStyle =
  | 'normal'
  | 'closeUp'
  | 'circle'
  | 'voiceOnly';

export type AvatarSource =
  | 'workspace'
  | 'public';

export interface RegistryAvatar {
  // Local UI-safe identifier
  localId: string;

  // Human-readable display name
  displayName: string;

  // REAL HeyGen avatar id
  heygenAvatarId: string;

  // REAL HeyGen look id
  // Optional because not every avatar has a look
  heygenLookId?: string;

  gender: AvatarGender;

  category: AvatarCategory;

  previewImage: string;

  avatarStyle: AvatarStyle;

  tags: string[];

  source: AvatarSource;

  // Validation result from HeyGen API
  isValidated: boolean;

  // Cache timestamp
  fetchedAt?: number;
}

// ============================================================================
// RAW HEYGEN RESPONSE TYPES
// ============================================================================

interface RawHeyGenAvatar {
  avatar_id?: string;
  avatar_name?: string;
  preview_image_url?: string;

  gender?: string;

  tags?: string[];

  category?: string;

  look_id?: string;

  default_style?: string;
}

// ============================================================================
// CACHE LAYER
// ============================================================================

const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

interface AvatarCacheState {
  avatars: RegistryAvatar[];
  fetchedAt: number;
}

let workspaceAvatarCache: AvatarCacheState | null = null;

// ============================================================================
// NORMALIZATION HELPERS
// ============================================================================

function normalizeGender(
  value?: string
): AvatarGender {
  if (!value) return 'female';

  const lower = value.toLowerCase();

  if (
    lower.includes('male') ||
    lower.includes('man')
  ) {
    return 'male';
  }

  return 'female';
}

function normalizeCategory(
  value?: string
): AvatarCategory {
  if (!value) return 'casual';

  const lower = value.toLowerCase();

  if (lower.includes('business')) {
    return 'business';
  }

  if (
    lower.includes('education') ||
    lower.includes('teacher')
  ) {
    return 'educational';
  }

  if (
    lower.includes('creator') ||
    lower.includes('creative')
  ) {
    return 'creative';
  }

  return 'casual';
}

function normalizeStyle(
  value?: string
): AvatarStyle {
  if (!value) return 'normal';

  const lower = value.toLowerCase();

  if (lower === 'circle') {
    return 'circle';
  }

  if (
    lower === 'closeup' ||
    lower === 'close-up'
  ) {
    return 'closeUp';
  }

  if (lower === 'voiceonly') {
    return 'voiceOnly';
  }

  return 'normal';
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// ============================================================================
// VALIDATION
// ============================================================================

export function validateAvatar(
  avatar: Partial<RegistryAvatar>
): boolean {
  return Boolean(
    avatar.heygenAvatarId &&
    avatar.displayName &&
    avatar.previewImage
  );
}

// ============================================================================
// NORMALIZER
// ============================================================================

export function normalizeHeyGenAvatar(
  raw: RawHeyGenAvatar
): RegistryAvatar | null {
  const heygenAvatarId = raw.avatar_id;

  if (!heygenAvatarId) {
    console.warn(
      '[AVATAR NORMALIZER] Missing avatar_id'
    );

    return null;
  }

  const displayName =
    raw.avatar_name || 'Unnamed Avatar';

  const localId = slugify(displayName);

  const normalized: RegistryAvatar = {
    localId,

    displayName,

    heygenAvatarId,

    // IMPORTANT:
    // NEVER invent look ids.
    // Use ONLY real HeyGen look ids.
    heygenLookId: raw.look_id,

    gender: normalizeGender(raw.gender),

    category: normalizeCategory(raw.category),

    previewImage:
      raw.preview_image_url ||
      '/images/avatar-placeholder.png',

    avatarStyle: normalizeStyle(
      raw.default_style
    ),

    tags: raw.tags || [],

    source: 'workspace',

    isValidated: true,

    fetchedAt: Date.now(),
  };

  const valid = validateAvatar(normalized);

  if (!valid) {
    console.warn(
      '[AVATAR VALIDATION] Invalid avatar:',
      normalized
    );

    return null;
  }

  return normalized;
}

// ============================================================================
// REGISTRY BUILDER
// ============================================================================

export function buildAvatarRegistry(
  rawAvatars: RawHeyGenAvatar[]
): RegistryAvatar[] {
  console.log(
    `[AVATAR REGISTRY] Building registry from ${rawAvatars.length} HeyGen avatars`
  );

  const normalized = rawAvatars
    .map(normalizeHeyGenAvatar)
    .filter(Boolean) as RegistryAvatar[];

  console.log(
    `[AVATAR REGISTRY] Loaded ${normalized.length} validated avatars`
  );

  return normalized;
}

// ============================================================================
// CACHE HELPERS
// ============================================================================

function isCacheValid(): boolean {
  if (!workspaceAvatarCache) {
    return false;
  }

  return (
    Date.now() - workspaceAvatarCache.fetchedAt <
    CACHE_TTL
  );
}

export function clearAvatarCache() {
  workspaceAvatarCache = null;

  console.log(
    '[AVATAR CACHE] Cleared'
  );
}

// ============================================================================
// FETCH WORKSPACE AVATARS
// ============================================================================

export async function fetchWorkspaceAvatars(): Promise<
  RegistryAvatar[]
> {
  if (isCacheValid()) {
    console.log(
      '[AVATAR CACHE] HIT'
    );

    return workspaceAvatarCache!.avatars;
  }

  console.log(
    '[AVATAR CACHE] MISS'
  );

  try {
    const response = await fetch(
      '/api/avatars/workspace'
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch avatars: ${response.status}`
      );
    }

    const payload = await response.json();

    const rawAvatars =
      payload?.avatars || [];

    const registry =
      buildAvatarRegistry(rawAvatars);

    workspaceAvatarCache = {
      avatars: registry,
      fetchedAt: Date.now(),
    };

    return registry;
  } catch (error) {
    console.error(
      '[AVATAR FETCH ERROR]',
      error
    );

    return [];
  }
}

// ============================================================================
// SAFE RESOLVER
// ============================================================================

export async function resolveAvatarById(
  localId: string
): Promise<RegistryAvatar | null> {
  const avatars =
    await fetchWorkspaceAvatars();

  const exact = avatars.find(
    avatar => avatar.localId === localId
  );

  if (exact) {
    console.log(
      `[AVATAR RESOLVER] Resolved avatar: ${localId}`
    );

    return exact;
  }

  console.warn(
    `[AVATAR RESOLVER] Avatar not found: ${localId}`
  );

  // Safe nearest fallback
  const fallback = avatars[0];

  if (fallback) {
    console.warn(
      `[AVATAR FALLBACK] Using fallback avatar: ${fallback.displayName}`
    );

    return fallback;
  }

  return null;
}

// ============================================================================
// EMPTY DEFAULT REGISTRY
// ----------------------------------------------------------------------------
// IMPORTANT:
// UI should hydrate dynamically from HeyGen API.
// DO NOT manually hardcode fake avatars here.
// ============================================================================

export const AVATAR_REGISTRY: RegistryAvatar[] = [];