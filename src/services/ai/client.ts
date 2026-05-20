// ============================================
// FILE: src/services/ai/client.ts
// ============================================

import {
  PlannerRequest,
  PlannerResult
} from '@/src/types/planner';

import {
  CampaignRequest,
  CampaignResult,
  VariableRequirement
} from '@/src/types/newsletter';

import {
  useDebugStore
} from '@/src/stores/useDebugStore';

// ============================================
// CONTENT PLANNER
// ============================================

export async function generateContentPlan(
  req: PlannerRequest & {
    sharedMemory: string[]
  }
): Promise<PlannerResult> {

  const log =
    useDebugStore
      .getState()
      .addLog;

  log({
    type: 'request',

    module:
      'Content Planner',

    message:
      `Initiating synthesis for: ${req.topic}`,

    data: {
      period:
        req.period,

      channels:
        req.channels
    }
  });

  try {

    const response =
      await fetch(
        '/api/planner',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            ...req,
            advanced:
              req.advanced
          }),
        }
      );

    if (!response.ok) {

      let errorMessage =
        'Failed to generate plan';

      let errorData:
        any = null;

      try {

        const text =
          await response.text();

        try {

          errorData =
            JSON.parse(text);

          errorMessage =
            errorData.error ||
            errorData.message ||
            errorMessage;

        } catch {

          errorMessage =
            `Server Error (${response.status}): ${text.substring(0, 100)}`;

          errorData = {
            rawResponse:
              text
          };
        }

      } catch {

        errorMessage =
          `Network Error (${response.status})`;
      }

      log({
        type: 'error',

        module:
          'Content Planner',

        message:
          `Synthesis failed: ${errorMessage}`,

        data: {
          status:
            response.status,

          details:
            errorData
        }
      });

      throw new Error(
        errorMessage
      );
    }

    const result =
      await response.json();

    log({
      type: 'response',

      module:
        'Content Planner',

      message:
        'Plan synthesized successfully'
    });

    return result;

  } catch (err: any) {

    log({
      type: 'error',

      module:
        'Content Planner',

      message:
        `Synthesis failed: ${err.message}`
    });

    throw err;
  }
}

// ============================================
// DISCOVERY
// ============================================

export async function detectCampaignVariables(
  req: {
    topic: string;
    context: string;
  }
): Promise<{
  requirements:
  VariableRequirement[];

  suggestedChannels:
  string[];
}> {

  const log =
    useDebugStore
      .getState()
      .addLog;

  // ============================================
  // REQUEST START
  // ============================================

  console.log(
    '[DISCOVERY] START:',
    req
  );

  log({
    type: 'request',

    module:
      'AI Discovery',

    message:
      `Анализ кампании: ${req.topic}`,

    data: {
      topic:
        req.topic,

      context:
        req.context
    }
  });

  try {

    // ============================================
    // FETCH
    // ============================================

    const response =
      await fetch(
        '/api/campaign-detect',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(req),
        }
      );

    console.log(
      '[DISCOVERY] STATUS:',
      response.status
    );

    // ============================================
    // RAW RESPONSE
    // ============================================

    const rawText =
      await response.text();

    console.log(
      '[DISCOVERY] RAW:',
      rawText
    );

    log({
      type: 'response',

      module:
        'AI Discovery',

      message:
        `Raw response received`,

      data: {
        status:
          response.status,

        raw:
          rawText
      }
    });

    // ============================================
    // ERROR
    // ============================================

    if (!response.ok) {

      console.error(
        '[DISCOVERY ERROR]',
        rawText
      );

      log({
        type: 'error',

        module:
          'AI Discovery',

        message:
          `Discovery failed`,

        data: {
          status:
            response.status,

          response:
            rawText
        }
      });

      throw new Error(
        `Discovery failed: ${response.status}`
      );
    }

    // ============================================
    // PARSE JSON
    // ============================================

    let parsed: any = {};

    try {

      parsed =
        JSON.parse(rawText);

    } catch (err) {

      console.error(
        '[DISCOVERY PARSE ERROR]',
        err
      );

      log({
        type: 'error',

        module:
          'AI Discovery',

        message:
          'JSON parse failed',

        data: {
          raw:
            rawText
        }
      });

      throw new Error(
        'Discovery JSON parse failed'
      );
    }

    // ============================================
    // NORMALIZE
    // ============================================

    const requirements =
      Array.isArray(
        parsed.requirements
      )
        ? parsed.requirements
        : [];

    const suggestedChannels =
      Array.isArray(
        parsed.suggestedChannels
      )
        ? parsed.suggestedChannels
        : [];

    // ============================================
    // SUCCESS LOGS
    // ============================================

    console.log(
      '[DISCOVERY] REQUIREMENTS:',
      requirements
    );

    console.log(
      '[DISCOVERY] CHANNELS:',
      suggestedChannels
    );

    log({
      type: 'response',

      module:
        'AI Discovery',

      message:
        `Discovery complete`,

      data: {
        requirementsCount:
          requirements.length,

        requirements,

        suggestedChannels
      }
    });

    // ============================================
    // RETURN
    // ============================================

    return {
      requirements,
      suggestedChannels
    };

  } catch (err: any) {

    console.error(
      '[DISCOVERY FATAL ERROR]',
      err
    );

    log({
      type: 'error',

      module:
        'AI Discovery',

      message:
        err.message,

      data: {
        stack:
          err.stack
      }
    });

    throw err;
  }
}

// ============================================
// CAMPAIGN GENERATION
// ============================================

export async function generateCampaign(
  req: CampaignRequest
): Promise<CampaignResult> {

  const log =
    useDebugStore
      .getState()
      .addLog;

  log({
    type: 'request',

    module:
      'Campaign Builder',

    message:
      `Launching synthesis for: ${req.topic}`
  });

  try {

    const response =
      await fetch(
        '/api/newsletter',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body:
            JSON.stringify(req),
        }
      );

    if (!response.ok) {

      const text =
        await response.text();

      let message =
        'Failed to generate campaign';

      try {

        const data =
          JSON.parse(text);

        message =
          data.error ||
          data.message ||
          message;

        if (data.stack) {

          console.error(
            '[Campaign API Stack]:',
            data.stack
          );
        }

      } catch {

        message =
          `Server error: ${response.status} ${response.statusText}`;
      }

      throw new Error(
        message
      );
    }

    const result =
      await response.json();

    log({
      type: 'response',

      module:
        'Campaign Builder',

      message:
        'Campaign ready to push'
    });

    return result;

  } catch (err: any) {

    log({
      type: 'error',

      module:
        'Campaign Builder',

      message:
        `Launch failed: ${err.message}`
    });

    throw err;
  }
}

// ============================================
// IMAGE GENERATION
// ============================================

export async function generateCampaignImage(
  prompt: string,
  channel?: string,
  context?: string
): Promise<string> {

  const log =
    useDebugStore
      .getState()
      .addLog;

  log({
    type: 'request',

    module:
      'Visual Studio',

    message:
      'Designing custom asset'
  });

  try {

    const response =
      await fetch(
        '/api/generate-image',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            prompt,
            channel,
            context
          }),
        }
      );

    if (!response.ok) {

      const text =
        await response.text();

      throw new Error(
        `Visual Studio failure: ${text.substring(0, 120)}`
      );
    }

    const data =
      await response.json();

    console.log(
      '[IMAGE CLIENT] RESPONSE:',
      data
    );

    // ============================================
    // BASE64 MODE
    // ============================================

    if (
      data.type ===
      'base64' &&
      data.imageBase64
    ) {

      return `data:image/png;base64,${data.imageBase64}`;
    }

    // ============================================
    // URL MODE
    // ============================================

    if (
      data.type ===
      'url' &&
      data.url
    ) {

      return data.url;
    }

    console.error(
      '[IMAGE CLIENT] Invalid response:',
      data
    );

    throw new Error(
      'Invalid image response format'
    );

  } catch (err: any) {

    console.error(
      '[IMAGE CLIENT ERROR]',
      err
    );

    log({
      type: 'error',

      module:
        'Visual Studio',

      message:
        `Asset design failed: ${err.message}`
    });

    throw err;
  }
}

// ============================================
// LONGREADS
// ============================================

export async function generateLongread(
  req: {
    topic: string;
    context: string;
    advanced?: any;
  }
): Promise<any> {

  const log =
    useDebugStore
      .getState()
      .addLog;

  log({
    type: 'request',

    module:
      'Longread',

    message:
      `Crafting article: ${req.topic}`
  });

  const response =
    await fetch(
      '/api/longreads',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify(req),
      }
    );

  if (!response.ok) {

    throw new Error(
      'Failed to generate longread'
    );
  }

  return response.json();
}

// ============================================
// PODCAST
// ============================================

export async function generatePodcast(
  req: {
    topic: string;
    context: string;
    advanced?: any;
  }
): Promise<any> {

  const log =
    useDebugStore
      .getState()
      .addLog;

  log({
    type: 'request',

    module:
      'Podcast',

    message:
      `Structuring episodes: ${req.topic}`
  });

  const response =
    await fetch(
      '/api/podcasts',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify(req),
      }
    );

  if (!response.ok) {

    throw new Error(
      'Failed to generate podcast'
    );
  }

  return response.json();
}

// ============================================
// VIDEO AVATAR
// ============================================

export async function generateVideoAvatar(
  req: {
    topic: string;
    context: string;
    advanced?: any;
  }
): Promise<any> {

  const log =
    useDebugStore
      .getState()
      .addLog;

  log({
    type: 'request',

    module:
      'AI-Avatar',

    message:
      `Choreographing scenes: ${req.topic}`
  });

  const response =
    await fetch(
      '/api/avatars',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify(req),
      }
    );

  if (!response.ok) {

    throw new Error(
      'Failed to generate video avatar'
    );
  }

  return response.json();
}

// ============================================
// POST GENERATOR
// ============================================

export async function generatePostText(
  item: any,
  context?: string,
  advanced?: any
): Promise<string> {

  const log =
    useDebugStore
      .getState()
      .addLog;

  log({
    type: 'request',

    module:
      'Post Generator',

    message:
      `Generating full post for: ${item.topic}`
  });

  try {

    const response =
      await fetch(
        '/api/generate-post',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            item,
            context,
            advanced
          }),
        }
      );

    if (!response.ok) {

      throw new Error(
        'Failed to generate post text'
      );
    }

    const { text } =
      await response.json();

    log({
      type: 'response',

      module:
        'Post Generator',

      message:
        'Post generated successfully'
    });

    return text;

  } catch (err: any) {

    log({
      type: 'error',

      module:
        'Post Generator',

      message:
        `Generation failed: ${err.message}`
    });

    throw err;
  }
}

// ============================================
// REGENERATE PLANNER ITEM
// ============================================

export async function regeneratePlannerItem(
  item: any
): Promise<any> {

  const log =
    useDebugStore
      .getState()
      .addLog;

  log({
    type: 'request',

    module:
      'Planner',

    message:
      `Regenerating variation for: ${item.topic}`
  });

  try {

    const response =
      await fetch(
        '/api/regenerate-item',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            item
          }),
        }
      );

    if (!response.ok) {

      throw new Error(
        'Failed to regenerate item'
      );
    }

    const newItem =
      await response.json();

    log({
      type: 'response',

      module:
        'Planner',

      message:
        'Item regenerated successfully'
    });

    return newItem;

  } catch (err: any) {

    log({
      type: 'error',

      module:
        'Planner',

      message:
        `Regeneration failed: ${err.message}`
    });

    throw err;
  }
}