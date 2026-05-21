import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserPlus, ChevronLeft, ChevronRight, Trash2, Eye, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Candidate, PaginatedResponse, VerificationStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';

const STATUS_FILTERS: { label: string; value: VerificationStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Verified', value: 'VERIFIED' },
  { label: 'Failed', value: 'FAILED' },
  { label: 'Partial', value: 'PARTIAL' },
];

const avatarColors = [
  'from-indigo-400 to-violet-500',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-blue-400 to-cyan-500',
];

const Candidates = () => {
  const [data, setData] = useState<PaginatedResponse<Candidate> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<VerificationStatus | ''>('');
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), limit: '10',
        ...(search && { search }),
        ...(status && { status }),
      });
      const res = await api.get<PaginatedResponse<Candidate>>(`/candidates?${params}`);
      setData(res.data);
    } catch {
      toast.error('Failed to load candidates.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const t = setTimeout(fetchCandidates, 300);
    return () => clearTimeout(t);
  }, [fetchCandidates]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} permanently?`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/candidates/${id}`);
      toast.success(`${name} deleted.`);
      fetchCandidates();
    } catch {
      toast.error('Failed to delete candidate.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 mt-1">
            {data ? `${data.total} total candidate${data.total !== 1 ? 's' : ''}` : 'Loading...'}
          </p>
        </div>
        <Link to="/candidates/new" className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Add Candidate
        </Link>
      </div>

      {/* Search + filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or PAN..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input-field pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => { setStatus(f.value); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  status === f.value
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-5">
              <Users className="w-9 h-9 text-slate-300" />
            </div>
            <p className="font-bold text-gray-600 text-lg">No candidates found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/80">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 pl-6">Candidate</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 hidden md:table-cell">Aadhaar</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 hidden md:table-cell">PAN</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider py-3.5 hidden lg:table-cell">Added</th>
                  <th className="py-3.5 pr-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((c, i) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/candidates/${c.id}`)}
                  >
                    <td className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm`}>
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                          <p className="text-xs text-gray-400 truncate">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{c.aadhaarNumber}</span>
                    </td>
                    <td className="py-4 hidden md:table-cell">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{c.panNumber}</span>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-4 text-xs text-gray-400 hidden lg:table-cell">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/candidates/${c.id}`}
                          className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={deletingId === c.id}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-slate-50/60">
            <p className="text-sm text-gray-500">
              Showing <strong>{(page - 1) * 10 + 1}–{Math.min(page * 10, data.total)}</strong> of <strong>{data.total}</strong>
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
                className="btn-secondary px-3 py-2 disabled:opacity-40 text-sm">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page === data.totalPages}
                className="btn-secondary px-3 py-2 disabled:opacity-40 text-sm">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Candidates;
