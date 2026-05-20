import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  createCandidate,
  listCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  getDashboardStats,
} from '../controllers/candidate.controller';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/', listCandidates);
router.post('/', createCandidate);
router.get('/:id', getCandidate);
router.put('/:id', updateCandidate);
router.delete('/:id', deleteCandidate);

export default router;
