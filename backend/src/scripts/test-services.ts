import { getSupabaseClient } from '../services/supabase.service';
import { draftAlertText, compareSightingWithAlert } from '../services/gemini.service';
import { renderTextToSpeech } from '../services/elevenlabs.service';
import { writeMatchToChain } from '../services/solana.service';
import { env } from '../config/env';

async function testSupabase() {
  console.log('\n--- Testing Supabase Connection ---');
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.from('dogs').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✔ Supabase connection successful. Dog count query complete:', data);
  } catch (err: any) {
    console.error('❌ Supabase test failed:', err.message);
  }
}

async function testGemini() {
  console.log('\n--- Testing Gemini AI Services ---');
  try {
    console.log('Testing draftAlertText...');
    const alertScript = await draftAlertText(
      'Buddy',
      'Golden Retriever',
      'Large',
      'Central Park near the fountain',
      '10:30 AM today',
      'Friendly, wearing a blue collar.'
    );
    console.log('✔ Alert draft generated successfully:\n', alertScript);

    console.log('\nTesting compareSightingWithAlert...');
    // We will use public placeholder images to perform the comparison
    const result = await compareSightingWithAlert(
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200', // Sighting: dog
      'test-dog-uuid',
      'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=200', // Target: dog (same)
      'Buddy',
      'Golden Retriever',
      'Large'
    );
    console.log('✔ Gemini comparison completed:');
    console.log('  Confidence:', result.confidence);
    console.log('  Reasoning:', result.reasoning);
  } catch (err: any) {
    console.error('❌ Gemini test failed:', err.message);
  }
}

async function testElevenLabs() {
  console.log('\n--- Testing ElevenLabs TTS ---');
  try {
    const text = 'Alert! Buddy, a large Golden Retriever, is missing near Central Park. Please report sightings.';
    const alertId = 'test-alert-id-' + Math.floor(Math.random() * 10000);
    console.log('Generating TTS audio for text and uploading to Supabase...');
    const audioUrl = await renderTextToSpeech(text, alertId);
    console.log('✔ ElevenLabs TTS succeeded. Audio URL:', audioUrl);
  } catch (err: any) {
    console.error('❌ ElevenLabs test failed:', err.message);
  }
}

async function testSolana() {
  console.log('\n--- Testing Solana Devnet Memo Write ---');
  try {
    const matchId = 'test-match-uuid';
    const sightingId = 'test-sighting-uuid';
    const dogId = 'test-dog-uuid';
    const confidence = 95;
    
    console.log('Attempting to write memo on Solana devnet...');
    const tx = await writeMatchToChain(matchId, sightingId, dogId, confidence);
    console.log('✔ Solana Transaction logged successfully!');
    console.log('  Tx Hash:', tx.txHash);
    console.log('  Explorer URL:', tx.explorerUrl);
  } catch (err: any) {
    console.error('❌ Solana test failed:', err.message);
  }
}

async function run() {
  console.log('Starting Scentinel Backend Integration Service Verification...');
  console.log('Config loaded. Port:', env.PORT);

  const testType = process.argv[2];

  if (testType === 'supabase') {
    await testSupabase();
  } else if (testType === 'gemini') {
    await testGemini();
  } else if (testType === 'elevenlabs') {
    await testElevenLabs();
  } else if (testType === 'solana') {
    await testSolana();
  } else {
    console.log('\nRunning all integration tests sequentially...');
    await testSupabase();
    await testGemini();
    await testElevenLabs();
    await testSolana();
  }
  
  console.log('\nVerification run finished.');
}

run().catch(console.error);
