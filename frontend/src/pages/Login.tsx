import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { AuthResponse } from '../types';

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/login', data);
      setAuth(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(' ')[0]}!`);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl shadow-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">VShield</span>
          </div>
        </div>

        <div className="relative space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Verify candidates<br />with confidence
            </h2>
            <p className="text-indigo-200/70 text-lg leading-relaxed">
              Instant Aadhaar and PAN verification, audit logs, and professional reports — all in one platform.
            </p>
          </div>
          <div className="flex gap-4">
            {[
              { label: 'Verifications', value: '10K+' },
              { label: 'Accuracy', value: '99.9%' },
              { label: 'Uptime', value: '24/7' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/8 rounded-2xl px-4 py-3 border border-white/10">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-indigo-300/60 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-indigo-300/40 text-xs">© 2026 VShield. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Shield className="w-6 h-6 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">VShield</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={`input-field pl-10 ${errors.email ? 'input-error' : ''}`}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                    })}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className={`input-field pl-10 ${errors.password ? 'input-error' : ''}`}
                    {...register('password', { required: 'Password is required' })}
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
