import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Shield, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../api/axios';
import { Candidate } from '../types';
import { StatusBadge } from '../components/StatusBadge';

const VerificationReport = () => {
  const { id } = useParams<{ id: string }>();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Candidate>(`/candidates/${id}`).then((res) => {
      setCandidate(res.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card animate-pulse h-96" />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <p className="text-gray-500">Candidate not found.</p>
      </div>
    );
  }

  const aadhaarLog = candidate.verificationLogs?.find((l) => l.checkType === 'AADHAAR');
  const panLog = candidate.verificationLogs?.find((l) => l.checkType === 'PAN');

  const CheckRow = ({
    label,
    log,
  }: {
    label: string;
    log?: { status: string; message: string; createdAt: string };
  }) => (
    <tr className="border-b border-gray-100">
      <td className="py-4 pr-6">
        <span className="font-medium text-gray-900">{label}</span>
      </td>
      <td className="py-4 pr-6">
        {log ? (
          <div className="flex items-center gap-2">
            {log.status === 'VERIFIED' ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <span
              className={`text-sm font-semibold ${
                log.status === 'VERIFIED' ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {log.status}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Not Run</span>
          </div>
        )}
      </td>
      <td className="py-4 pr-6 text-sm text-gray-500">{log?.message || '—'}</td>
      <td className="py-4 text-sm text-gray-400">
        {log ? new Date(log.createdAt).toLocaleString() : '—'}
      </td>
    </tr>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <Link to={`/candidates/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
        <button
          onClick={() => window.print()}
          className="btn-secondary"
        >
          <Printer className="w-4 h-4" />
          Print / Export PDF
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm print:shadow-none print:rounded-none print:border-0">
        {/* Report header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">VShield</h1>
                <p className="text-indigo-200 text-sm">Background Verification Report</p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-indigo-200">Report Generated</p>
              <p className="font-medium">{new Date().toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 space-y-6">
          {/* Status banner */}
          <div
            className={`flex items-center justify-between p-4 rounded-xl border ${
              candidate.status === 'VERIFIED'
                ? 'bg-green-50 border-green-200'
                : candidate.status === 'FAILED'
                ? 'bg-red-50 border-red-200'
                : candidate.status === 'PARTIAL'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div>
              <p className="text-sm font-medium text-gray-700">Overall Verification Status</p>
              <p className="text-xs text-gray-500 mt-0.5">Based on Aadhaar and PAN checks</p>
            </div>
            <StatusBadge status={candidate.status} />
          </div>

          {/* Candidate info */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Candidate Information
            </h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="text-gray-500">Full Name</span>
                <p className="font-medium text-gray-900 mt-0.5">{candidate.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Email Address</span>
                <p className="font-medium text-gray-900 mt-0.5">{candidate.email}</p>
              </div>
              {candidate.phone && (
                <div>
                  <span className="text-gray-500">Phone</span>
                  <p className="font-medium text-gray-900 mt-0.5">{candidate.phone}</p>
                </div>
              )}
              {candidate.address && (
                <div className="col-span-2">
                  <span className="text-gray-500">Address</span>
                  <p className="font-medium text-gray-900 mt-0.5">{candidate.address}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Aadhaar (Masked)</span>
                <p className="font-mono font-medium text-gray-900 mt-0.5">{candidate.aadhaarNumber}</p>
              </div>
              <div>
                <span className="text-gray-500">PAN Number</span>
                <p className="font-mono font-medium text-gray-900 mt-0.5">{candidate.panNumber}</p>
              </div>
            </div>
          </div>

          {/* Verification checks */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Verification Checks
            </h2>
            {!candidate.verificationLogs?.length ? (
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <Clock className="w-4 h-4 flex-shrink-0" />
                No verification checks have been run for this candidate.
              </div>
            ) : (
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide pb-2 pr-6">Check</th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide pb-2 pr-6">Result</th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide pb-2 pr-6">Details</th>
                      <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide pb-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <CheckRow label="Aadhaar Verification" log={aadhaarLog} />
                    <CheckRow label="PAN Verification" log={panLog} />
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
            <span>VShield Background Verification Platform • Confidential</span>
            <span>Candidate ID: {candidate.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationReport;
