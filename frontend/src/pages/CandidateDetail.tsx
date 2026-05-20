import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  ShieldX,
  ShieldAlert,
  PlayCircle,
  FileText,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Candidate, VerificationResult } from '../types';
import { StatusBadge } from '../components/StatusBadge';

const maskAadhaar = (value: string): string => {
  if (/^XXXX/.test(value)) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.length === 12) return `XXXX-XXXX-${digits.slice(-4)}`;
  return value;
};

const statusIcon = (status: string) => {
  if (status === 'VERIFIED') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
};

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchCandidate = async () => {
    try {
      const res = await api.get<Candidate>(`/candidates/${id}`);
      setCandidate(res.data);
    } catch {
      toast.error('Failed to load candidate.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const handleVerify = async () => {
    if (!id) return;
    setVerifying(true);
    try {
      const res = await api.post<VerificationResult>(`/verify/${id}`);
      const updated: Candidate = {
        ...res.data.candidate,
        aadhaarNumber: maskAadhaar(res.data.candidate.aadhaarNumber),
      };
      setCandidate(updated);

      if (res.data.finalStatus === 'VERIFIED') {
        toast.success('Verification complete — all checks passed!');
      } else if (res.data.finalStatus === 'FAILED') {
        toast.error('Verification failed — all checks failed.');
      } else {
        toast('Partial verification — one check passed, one failed.', { icon: '⚠️' });
      }
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this candidate permanently?')) return;
    setDeleting(true);
    try {
      await api.delete(`/candidates/${id}`);
      toast.success('Candidate deleted.');
      navigate('/candidates');
    } catch {
      toast.error('Failed to delete candidate.');
      setDeleting(false);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'VERIFIED') return <ShieldCheck className="w-6 h-6 text-green-500" />;
    if (status === 'FAILED') return <ShieldX className="w-6 h-6 text-red-500" />;
    if (status === 'PARTIAL') return <ShieldAlert className="w-6 h-6 text-orange-500" />;
    return <Shield className="w-6 h-6 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card animate-pulse h-32" />
        ))}
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-gray-500">Candidate not found.</p>
        <Link to="/candidates" className="btn-primary mt-4 inline-flex">Back to list</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/candidates" className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
            <p className="text-gray-500 text-sm">Candidate Profile</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/candidates/${id}/report`} className="btn-secondary">
            <FileText className="w-4 h-4" />
            Report
          </Link>
          <button onClick={handleVerify} disabled={verifying} className="btn-primary">
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {verifying ? 'Verifying...' : 'Run Verification'}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger px-3">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-gray-900 font-medium">{candidate.email}</p>
                </div>
              </div>
              {candidate.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Phone</p>
                    <p className="text-gray-900 font-medium">{candidate.phone}</p>
                  </div>
                </div>
              )}
              {candidate.address && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs">Address</p>
                    <p className="text-gray-900 font-medium">{candidate.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Identity Documents
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs">Aadhaar (Masked)</p>
                  <p className="text-gray-900 font-mono font-medium">
                    {maskAadhaar(candidate.aadhaarNumber)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="w-4 h-4 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs">PAN Number</p>
                  <p className="text-gray-900 font-mono font-medium">{candidate.panNumber}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Timeline */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Verification Timeline
            </h2>
            {!candidate.verificationLogs?.length ? (
              <div className="text-center py-8 text-gray-400">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No verifications run yet.</p>
                <p className="text-xs mt-1">Click "Run Verification" to start.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidate.verificationLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-3 p-3 rounded-lg text-sm border ${
                      log.status === 'VERIFIED'
                        ? 'bg-green-50 border-green-100'
                        : 'bg-red-50 border-red-100'
                    }`}
                  >
                    {statusIcon(log.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-gray-900">{log.checkType} Check</span>
                        <span className={`text-xs font-medium ${log.status === 'VERIFIED' ? 'text-green-700' : 'text-red-700'}`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs mt-0.5">{log.message}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — status */}
        <div>
          <div className="card text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
              Verification Status
            </p>
            <div className="flex justify-center mb-3">
              <StatusIcon status={candidate.status} />
            </div>
            <StatusBadge status={candidate.status} />
            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400 space-y-1">
              <p>Added {new Date(candidate.createdAt).toLocaleDateString()}</p>
              <p>Updated {new Date(candidate.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
