import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Clock, TrendingUp, ArrowRight, Plus, AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import { DashboardStats, Candidate } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuthStore } from '../store/authStore';

const statCards = (stats: DashboardStats) => [
  {
    label: 'Total Candidates',
    value: stats.total,
    icon: Users,
    gradient: 'from-indigo-500 to-violet-600',
    text: 'text-indigo-600',
    shadow: 'shadow-indigo-500/20',
  },
  {
    label: 'Verified',
    value: stats.verified,
    icon: CheckCircle,
    gradient: 'from-emerald-500 to-teal-600',
    text: 'text-emerald-600',
    shadow: 'shadow-emerald-500/20',
  },
  {
    label: 'Pending',
    value: stats.pending,
    icon: Clock,
    gradient: 'from-amber-500 to-orange-500',
    text: 'text-amber-600',
    shadow: 'shadow-amber-500/20',
  },
  {
    label: 'Failed',
    value: stats.failed,
    icon: XCircle,
    gradient: 'from-red-500 to-rose-600',
    text: 'text-red-600',
    shadow: 'shadow-red-500/20',
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    api.get<DashboardStats>('/candidates/stats').then((res) => {
      setStats(res.data);
      setLoading(false);
    });
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const verifiedPct = stats && stats.total > 0
    ? Math.round((stats.verified / stats.total) * 100)
    : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-600 mb-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-3xl font-bold text-gray-900">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">Here's your verification activity overview.</p>
        </div>
        <Link to="/candidates/new" className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Candidate
        </Link>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards(stats!).map(({ label, value, icon: Icon, gradient, text, shadow }) => (
            <div key={label} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg ${shadow}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              {label === 'Verified' && stats!.total > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Success rate</span>
                    <span className={`text-xs font-semibold ${text}`}>{verifiedPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
                      style={{ width: `${verifiedPct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Partial warning */}
      {(stats?.partial ?? 0) > 0 && (
        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-sm text-orange-800">
          <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          </div>
          <p>
            <strong>{stats?.partial}</strong> candidate{stats?.partial === 1 ? ' has' : 's have'} partial verification — one check passed, one failed. Review required.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent candidates */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Candidates</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest additions to your pipeline</p>
            </div>
            <Link to="/candidates" className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {!stats?.recent?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-indigo-300" />
              </div>
              <p className="font-semibold text-gray-600">No candidates yet</p>
              <p className="text-sm text-gray-400 mt-1 mb-4">Add your first candidate to get started</p>
              <Link to="/candidates/new" className="btn-primary text-xs px-3 py-1.5">
                <Plus className="w-3.5 h-3.5" /> Add Candidate
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.recent.map((c: Candidate) => (
                <Link
                  key={c.id}
                  to={`/candidates/${c.id}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-600 text-sm font-bold flex-shrink-0">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={c.status} size="sm" />
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats sidebar */}
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-indigo-600 to-violet-700 text-white border-0">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-200" />
              <p className="text-sm font-semibold text-indigo-100">Verification Rate</p>
            </div>
            <p className="text-5xl font-bold">{verifiedPct}<span className="text-2xl text-indigo-200">%</span></p>
            <p className="text-indigo-200 text-sm mt-1">of candidates verified</p>
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${verifiedPct}%` }}
              />
            </div>
          </div>

          <div className="card">
            <p className="text-sm font-bold text-gray-700 mb-4">Status Breakdown</p>
            <div className="space-y-3">
              {[
                { label: 'Verified', value: stats?.verified ?? 0, color: 'bg-emerald-500' },
                { label: 'Pending', value: stats?.pending ?? 0, color: 'bg-amber-400' },
                { label: 'Partial', value: stats?.partial ?? 0, color: 'bg-orange-400' },
                { label: 'Failed', value: stats?.failed ?? 0, color: 'bg-red-500' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                  <span className="text-sm text-gray-600 flex-1">{label}</span>
                  <span className="text-sm font-bold text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
