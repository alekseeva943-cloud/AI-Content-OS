import { PlannerRequest, PlannerResult } from '@/src/types/planner';
import { CampaignRequest, CampaignResult, VariableRequirement } from '@/src/types/newsletter';
import { useDebugStore } from '@/src/stores/useDebugStore';

export async function generateContentPlan(req: PlannerRequest & { sharedMemory: string[] }): Promise<PlannerResult> {
  const log = useDebugStore.getState().addLog;
  
  log({ type: 'request', module: 'Content Planner', message: `Initiating synthesis for: ${req.topic}`, data: { period: req.period, channels: req.channels } });

  try {
    const response = await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...req, advanced: req.advanced }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate plan';
      let errorData: any = null;
      
      try {
        const text = await response.text();
        try {
          errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `Server Error (${response.status}): ${text.substring(0, 100) || response.statusText || 'Unknown Error'}`;
          errorData = { rawResponse: text };
        }
      } catch (e) {
        errorMessage = `Network Error (${response.status})`;
      }
      
      log({ 
        type: 'error', 
        module: 'Content Planner', 
        message: `Synthesis failed: ${errorMessage}`,
        data: { status: response.status, details: errorData }
      });
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    log({ 
      type: 'response', 
      module: 'Content Planner', 
      message: 'Plan synthesized successfully'
    });

    return result;
  } catch (err: any) {
    log({ type: 'error', module: 'Content Planner', message: `Synthesis failed: ${err.message}` });
    throw err;
  }
}

export async function detectCampaignVariables(req: { topic: string, context: string }): Promise<{ requirements: VariableRequirement[], suggestedChannels: string[] }> {
  const log = useDebugStore.getState().addLog;
  log({ type: 'request', module: 'Discovery', message: `Analyzing campaign intent: ${req.topic}` });

  const response = await fetch('/api/campaign-detect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });

  if (!response.ok) throw new Error('Failed to analyze campaign');
  return response.json();
}

export async function generateCampaign(req: CampaignRequest): Promise<CampaignResult> {
  const log = useDebugStore.getState().addLog;
  log({ type: 'request', module: 'Campaign Builder', message: `Launching synthesis for: ${req.topic}` });

  try {
    const response = await fetch('/api/newsletter', { // Keeping endpoint as /api/newsletter to avoid re-routing if possible, or link to /api/campaign
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!response.ok) throw new Error('Failed to generate campaign');
    const result = await response.json();
    
    log({ type: 'response', module: 'Campaign Builder', message: 'Campaign ready to push' });
    return result;
  } catch (err: any) {
    log({ type: 'error', module: 'Campaign Builder', message: `Launch failed: ${err.message}` });
    throw err;
  }
}

export async function generateCampaignImage(prompt: string): Promise<string> {
  const log = useDebugStore.getState().addLog;
  log({ type: 'request', module: 'Visual Studio', message: 'Designing custom asset' });

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) throw new Error('Failed to generate image');
  const { url } = await response.json();
  return url;
}

export async function generateLongread(req: { topic: string, context: string, advanced?: any }): Promise<any> {
    const log = useDebugStore.getState().addLog;
    log({ type: 'request', module: 'Longread', message: `Crafting article: ${req.topic}` });
    const response = await fetch('/api/longreads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
    });
    if (!response.ok) throw new Error('Failed to generate longread');
    return response.json();
}

export async function generatePodcast(req: { topic: string, context: string, advanced?: any }): Promise<any> {
    const log = useDebugStore.getState().addLog;
    log({ type: 'request', module: 'Podcast', message: `Structuring episodes: ${req.topic}` });
    const response = await fetch('/api/podcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
    });
    if (!response.ok) throw new Error('Failed to generate podcast');
    return response.json();
}

export async function generateVideoAvatar(req: { topic: string, context: string, advanced?: any }): Promise<any> {
    const log = useDebugStore.getState().addLog;
    log({ type: 'request', module: 'AI-Avatar', message: `Choreographing scenes: ${req.topic}` });
    const response = await fetch('/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
    });
    if (!response.ok) throw new Error('Failed to generate video avatar');
    return response.json();
}

export async function generatePostText(item: any, context?: string, advanced?: any): Promise<string> {
  const log = useDebugStore.getState().addLog;
  log({ type: 'request', module: 'Post Generator', message: `Generating full post for: ${item.topic}` });

  try {
    const response = await fetch('/api/generate-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, context, advanced }),
    });

    if (!response.ok) throw new Error('Failed to generate post text');
    const { text } = await response.json();
    
    log({ type: 'response', module: 'Post Generator', message: 'Post generated successfully' });
    return text;
  } catch (err: any) {
    log({ type: 'error', module: 'Post Generator', message: `Generation failed: ${err.message}` });
    throw err;
  }
}

export async function regeneratePlannerItem(item: any): Promise<any> {
  const log = useDebugStore.getState().addLog;
  log({ type: 'request', module: 'Planner', message: `Regenerating variation for: ${item.topic}` });

  try {
    const response = await fetch('/api/regenerate-item', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item }),
    });

    if (!response.ok) throw new Error('Failed to regenerate item');
    const newItem = await response.json();
    
    log({ type: 'response', module: 'Planner', message: 'Item regenerated successfully' });
    return newItem;
  } catch (err: any) {
    log({ type: 'error', module: 'Planner', message: `Regeneration failed: ${err.message}` });
    throw err;
  }
}
