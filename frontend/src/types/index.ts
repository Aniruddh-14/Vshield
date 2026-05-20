export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'FAILED' | 'PARTIAL';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface VerificationLog {
  id: string;
  candidateId: string;
  checkType: 'AADHAAR' | 'PAN';
  status: 'VERIFIED' | 'FAILED';
  message: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  aadhaarNumber: string;
  panNumber: string;
  address?: string;
  status: VerificationStatus;
  createdAt: string;
  updatedAt: string;
  verificationLogs?: VerificationLog[];
}

export interface DashboardStats {
  total: number;
  verified: number;
  failed: number;
  pending: number;
  partial: number;
  recent: Candidate[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface VerificationResult {
  candidate: Candidate;
  aadhaar: { status: 'VERIFIED' | 'FAILED'; message: string };
  pan: { status: 'VERIFIED' | 'FAILED'; message: string };
  finalStatus: VerificationStatus;
}
