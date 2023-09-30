import express from 'express';
import {
  updateTour,
  deleteTour,
  createTour,
  getTour,
  getTours,
  getToursByUser,
  getToursBySearch,
  getToursByTag,
  getRelatedTours,
  likeTour,
} from '../controllers/tour.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.patch('/like/:id', auth, likeTour);
router.get('/search', getToursBySearch);
router.get('/tag/:tag', getToursByTag);
router.post('/relatedTours', getRelatedTours);
router.get('/userTours/:id', auth, getToursByUser);
router.get('/:id', getTour);
router.get('/', getTours);

router.patch('/:id', auth, updateTour);
router.delete('/:id', auth, deleteTour);
router.post('/', auth, createTour);

export default router;
