import { PodcastConfig, PodcastResult, PodcastPipelineError } from '../types/podcast.types';

export async function generatePodcast(config: PodcastConfig, trigger?: string, sessionId?: string): Promise<PodcastResult> {
  const url = '/api/podcast/generate';
  console.log(`[PODCAST FETCH START] POST -> "${url}" with payload:`, config);
  
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...config,
        trigger: trigger || 'manual_generate',
        sessionId: sessionId || 'podcast_studio'
      }),
    });
  } catch (networkErr: any) {
    console.error('[PODCAST FETCH NETWORK ERROR]:', networkErr);
    throw new PodcastPipelineError(`Network Error: ${networkErr.message || 'Unable to connect to server'}`, {
      status: 0,
      rawResponse: networkErr.stack || networkErr.toString(),
      stageId: 'send_request',
      details: 'Failed to dispatch fetch request to backend server'
    });
  }

  console.log(`[PODCAST FETCH RESPONSE STATUS] Code: ${response.status} (${response.statusText})`);

  let rawText = '';
  try {
    rawText = await response.text();
    console.log(`[PODCAST FETCH RAW TEXT LENGTH]: ${rawText.length} characters`);
  } catch (textErr: any) {
    console.error('[PODCAST FETCH READ ERROR]:', textErr);
    throw new PodcastPipelineError(`Failed to read response stream: ${textErr.message}`, {
      status: response.status,
      rawResponse: 'Response stream unreadable',
      stageId: 'wait_response',
      details: `HTTP ${response.status} returned, but unable to extract body text`
    });
  }

  if (!response.ok) {
    console.error(`[PODCAST FETCH NOT OK] ${response.status}. Body:`, rawText);
    let message = 'Failed to generate podcast script';
    let details = 'Backend returned error status';
    
    try {
      const parsed = JSON.parse(rawText);
      message = parsed.error || message;
      details = parsed.details || JSON.stringify(parsed, null, 2);
    } catch {
      message = rawText || message;
    }
    
    throw new PodcastPipelineError(message, {
      status: response.status,
      rawResponse: rawText,
      stageId: 'wait_response',
      details: details
    });
  }

  try {
    const result = JSON.parse(rawText);
    console.log(`[PODCAST FETCH OK] Successfully parsed json. Title: "${result.title}"`);
    return result as PodcastResult;
  } catch (jsonErr: any) {
    console.error('[PODCAST FETCH JSON PARSE ERROR]:', jsonErr, 'Raw Text had length:', rawText.length);
    throw new PodcastPipelineError(`JSON Parse error: ${jsonErr.message}`, {
      status: response.status,
      rawResponse: rawText,
      stageId: 'parse_structure',
      details: `The server returned HTTP 200, but failed JSON.parse validation. SyntaxError: ${jsonErr.message}`
    });
  }
}
