// src/services/heygenAvatarService.ts

import { RegistryAvatar } from '../constants/avatarRegistry';
import { RegistryVoice } from '../constants/voiceRegistry';

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

const WORKSPACE_CACHE_TTL = 5 * 60 * 1000;

/**
 * Load HeyGen workspace looks.
 */
export async function fetchWorkspaceLooks(
  apiKey?: string,
  forceRefresh = false
): Promise<WorkspaceLookCache['looks']> {

  if (
    !apiKey ||
    apiKey.trim().length < 10
  ) {
    return [];
  }

  const now = Date.now();

  if (
    workspaceLookCache &&
    !forceRefresh &&
    now - workspaceLookCache.lastChecked <
      WORKSPACE_CACHE_TTL
  ) {
    return workspaceLookCache.looks;
  }

  try {

    console.log(
      '[HeyGen] Refreshing workspace looks'
    );

    const response = await fetch(
      'https://api.heygen.com/v2/avatars',
      {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {

      console.warn(
        `[HeyGen] Failed loading avatars ${response.status}`
      );

      return [];
    }

    const json = await response.json();

    const avatarGroups =
      json?.data?.avatars ||
      json?.avatars ||
      [];

    const extractedLooks:
      WorkspaceLookCache['looks'] = [];

    for (const group of avatarGroups) {

      const gId =
        group.avatar_id ||
        group.id ||
        '';

      const gName =
        group.avatar_name ||
        group.name ||
        '';

      const gGender =
        group.gender || '';

      if (
        group.looks &&
        Array.isArray(group.looks)
      ) {

        group.looks.forEach(
          (look: any) => {

            extractedLooks.push({
              look_id:
                look.look_id ||
                look.id ||
                gId,

              look_name:
                look.look_name ||
                look.name ||
                gName,

              avatar_id: gId,

              avatar_name: gName,

              gender: gGender
            });
          }
        );

      } else {

        extractedLooks.push({
          look_id: gId,
          look_name: gName,
          avatar_id: gId,
          avatar_name: gName,
          gender: gGender
        });
      }
    }

    workspaceLookCache = {
      lastChecked: now,
      looks: extractedLooks
    };

    return extractedLooks;

  } catch (err) {

    console.error(
      '[HeyGen] Workspace fetch failed',
      err
    );

    return [];
  }
}

/**
 * Upload audio asset to HeyGen.
 */
export async function uploadAudioToHeyGen(
  audioBlob: Blob,
  apiKey: string,
  onLog?: (logEntry: any) => void
): Promise<string> {

  if (!audioBlob) {
    throw new Error(
      'Audio blob is missing.'
    );
  }

  if (!apiKey) {
    throw new Error(
      'HeyGen API key missing.'
    );
  }

  onLog?.({
    type: 'request',
    module: '[LIPSYNC RENDER]',
    message:
      `Uploading audio to HeyGen Assets (${(
        audioBlob.size / 1024
      ).toFixed(1)} KB)`
  });

  const controller =
    new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000);

  try {

    // IMPORTANT:
    // Convert Blob -> File
    // HeyGen behaves more stable with File uploads.

    const audioFile = new File(
      [audioBlob],
      'audio.mp3',
      {
        type: 'audio/mpeg'
      }
    );

    const formData = new FormData();

    formData.append(
      'file',
      audioFile
    );

    const response = await fetch(
      'https://api.heygen.com/v2/assets',
      {
        method: 'POST',

        headers: {
          'X-Api-Key': apiKey
        },

        body: formData,

        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    const responseText =
      await response.text();

    let json: any = null;

    try {

      json = JSON.parse(
        responseText
      );

    } catch {}

    if (!response.ok) {

      onLog?.({
        type: 'error',
        module: '[LIPSYNC RENDER]',
        message:
          `HeyGen asset upload failed (${response.status})`,
        data: responseText
      });

      throw new Error(
        `HeyGen asset upload failed (${response.status}): ${responseText}`
      );
    }

    const assetUrl =
      json?.data?.url ||
      json?.data?.audio_url;

    const assetId =
      json?.data?.id ||
      json?.data?.asset_id;

    if (
      !assetUrl &&
      !assetId
    ) {

      throw new Error(
        `HeyGen response missing asset URL: ${responseText}`
      );
    }

    onLog?.({
      type: 'response',
      module: '[LIPSYNC RENDER]',
      message:
        `HeyGen asset uploaded successfully`,
      data: {
        assetUrl,
        assetId
      }
    });

    return assetUrl || assetId;

  } catch (err: any) {

    clearTimeout(timeout);

    if (
      err?.name === 'AbortError'
    ) {

      throw new Error(
        'HeyGen upload timeout exceeded.'
      );
    }

    throw err;
  }
}

export interface RenderingDiagnostics {
  avatarValid: boolean;
  lookValid: boolean;
  voiceValid: boolean;
  compatibilityValid: boolean;
  durationValid: boolean;
  criticalIssues: string[];
  infoMessages: string[];
}

/**
 * Validate render setup.
 */
export function validateRenderSetup(
  avatar: RegistryAvatar | undefined,
  voice: RegistryVoice | undefined,
  totalDurationSeconds: number
): RenderingDiagnostics {

  const criticalIssues: string[] = [];

  const infoMessages: string[] = [];

  let avatarValid = true;

  let lookValid = true;

  let voiceValid = true;

  let durationValid = true;

  if (!avatar) {

    avatarValid = false;

    criticalIssues.push(
      'Avatar missing from registry.'
    );
  }

  if (
    avatar &&
    !avatar.heygenAvatarId
  ) {

    lookValid = false;

    criticalIssues.push(
      'Avatar missing HeyGen ID.'
    );
  }

  if (!voice) {

    voiceValid = false;

    criticalIssues.push(
      'Voice missing from registry.'
    );
  }

  if (
    totalDurationSeconds > 300
  ) {

    durationValid = false;

    criticalIssues.push(
      'Duration exceeds 300 seconds.'
    );
  }

  return {
    avatarValid,
    lookValid,
    voiceValid,
    compatibilityValid: true,
    durationValid,
    criticalIssues,
    infoMessages
  };
}