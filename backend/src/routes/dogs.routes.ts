import { Router, Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../services/supabase.service';
import { validateBody } from '../middleware/validateRequest';

const router = Router();

// Register a dog
router.post(
  '/',
  validateBody(['name', 'photo', 'breed', 'size', 'homeArea', 'ownerContact']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, photo, breed, size, homeArea, ownerContact } = req.body;
      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from('dogs')
        .insert({
          name,
          photo_url: photo,
          breed,
          size,
          home_area: homeArea,
          owner_contact: ownerContact,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

// Get dog by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      res.status(404).json({ error: { message: `Dog with ID ${id} not found`, statusCode: 404 } });
      return;
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get owner's dogs
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ownerId } = req.query; // For hackathon purposes, ownerId can just filter owner_contact or be a separate query field
    const supabase = getSupabaseClient();

    let query = supabase.from('dogs').select('*');
    
    if (ownerId) {
      // In a real app we would query by user metadata. For now, filter by owner_contact
      query = query.eq('owner_contact', ownerId as string);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
