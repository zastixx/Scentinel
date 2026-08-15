import axios from 'axios';
import { env } from '../config/env';

const OPENROUTER_MODEL = 'google/gemma-4-26b-a4b-it:free';

/**
 * Helper to fetch a remote image URL and convert it to standard base64 data.
 */
async function fetchImageAsBase64(url: string): Promise<{ data: string; mimeType: string }> {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const base64 = buffer.toString('base64');
    
    let mimeType = (response.headers['content-type'] || 'image/jpeg').toString();
    if (!mimeType.startsWith('image/')) {
      mimeType = 'image/jpeg';
    }
    
    return { data: base64, mimeType };
  } catch (error: any) {
    console.error(`Error downloading image from ${url}:`, error.message);
    throw new Error(`Could not fetch image from public URL: ${url}. Ensure it is publicly accessible.`);
  }
}

/**
 * Helper to extract and parse JSON content safely, stripping markdown block formatting if present.
 */
function parseJSONContent(text: string): any {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?/, '').replace(/```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

/**
 * Directly call the Gemini Interactions API
 */
async function draftAlertTextGemini(prompt: string): Promise<string> {
  if (!env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured.');
  }
  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta2/interactions',
    {
      model: 'gemini-3.6-flash',
      input: prompt
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY
      }
    }
  );

  const modelOutputStep = response.data.steps?.find((step: any) => step.type === 'model_output');
  if (!modelOutputStep || !modelOutputStep.content) {
    throw new Error('Interaction response did not contain a model_output step.');
  }
  
  const textParts = modelOutputStep.content
    .filter((part: any) => part.type === 'text')
    .map((part: any) => part.text);
    
  return textParts.join('').trim();
}

/**
 * Directly call the OpenRouter completions API
 */
async function draftAlertTextOpenRouter(prompt: string): Promise<string> {
  const apiKey = env.OPENROUTER_API_KEY || env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured.');
  }
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:4000',
        'X-Title': 'Scentinel'
      }
    }
  );

  const text = response.data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('OpenRouter did not return any content.');
  }

  return text.trim();
}

/**
 * Drafts an audio alert script for a lost dog with built-in auto-fallback between Gemini and OpenRouter.
 */
export async function draftAlertText(
  dogName: string,
  breed: string,
  size: string,
  lastSeenLocation: string,
  lastSeenTime: string,
  notes: string
): Promise<string> {
  const prompt = `
Draft a spoken alert script for a lost dog.
Dog Details:
- Name: ${dogName}
- Breed: ${breed}
- Size: ${size}
- Last Seen Location: ${lastSeenLocation}
- Last Seen Time: ${lastSeenTime}
- Owner Notes: ${notes || 'None'}

Constraints:
1. The script will be read by a text-to-speech engine to broadcast a neighborhood voice alert.
2. It must be urgent, clear, and highly concise (about 30 to 50 words).
3. Do not include any meta-text, conversational fillers, or surrounding quotes. Output only the spoken script.
`;

  // Try Gemini first, fallback to OpenRouter
  try {
    console.log('Attempting to draft alert text using Gemini (gemini-3.6-flash)...');
    return await draftAlertTextGemini(prompt);
  } catch (geminiError: any) {
    console.warn(`Gemini alert draft failed: ${geminiError.message}. Falling back to OpenRouter...`);
    try {
      return await draftAlertTextOpenRouter(prompt);
    } catch (openRouterError: any) {
      console.error('Both Gemini and OpenRouter failed to draft alert text.');
      throw new Error(`AI Alert Draft failed. Gemini error: ${geminiError.message}. OpenRouter error: ${openRouterError.message}`);
    }
  }
}

interface SightingMatchResult {
  dogId: string;
  confidence: number;
  reasoning: string;
}

/**
 * Performs image comparison via Gemini Interactions API
 */
async function compareSightingGemini(
  prompt: string,
  sightingImg: { data: string; mimeType: string },
  dogImg: { data: string; mimeType: string }
): Promise<any> {
  if (!env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured.');
  }
  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta2/interactions',
    {
      model: 'gemini-3.6-flash',
      input: [
        {
          type: 'image',
          mime_type: sightingImg.mimeType,
          data: sightingImg.data
        },
        {
          type: 'image',
          mime_type: dogImg.mimeType,
          data: dogImg.data
        },
        {
          type: 'text',
          text: prompt
        }
      ],
      response_format: [
        {
          type: 'text',
          mime_type: 'application/json',
          schema: {
            type: 'OBJECT',
            properties: {
              confidence: { type: 'INTEGER' },
              reasoning: { type: 'STRING' }
            },
            required: ['confidence', 'reasoning']
          }
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY
      }
    }
  );

  const modelOutputStep = response.data.steps?.find((step: any) => step.type === 'model_output');
  if (!modelOutputStep || !modelOutputStep.content) {
    throw new Error('Interaction response did not contain a model_output step.');
  }
  
  const textParts = modelOutputStep.content
    .filter((part: any) => part.type === 'text')
    .map((part: any) => part.text);
    
  const text = textParts.join('').trim();
  return parseJSONContent(text);
}

/**
 * Performs image comparison via OpenRouter API
 */
async function compareSightingOpenRouter(
  prompt: string,
  sightingImg: { data: string; mimeType: string },
  dogImg: { data: string; mimeType: string }
): Promise<any> {
  const apiKey = env.OPENROUTER_API_KEY || env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured.');
  }
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${sightingImg.mimeType};base64,${sightingImg.data}`
              }
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${dogImg.mimeType};base64,${dogImg.data}`
              }
            }
          ]
        }
      ],
      response_format: {
        type: 'json_object'
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:4000',
        'X-Title': 'Scentinel'
      }
    }
  );

  const jsonText = response.data?.choices?.[0]?.message?.content;
  if (!jsonText) {
    throw new Error('OpenRouter did not return any comparison content.');
  }

  return parseJSONContent(jsonText);
}

/**
 * Compares a sighting image against an active lost dog report with built-in auto-fallback.
 */
export async function compareSightingWithAlert(
  sightingPhotoUrl: string,
  dogId: string,
  dogPhotoUrl: string,
  dogName: string,
  dogBreed: string,
  dogSize: string
): Promise<SightingMatchResult> {
  console.log(`Comparing sighting (${sightingPhotoUrl}) with lost dog ${dogName} (${dogPhotoUrl})`);

  // Download both images in parallel
  const [sightingImg, dogImg] = await Promise.all([
    fetchImageAsBase64(sightingPhotoUrl),
    fetchImageAsBase64(dogPhotoUrl)
  ]);

  const prompt = `
Analyze and compare the two dog images provided:
- Image 1: A photo from a sighting of a stray dog.
- Image 2: The registered photo of the lost dog named "${dogName}" (Breed: ${dogBreed}, Size: ${dogSize}).

Task:
Determine whether the dog in Image 1 is the same dog as in Image 2. Focus on breed traits, color patterns, fur texture, facial structure, tail shape, markings, and other physical clues.

You MUST respond ONLY with a JSON object in this format:
{
  "confidence": <integer between 0 and 100>,
  "reasoning": "<a detailed explanation summarizing key matching points or differences>"
}
`;

  let result: any = null;
  let geminiErr: any = null;

  // 1. Attempt Gemini
  try {
    console.log('Attempting image comparison using Gemini (gemini-3.6-flash)...');
    result = await compareSightingGemini(prompt, sightingImg, dogImg);
  } catch (err: any) {
    geminiErr = err;
    console.warn(`Gemini comparison failed: ${err.message}. Falling back to OpenRouter...`);
  }

  // 2. Attempt OpenRouter fallback
  if (!result) {
    try {
      console.log('Attempting image comparison using OpenRouter (google/gemma-4-26b-a4b-it:free)...');
      result = await compareSightingOpenRouter(prompt, sightingImg, dogImg);
    } catch (openRouterErr: any) {
      console.error('Both Gemini and OpenRouter image comparison attempts failed.');
      return {
        dogId,
        confidence: 0,
        reasoning: `AI Comparison failed. Gemini: ${geminiErr.message}. OpenRouter: ${openRouterErr.message}`
      };
    }
  }

  return {
    dogId,
    confidence: typeof result?.confidence === 'number' ? result.confidence : 0,
    reasoning: result?.reasoning || 'No reasoning details provided by model.'
  };
}
