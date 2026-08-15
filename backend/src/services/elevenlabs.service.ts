import axios from 'axios';
import { env } from '../config/env';
import { uploadBuffer } from './supabase.service';

const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam voice

function checkElevenLabsConfig() {
  if (!env.ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key is not configured. Please set ELEVENLABS_API_KEY in the environment.');
  }
}

/**
 * Direct Axios helper to call the ElevenLabs TTS API
 */
async function callTTS(text: string, voiceId: string): Promise<Buffer> {
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    },
    {
      headers: {
        'xi-api-key': env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    }
  );

  return Buffer.from(response.data);
}

/**
 * Calls ElevenLabs to convert text to speech, uploads the resulting MP3 to Supabase storage,
 * and returns the public audio URL. Supports dynamic fallback to whatever voice is available.
 */
export async function renderTextToSpeech(text: string, alertId: string): Promise<string> {
  checkElevenLabsConfig();

  console.log(`Generating speech for alert: ${alertId}`);

  let audioBuffer: Buffer;
  let voiceId = DEFAULT_VOICE_ID;

  try {
    // Attempt with default voice
    audioBuffer = await callTTS(text, voiceId);
  } catch (error: any) {
    console.warn(`Initial TTS attempt failed with voice '${voiceId}' (Error: ${error.message}). Attempting to fetch available fallback voices...`);
    
    try {
      const listResponse = await axios.get('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': env.ELEVENLABS_API_KEY }
      });
      const voices = listResponse.data?.voices;
      
      if (voices && voices.length > 0) {
        // Use the first available voice on the user's account (guaranteed to be compatible with their subscription tier)
        voiceId = voices[0].voice_id;
        console.log(`Retrying text-to-speech using fallback voice: '${voices[0].name}' (ID: ${voiceId})`);
        audioBuffer = await callTTS(text, voiceId);
      } else {
        throw new Error('No voices are configured or available on your ElevenLabs account.');
      }
    } catch (fallbackError: any) {
      console.error('ElevenLabs voice list lookup or fallback retry failed:', fallbackError.message);
      // Throw the original error or the fallback error
      throw new Error(`ElevenLabs TTS failed: ${error.response?.data?.toString() || error.message}`);
    }
  }

  // Save the audio buffer to Supabase Storage in public bucket 'voice-alerts'
  const fileName = `${alertId}.mp3`;
  console.log(`Uploading voice alert audio file to Supabase storage as ${fileName}`);
  const audioUrl = await uploadBuffer('voice-alerts', fileName, audioBuffer, 'audio/mpeg');

  return audioUrl;
}
