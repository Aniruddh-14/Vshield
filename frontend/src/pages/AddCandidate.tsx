import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Candidate } from '../types';

interface FormData {
  name: string;
  email: string;
  phone: string;
  aadhaarNumber: string;
  panNumber: string;
  address: string;
}

const Field = ({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    {children}
    {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const AddCandidate = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post<Candidate>('/candidates', {
        ...data,
        phone: data.phone || undefined,
        address: data.address || undefined,
      });
      toast.success(`${res.data.name} added successfully!`);
      navigate(`/candidates/${res.data.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || 'Failed to add candidate.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/candidates"
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Candidate</h1>
          <p className="text-gray-500 text-sm mt-0.5">Enter candidate details for verification</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Full Name" error={errors.name?.message}>
              <input
                type="text"
                placeholder="John Doe"
                className={`input-field ${errors.name ? 'input-error' : ''}`}
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Minimum 2 characters' },
                })}
              />
            </Field>

            <Field label="Email Address" error={errors.email?.message}>
              <input
                type="email"
                placeholder="john@example.com"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                })}
              />
            </Field>
          </div>

          <Field label="Phone Number" hint="Optional" error={errors.phone?.message}>
            <input
              type="tel"
              placeholder="+91 9876543210"
              className={`input-field ${errors.phone ? 'input-error' : ''}`}
              {...register('phone')}
            />
          </Field>

          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Identity Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Aadhaar Number"
                hint="12-digit number — will be masked after saving"
                error={errors.aadhaarNumber?.message}
              >
                <input
                  type="text"
                  placeholder="123456789012"
                  maxLength={12}
                  className={`input-field font-mono ${errors.aadhaarNumber ? 'input-error' : ''}`}
                  {...register('aadhaarNumber', {
                    required: 'Aadhaar is required',
                    pattern: { value: /^\d{12}$/, message: 'Must be exactly 12 digits' },
                  })}
                />
              </Field>

              <Field
                label="PAN Number"
                hint="Format: ABCDE1234F"
                error={errors.panNumber?.message}
              >
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className={`input-field font-mono uppercase ${errors.panNumber ? 'input-error' : ''}`}
                  {...register('panNumber', {
                    required: 'PAN is required',
                    pattern: {
                      value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                      message: 'Invalid PAN format (e.g. ABCDE1234F)',
                    },
                    setValueAs: (v: string) => v.toUpperCase(),
                  })}
                />
              </Field>
            </div>
          </div>

          <Field label="Address" hint="Optional" error={errors.address?.message}>
            <textarea
              rows={3}
              placeholder="123, Main Street, City, State - 400001"
              className={`input-field resize-none ${errors.address ? 'input-error' : ''}`}
              {...register('address')}
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <Link to="/candidates" className="btn-secondary flex-1 justify-center">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              {loading ? 'Adding...' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidate;
