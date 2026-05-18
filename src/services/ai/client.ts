import { PlannerRequest, PlannerResult } from '@/src/types/planner';
import { useDebugStore } from '@/src/stores/useDebugStore';

export async function generateContentPlan(req: PlannerRequest & { sharedMemory: string[] }): Promise<PlannerResult> {
  const log = useDebugStore.getState().addLog;
  
  log({ type: 'request', module: 'Content Planner', message: `Initiating synthesis for: ${req.topic}`, data: { period: req.period, channels: req.channels } });

  try {
    const response = await fetch('/api/ai/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate plan';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use the status text
        errorMessage = `Server Error (${response.status}): ${response.statusText}`;
      }
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
