export const maskAadhaar = (aadhaar: string): string => {
  const digits = aadhaar.replace(/\D/g, '');
  if (digits.length !== 12) return aadhaar;
  return `XXXX-XXXX-${digits.slice(-4)}`;
};
