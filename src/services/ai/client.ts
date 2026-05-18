import { PlannerRequest, PlannerResult } from '@/src/types/planner';
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
      message: 'Plan synthesized successfully', 
      data: { 
        duration: result.debug?.duration,
        summary: result.summary 
      }
    });

    return result;
  } catch (err: any) {
    log({ type: 'error', module: 'Content Planner', message: `Synthesis failed: ${err.message}` });
    throw err;
  }
}
