import { Router, Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../services/supabase.service';
import { compareSightingWithAlert } from '../services/gemini.service';
import { writeMatchToChain } from '../services/solana.service';
import { validateBody } from '../middleware/validateRequest';

const router = Router();

// POST /sightings - Report a sighting and compare it to active alerts
router.post(
  '/sightings',
  validateBody(['photo', 'location']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { photo, location, notes } = req.body;
      const supabase = getSupabaseClient();

      // 1. Save the sighting record in Supabase
      const { data: sighting, error: sightingError } = await supabase
        .from('sightings')
        .insert({
          photo_url: photo,
          location,
          notes: notes || ''
        })
        .select()
        .single();

      if (sightingError || !sighting) {
        throw sightingError || new Error('Failed to create sighting record.');
      }

      console.log(`Sighting registered at ${location}. Fetching active lost alerts...`);

      // 2. Fetch all currently lost dogs
      const { data: lostDogs, error: lostDogsError } = await supabase
        .from('dogs')
        .select('*')
        .eq('status', 'lost');

      if (lostDogsError) {
        throw lostDogsError;
      }

      if (!lostDogs || lostDogs.length === 0) {
        console.log('No active lost dog alerts. Returning empty matches list.');
        res.json({ sightingId: sighting.id, matches: [] });
        return;
      }

      // 3. Compare sighting image against all active lost alerts in parallel
      console.log(`Comparing sighting with ${lostDogs.length} active lost dogs...`);
      const comparisonPromises = lostDogs.map(async (dog) => {
        const result = await compareSightingWithAlert(
          photo,
          dog.id,
          dog.photo_url,
          dog.name,
          dog.breed,
          dog.size
        );
        return {
          ...result,
          dog
        };
      });

      const comparisons = await Promise.all(comparisonPromises);

      // Filter matches to only include those with confidence > 0, and sort by confidence descending
      const rankedMatches = comparisons
        .filter(c => c.confidence >= 0)
        .sort((a, b) => b.confidence - a.confidence);

      // 4. Save the generated match candidates to the `matches` database table
      const matchInserts = rankedMatches.map(async (match) => {
        const { data: matchRecord, error: matchInsertError } = await supabase
          .from('matches')
          .insert({
            sighting_id: sighting.id,
            dog_id: match.dogId,
            confidence: match.confidence,
            reasoning: match.reasoning,
            confirmed: false
          })
          .select('*, dog:dogs(*)')
          .single();

        if (matchInsertError) {
          console.error(`Failed to insert match record for dog ${match.dogId}:`, matchInsertError.message);
          return null;
        }
        return matchRecord;
      });

      const savedMatches = (await Promise.all(matchInserts)).filter(Boolean);

      res.json({
        sightingId: sighting.id,
        matches: savedMatches
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /matches/:id/confirm - Confirm a match and write it to Solana devnet
router.post(
  '/matches/:id/confirm',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const supabase = getSupabaseClient();

      // 1. Fetch the match record
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', id)
        .single();

      if (matchError || !match) {
        res.status(404).json({ error: { message: `Match record ${id} not found.`, statusCode: 404 } });
        return;
      }

      if (match.confirmed) {
        res.status(400).json({ error: { message: `Match record ${id} is already confirmed.`, statusCode: 400 } });
        return;
      }

      console.log(`Confirming match ${id}. Fetching associated details...`);

      // 2. Write to Solana devnet
      let txHash = '';
      let explorerUrl = '';
      
      try {
        const chainRes = await writeMatchToChain(
          match.id,
          match.sighting_id,
          match.dog_id,
          match.confidence
        );
        txHash = chainRes.txHash;
        explorerUrl = chainRes.explorerUrl;
      } catch (chainError: any) {
        console.error('Solana devnet transaction failed:', chainError.message);
        throw new Error(`Blockchain verification failed: ${chainError.message}. Real Solana transaction is required to confirm.`);
      }

      // 3. Update the match as confirmed, store transaction details
      const { data: updatedMatch, error: updateMatchError } = await supabase
        .from('matches')
        .update({
          confirmed: true,
          tx_hash: txHash,
          explorer_url: explorerUrl
        })
        .eq('id', id)
        .select()
        .single();

      if (updateMatchError) {
        throw updateMatchError;
      }

      // 4. Update the dog status back to 'active' (found)
      const { error: updateDogError } = await supabase
        .from('dogs')
        .update({ status: 'active' })
        .eq('id', match.dog_id);

      if (updateDogError) {
        console.error(`Failed to update dog ${match.dog_id} status back to active:`, updateDogError.message);
      }

      res.json({
        txHash,
        explorerUrl,
        match: updatedMatch
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /matches/:id - Retrieve match + proof details
router.get('/matches/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*, dog:dogs(*), sighting:sightings(*)')
      .eq('id', id)
      .single();

    if (matchError || !match) {
      res.status(404).json({ error: { message: `Match record ${id} not found.`, statusCode: 404 } });
      return;
    }

    res.json(match);
  } catch (error) {
    next(error);
  }
});

export default router;
