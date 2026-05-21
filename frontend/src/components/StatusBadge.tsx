import { VerificationStatus } from '../types';

const config: Record<VerificationStatus, { label: string; className: string; dot: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 ring-amber-200/80',
    dot: 'bg-amber-400',
  },
  VERIFIED: {
    label: 'Verified',
    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
    dot: 'bg-emerald-500',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-50 text-red-700 ring-red-200/80',
    dot: 'bg-red-500',
  },
  PARTIAL: {
    label: 'Partial',
    className: 'bg-orange-50 text-orange-700 ring-orange-200/80',
    dot: 'bg-orange-400',
  },
};

interface Props {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = ({ status, size = 'md' }: Props) => {
  const { label, className, dot } = config[status] ?? config.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 ring-inset font-semibold ${className} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' :
        size === 'lg' ? 'px-3.5 py-1.5 text-sm' :
        'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`rounded-full flex-shrink-0 ${dot} ${size === 'lg' ? 'h-2 w-2' : 'h-1.5 w-1.5'}`} />
      {label}
    </span>
  );
};
