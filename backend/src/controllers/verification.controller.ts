import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { runVerification } from '../services/verification.service';
import { maskAadhaar } from '../utils/mask';

export const verifyCandidate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    const result = await runVerification(candidate);
    res.json({
      ...result,
      candidate: {
        ...result.candidate,
        aadhaarNumber: maskAadhaar(result.candidate.aadhaarNumber),
      },
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVerificationLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });

    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    const logs = await prisma.verificationLog.findMany({
      where: { candidateId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(logs);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
