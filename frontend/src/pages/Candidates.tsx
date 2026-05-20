import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, UserPlus, ChevronLeft, ChevronRight, Trash2, Eye } from 'lucide-react';
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
        page: String(page),
        limit: '10',
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
    const debounce = setTimeout(fetchCandidates, 300);
    return () => clearTimeout(debounce);
  }, [fetchCandidates]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name} and all their verification data?`)) return;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {data ? `${data.total} total candidate${data.total !== 1 ? 's' : ''}` : 'Loading...'}
          </p>
        </div>
        <Link to="/candidates/new" className="btn-primary">
          <UserPlus className="w-4 h-4" />
          Add Candidate
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  status === f.value
                    ? 'bg-indigo-600 text-white'
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
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : !data?.data.length ? (
          <div className="text-center py-16 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-gray-500">No candidates found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3 pl-6">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3">Email</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3 hidden md:table-cell">Aadhaar</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3 hidden md:table-cell">PAN</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide py-3 hidden lg:table-cell">Added</th>
                  <th className="py-3 pr-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.data.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/candidates/${c.id}`)}
                  >
                    <td className="py-3.5 pl-6 font-medium text-gray-900">{c.name}</td>
                    <td className="py-3.5 text-gray-500">{c.email}</td>
                    <td className="py-3.5 font-mono text-gray-600 text-xs hidden md:table-cell">{c.aadhaarNumber}</td>
                    <td className="py-3.5 font-mono text-gray-600 text-xs hidden md:table-cell">{c.panNumber}</td>
                    <td className="py-3.5">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/candidates/${c.id}`}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id, c.name)}
                          disabled={deletingId === c.id}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Delete"
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
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Page {data.page} of {data.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="btn-secondary px-3 py-1.5 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === data.totalPages}
                className="btn-secondary px-3 py-1.5 disabled:opacity-40"
              >
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
