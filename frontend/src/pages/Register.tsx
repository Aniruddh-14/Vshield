import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { AuthResponse } from '../types';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(res.data.token, res.data.user);
      toast.success('Account created! Welcome to VShield.');
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl shadow-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">VShield</span>
        </div>

        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Start verifying<br />in minutes
          </h2>
          <div className="space-y-3">
            {[
              'Instant Aadhaar & PAN verification',
              'Detailed audit logs for every check',
              'Professional PDF-ready reports',
              'Secure, masked identity data',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
                <p className="text-indigo-200/80 text-sm">{item}</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 mt-2">Get started with VShield for free</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="John Doe"
                    className={`input-field pl-10 ${errors.name ? 'input-error' : ''}`}
                    {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                  />
                </div>
                {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" placeholder="you@example.com"
                    className={`input-field pl-10 ${errors.email ? 'input-error' : ''}`}
                    {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                  />
                </div>
                {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" placeholder="Min. 8 characters"
                    className={`input-field pl-10 ${errors.password ? 'input-error' : ''}`}
                    {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" placeholder="••••••••"
                    className={`input-field pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (val) => val === watch('password') || 'Passwords do not match',
                    })}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
