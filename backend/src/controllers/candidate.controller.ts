import { Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma';
import { maskAadhaar } from '../utils/mask';
import { AuthRequest } from '../middleware/auth.middleware';

const candidateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  aadhaarNumber: z
    .string()
    .length(12, 'Aadhaar must be exactly 12 digits')
    .regex(/^\d{12}$/, 'Aadhaar must contain only digits'),
  panNumber: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN must match format ABCDE1234F'),
  address: z.string().optional(),
});

const formatCandidate = <T extends { aadhaarNumber: string }>(candidate: T): T => ({
  ...candidate,
  aadhaarNumber: maskAadhaar(candidate.aadhaarNumber),
});

export const createCandidate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = candidateSchema.parse(req.body);
    const candidate = await prisma.candidate.create({
      data: { ...data, userId: req.userId! },
    });
    res.status(201).json(formatCandidate(candidate));
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listCandidates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const search = (req.query.search as string)?.trim() || '';
    const status = req.query.status as string | undefined;

    const where = {
      userId: req.userId!,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { panNumber: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status: status as any }),
    };

    const [total, candidates] = await Promise.all([
      prisma.candidate.count({ where }),
      prisma.candidate.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      data: candidates.map(formatCandidate),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCandidate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, userId: req.userId! },
      include: { verificationLogs: { orderBy: { createdAt: 'asc' } } },
    });

    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    res.json(formatCandidate(candidate));
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCandidate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = candidateSchema.partial().parse(req.body);

    const existing = await prisma.candidate.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!existing) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    const updated = await prisma.candidate.update({
      where: { id: req.params.id },
      data,
    });

    res.json(formatCandidate(updated));
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: err.errors });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteCandidate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.candidate.findFirst({
      where: { id: req.params.id, userId: req.userId! },
    });
    if (!existing) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }

    await prisma.candidate.delete({ where: { id: req.params.id } });
    res.json({ message: 'Candidate deleted successfully' });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [total, verified, failed, pending, partial] = await Promise.all([
      prisma.candidate.count({ where: { userId: req.userId! } }),
      prisma.candidate.count({ where: { userId: req.userId!, status: 'VERIFIED' } }),
      prisma.candidate.count({ where: { userId: req.userId!, status: 'FAILED' } }),
      prisma.candidate.count({ where: { userId: req.userId!, status: 'PENDING' } }),
      prisma.candidate.count({ where: { userId: req.userId!, status: 'PARTIAL' } }),
    ]);

    const recent = await prisma.candidate.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    res.json({
      total,
      verified,
      failed,
      pending,
      partial,
      recent: recent.map(formatCandidate),
    });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
};
