import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, ShieldCheck, ShieldX, ShieldAlert,
  PlayCircle, FileText, Trash2, Loader2, CheckCircle2, XCircle,
  Mail, Phone, MapPin, CreditCard, Clock, Sparkles,
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

const CandidateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get<Candidate>(`/candidates/${id}`)
      .then((res) => setCandidate(res.data))
      .catch(() => toast.error('Failed to load candidate.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleVerify = async () => {
    if (!id) return;
    setVerifying(true);
    try {
      const res = await api.post<VerificationResult>(`/verify/${id}`);
      setCandidate({
        ...res.data.candidate,
        aadhaarNumber: maskAadhaar(res.data.candidate.aadhaarNumber),
      });
      if (res.data.finalStatus === 'VERIFIED') toast.success('All checks passed — candidate verified!');
      else if (res.data.finalStatus === 'FAILED') toast.error('Verification failed — all checks failed.');
      else toast('Partial verification — one check passed, one failed.', { icon: '⚠️' });
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

  const StatusIcon = () => {
    const cls = "w-8 h-8";
    if (candidate?.status === 'VERIFIED') return <ShieldCheck className={`${cls} text-emerald-500`} />;
    if (candidate?.status === 'FAILED') return <ShieldX className={`${cls} text-red-500`} />;
    if (candidate?.status === 'PARTIAL') return <ShieldAlert className={`${cls} text-orange-500`} />;
    return <Shield className={`${cls} text-gray-400`} />;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-5">
        {[...Array(3)].map((_, i) => <div key={i} className="card animate-pulse h-36" />)}
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
          <Link to="/candidates" className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
            <p className="text-gray-400 text-sm">Candidate Profile · ID {candidate.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/candidates/${id}/report`} className="btn-secondary">
            <FileText className="w-4 h-4" /> Report
          </Link>
          <button onClick={handleVerify} disabled={verifying} className="btn-primary">
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {verifying ? 'Verifying...' : 'Run Verification'}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="btn-danger !px-3">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal info */}
          <div className="card">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Email</p>
                  <p className="text-gray-900 font-semibold text-sm mt-0.5">{candidate.email}</p>
                </div>
              </div>
              {candidate.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Phone</p>
                    <p className="text-gray-900 font-semibold text-sm mt-0.5">{candidate.phone}</p>
                  </div>
                </div>
              )}
              {candidate.address && (
                <div className="flex items-start gap-3 sm:col-span-2">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Address</p>
                    <p className="text-gray-900 font-semibold text-sm mt-0.5">{candidate.address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Identity Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Aadhaar (Masked)', value: maskAadhaar(candidate.aadhaarNumber), color: 'bg-rose-50 text-rose-500' },
                { label: 'PAN Number', value: candidate.panNumber, color: 'bg-blue-50 text-blue-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="font-mono font-bold text-gray-900 text-sm mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="card">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Verification Timeline</h2>
            {!candidate.verificationLogs?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-slate-300" />
                </div>
                <p className="font-semibold text-gray-500 text-sm">No verifications run yet</p>
                <p className="text-xs text-gray-400 mt-1">Click "Run Verification" to start</p>
              </div>
            ) : (
              <div className="space-y-3">
                {candidate.verificationLogs.map((log) => (
                  <div key={log.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border ${
                      log.status === 'VERIFIED'
                        ? 'bg-emerald-50 border-emerald-100'
                        : 'bg-red-50 border-red-100'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${log.status === 'VERIFIED' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                      {log.status === 'VERIFIED'
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        : <XCircle className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-gray-900 text-sm">{log.checkType} Check</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${log.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs mt-1">{log.message}</p>
                      <p className="text-gray-400 text-xs mt-1.5">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <div className={`card text-center border-0 ${
            candidate.status === 'VERIFIED' ? 'bg-gradient-to-b from-emerald-50 to-white'
            : candidate.status === 'FAILED' ? 'bg-gradient-to-b from-red-50 to-white'
            : candidate.status === 'PARTIAL' ? 'bg-gradient-to-b from-orange-50 to-white'
            : 'bg-gradient-to-b from-slate-50 to-white'
          }`}>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Status</p>
            <div className="flex justify-center mb-3">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                candidate.status === 'VERIFIED' ? 'bg-emerald-100'
                : candidate.status === 'FAILED' ? 'bg-red-100'
                : candidate.status === 'PARTIAL' ? 'bg-orange-100'
                : 'bg-slate-100'
              }`}>
                <StatusIcon />
              </div>
            </div>
            <StatusBadge status={candidate.status} size="lg" />
            <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Added</span>
                <span className="font-semibold text-gray-700">{new Date(candidate.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Updated</span>
                <span className="font-semibold text-gray-700">{new Date(candidate.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <button onClick={handleVerify} disabled={verifying} className="btn-primary w-full">
            {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {verifying ? 'Running...' : 'Run Verification'}
          </button>

          <Link to={`/candidates/${id}/report`} className="btn-secondary w-full">
            <FileText className="w-4 h-4" /> View Report
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;
