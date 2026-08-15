import { Router, Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../services/supabase.service';
import { draftAlertText } from '../services/gemini.service';
import { renderTextToSpeech } from '../services/elevenlabs.service';
import { validateBody } from '../middleware/validateRequest';

const router = Router();

// Toggle a dog to lost and generate audio alert broadcast
router.post(
  '/dogs/:id/lost',
  validateBody(['lastSeenLocation', 'lastSeenTime', 'notes']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { lastSeenLocation, lastSeenTime, notes } = req.body;
      const supabase = getSupabaseClient();

      // 1. Fetch the dog details
      const { data: dog, error: dogError } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', id)
        .single();

      if (dogError || !dog) {
        res.status(404).json({ error: { message: `Dog with ID ${id} not found`, statusCode: 404 } });
        return;
      }

      console.log(`Reporting dog ${dog.name} as lost.`);

      // 2. Draft alert text using Gemini
      const alertText = await draftAlertText(
        dog.name,
        dog.breed,
        dog.size,
        lastSeenLocation,
        lastSeenTime,
        notes
      );

      // Create a temporary UUID or ID for the alert to use as filename
      // Let's perform the insert first so we have the alert ID!
      // This is a great design pattern since we need the alertId for ElevenLabs service's filename.
      
      // Update dog status to 'lost'
      const { error: updateError } = await supabase
        .from('dogs')
        .update({ status: 'lost' })
        .eq('id', id);

      if (updateError) {
        throw updateError;
      }

      // Insert alert with draft text first, audio_url will be updated next
      const { data: alert, error: alertError } = await supabase
        .from('alerts')
        .insert({
          dog_id: id,
          last_seen_location: lastSeenLocation,
          last_seen_time: lastSeenTime,
          notes,
          alert_text: alertText,
          audio_url: '' // Will update in next step
        })
        .select()
        .single();

      if (alertError || !alert) {
        throw alertError || new Error('Failed to create alert record.');
      }

      // 3. Render ElevenLabs audio alert
      let audioUrl = '';
      try {
        audioUrl = await renderTextToSpeech(alertText, alert.id);
        
        // 4. Update alert with audio_url
        await supabase
          .from('alerts')
          .update({ audio_url: audioUrl })
          .eq('id', alert.id);
      } catch (ttsError: any) {
        console.error('TTS synthesis or upload failed, proceeding with empty audio URL:', ttsError.message);
        // We will keep audio_url empty but won't crash so the user gets the text alert
      }

      res.status(201).json({
        alertId: alert.id,
        text: alertText,
        audioUrl: audioUrl || null
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get public alert details (including joined dog info)
router.get('/alerts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { data: alert, error: alertError } = await supabase
      .from('alerts')
      .select('*, dog:dogs(*)')
      .eq('id', id)
      .single();

    if (alertError || !alert) {
      res.status(404).json({ error: { message: `Alert with ID ${id} not found`, statusCode: 404 } });
      return;
    }

    res.json(alert);
  } catch (error) {
    next(error);
  }
});

// Get all active lost alerts (used in the UI and during sighting comparison)
router.get('/alerts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const supabase = getSupabaseClient();

    // Query alerts joining dog information where dog.status = 'lost'
    const { data: alerts, error: alertsError } = await supabase
      .from('alerts')
      .select('*, dog:dogs(*)')
      .order('created_at', { ascending: false });

    if (alertsError) {
      throw alertsError;
    }

    // Filter to only include alerts for currently lost dogs
    const activeAlerts = (alerts || []).filter(alert => alert.dog && alert.dog.status === 'lost');

    res.json(activeAlerts);
  } catch (error) {
    next(error);
  }
});

export default router;
