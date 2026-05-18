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
        console.group('[AI Client] Request Failed');
        console.error('URL:', '/api/planner');
        console.error('Status:', response.status);
        console.error('Status Text:', response.statusText);
        console.error('Raw Response:', text);
        console.groupEnd();

        try {
          errorData = JSON.parse(text);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // It's not JSON, maybe HTML or plain text
          if (text.includes('<!DOCTYPE html>')) {
            errorMessage = `Server Error (${response.status}): Received HTML instead of JSON. Check server logs.`;
          } else {
            errorMessage = `Server Error (${response.status}): ${text.substring(0, 150) || response.statusText || 'No detailed error available'}`;
          }
          errorData = { rawResponse: text };
        }
      } catch (e) {
        errorMessage = `Network or Parsing Error (${response.status}): ${response.statusText || 'Unable to read response body'}`;
      }
      
      log({ 
        type: 'error', 
        module: 'Content Planner', 
        message: `Synthesis failed: ${errorMessage}`,
        data: {
          url: '/api/planner',
          status: response.status,
          statusText: response.statusText,
          details: errorData
        }
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
