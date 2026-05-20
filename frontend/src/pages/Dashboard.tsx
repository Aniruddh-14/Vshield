import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckCircle, XCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { DashboardStats, Candidate } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useAuthStore } from '../store/authStore';

const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="card flex items-center gap-4">
    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

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
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Here's an overview of your verification activity.
          </p>
        </div>
        <Link to="/candidates/new" className="btn-primary">
          <span className="text-lg leading-none">+</span>
          Add Candidate
        </Link>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Candidates"
            value={stats?.total ?? 0}
            icon={Users}
            color="bg-indigo-100 text-indigo-600"
          />
          <StatCard
            label="Verified"
            value={stats?.verified ?? 0}
            icon={CheckCircle}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            label="Pending"
            value={stats?.pending ?? 0}
            icon={Clock}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            label="Failed"
            value={stats?.failed ?? 0}
            icon={XCircle}
            color="bg-red-100 text-red-600"
          />
        </div>
      )}

      {/* Partial alert */}
      {(stats?.partial ?? 0) > 0 && (
        <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-orange-500" />
          <span>
            <strong>{stats?.partial}</strong> candidate{stats?.partial === 1 ? ' has' : 's have'} a
            partial verification status — one check passed, one failed.
          </span>
        </div>
      )}

      {/* Recent candidates */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">Recent Candidates</h2>
          <Link
            to="/candidates"
            className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!stats?.recent?.length ? (
          <div className="text-center py-10 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No candidates yet. Add your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide pb-3 pl-6">
                    Name
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide pb-3">
                    Email
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide pb-3">
                    PAN
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wide pb-3">
                    Status
                  </th>
                  <th className="pb-3 pr-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recent.map((c: Candidate) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pl-6 font-medium text-gray-900">{c.name}</td>
                    <td className="py-3 text-gray-500">{c.email}</td>
                    <td className="py-3 font-mono text-gray-600 text-xs">{c.panNumber}</td>
                    <td className="py-3">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                    <td className="py-3 pr-6 text-right">
                      <Link
                        to={`/candidates/${c.id}`}
                        className="text-indigo-600 hover:text-indigo-700 font-medium text-xs"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
