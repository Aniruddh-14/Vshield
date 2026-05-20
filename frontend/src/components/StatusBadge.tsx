import { VerificationStatus } from '../types';

const config: Record<VerificationStatus, { label: string; className: string; dot: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-50 text-yellow-800 ring-yellow-200',
    dot: 'bg-yellow-500',
  },
  VERIFIED: {
    label: 'Verified',
    className: 'bg-green-50 text-green-800 ring-green-200',
    dot: 'bg-green-500',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-50 text-red-800 ring-red-200',
    dot: 'bg-red-500',
  },
  PARTIAL: {
    label: 'Partial',
    className: 'bg-orange-50 text-orange-800 ring-orange-200',
    dot: 'bg-orange-500',
  },
};

interface Props {
  status: VerificationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge = ({ status, size = 'md' }: Props) => {
  const { label, className, dot } = config[status] ?? config.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ring-1 ring-inset font-medium ${className} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};
