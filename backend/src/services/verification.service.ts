import prisma from '../lib/prisma';

type VerifyResult = { status: 'VERIFIED' | 'FAILED'; message: string };

const mockAadhaarVerify = (aadhaarNumber: string): VerifyResult => {
  if (!/^\d{12}$/.test(aadhaarNumber)) {
    return { status: 'FAILED', message: 'Invalid Aadhaar format: must be exactly 12 digits' };
  }
  if (aadhaarNumber.endsWith('0000')) {
    return { status: 'FAILED', message: 'Aadhaar number not found in UIDAI database' };
  }
  return { status: 'VERIFIED', message: 'Aadhaar verified successfully via UIDAI mock API' };
};

const mockPanVerify = (panNumber: string): VerifyResult => {
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber)) {
    return { status: 'FAILED', message: 'Invalid PAN format: must match pattern ABCDE1234F' };
  }
  if (panNumber.startsWith('ZZZZZ')) {
    return { status: 'FAILED', message: 'PAN not found in Income Tax Department database' };
  }
  return { status: 'VERIFIED', message: 'PAN verified successfully via Income Tax Dept. mock API' };
};

export const runVerification = async (candidate: {
  id: string;
  aadhaarNumber: string;
  panNumber: string;
}) => {
  const aadhaarResult = mockAadhaarVerify(candidate.aadhaarNumber);
  const panResult = mockPanVerify(candidate.panNumber);

  await prisma.verificationLog.deleteMany({ where: { candidateId: candidate.id } });

  await prisma.verificationLog.createMany({
    data: [
      {
        candidateId: candidate.id,
        checkType: 'AADHAAR',
        status: aadhaarResult.status,
        message: aadhaarResult.message,
      },
      {
        candidateId: candidate.id,
        checkType: 'PAN',
        status: panResult.status,
        message: panResult.message,
      },
    ],
  });

  let finalStatus: 'VERIFIED' | 'FAILED' | 'PARTIAL';
  if (aadhaarResult.status === 'VERIFIED' && panResult.status === 'VERIFIED') {
    finalStatus = 'VERIFIED';
  } else if (aadhaarResult.status === 'FAILED' && panResult.status === 'FAILED') {
    finalStatus = 'FAILED';
  } else {
    finalStatus = 'PARTIAL';
  }

  const updated = await prisma.candidate.update({
    where: { id: candidate.id },
    data: { status: finalStatus },
    include: { verificationLogs: { orderBy: { createdAt: 'desc' } } },
  });

  return { candidate: updated, aadhaar: aadhaarResult, pan: panResult, finalStatus };
};
