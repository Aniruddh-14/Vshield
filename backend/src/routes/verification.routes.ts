import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { verifyCandidate, getVerificationLogs } from '../controllers/verification.controller';

const router = Router();

router.use(authenticate);

router.post('/:id', verifyCandidate);
router.get('/:id/logs', getVerificationLogs);

export default router;
