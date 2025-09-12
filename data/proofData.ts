// Proof Card Data Types and Shared Data
export interface ProofCardProps {
  submitterAddress: string;
  hash: string;
  proofHash?: string;
  status: string;
  proveTime: string;
  submissionTime?: string;
  id?: string;
  proofData?: {
    publicSignals?: any;
    proof?: any;
    transactionHash?: string;
  };
}

// Enhanced proof submission interface for real data
export interface ProofSubmission {
  id: string;
  submitterAddress: string;
  hash: string;
  status: string;
  proveTime: string;
  submissionTime: string;
  zipFileUrl?: string;
  proofData?: {
    publicSignals?: any;
    proof?: any;
    transactionHash?: string;
    proofHash?: string;
  };
}

// Event Status - Set to true when event starts
export const isEventLive = true;

// Status display function
export const getStatusDisplay = (status: string): string => {
  switch (status) {
    case '0':
      return 'Pending';
    case '1':
      return 'Verified';
    default:
      return 'Pending';
  }
};

// Mock Data for Coming Soon Display - Cards with overlay
export const mockProofData: ProofCardProps[] = [
  {
    submitterAddress: "0x1234567890abcdef1234567890abcdef12345678",
    hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    proofHash: "0x3f58702a94fb6143732832465e9c186f20a7bf5b1060e710ddf45a3f99d5853a",
    status: "1",
    proveTime: "00:12:34",
  },
  {
    submitterAddress: "0x9876543210fedcba9876543210fedcba98765432",
    hash: "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321",
    proofHash: "0x7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c",
    status: "0",
    proveTime: "00:08:45",
  },
  {
    submitterAddress: "0x5678901234abcdef5678901234abcdef56789012",
    hash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    proofHash: "0x9f8e7d6c5b4a3928171605040302010f0e0d0c0b0a0908070605040302010f0e0d",
    status: "1",
    proveTime: "00:15:22",
  },
  {
    submitterAddress: "0xabcdef567890123456789012345678901234abcd",
    hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    proofHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    status: "1",
    proveTime: "00:11:08",
  },
  {
    submitterAddress: "0x2468ace02468ace02468ace02468ace02468ace0",
    hash: "0xace0246813579bdfce024681357ace024681357ace024681357ace024681357a",
    proofHash: "0x5f6e7d8c9b0a1928374655647382910a9b8c7d6e5f403928170605040302010f0e",
    status: "0",
    proveTime: "00:18:56",
  },
];

// Shared Proof Data Array - Update this array to reflect new proof submissions
// This data is used by both ProofDesktop and ProofMobile components
export const proofData: ProofCardProps[] = [
  {
    submitterAddress: "0x0f4fbc8e7a394b3b1b5b76f89a12345678901234348c2a",
    hash: "0xf4fb9abc123456789012345678901234567890123456789012345678901234f4fb9",
    status: "1",
    proveTime: "00:15:00",
  },
  {
    submitterAddress: "0x0f4fbc8e7a394b3b1b5b76f89a12345678901234348c2a",
    hash: "0xa2b3c123456789012345678901234567890123456789012345678901234a2b3c",
    status: "1",
    proveTime: "00:12:45",
  },
  {
    submitterAddress: "0x0f4fbc8e7a394b3b1b5b76f89a12345678901234348c2a",
    hash: "0xd4e5f123456789012345678901234567890123456789012345678901234d4e5f",
    status: "0",
    proveTime: "00:08:30",
  },
  {
    submitterAddress: "0x0f4fbc8e7a394b3b1b5b76f89a12345678901234348c2a",
    hash: "0x7g8h9123456789012345678901234567890123456789012345678901234a7g8h9",
    status: "1",
    proveTime: "00:20:15",
  },
  {
    submitterAddress: "0x0f4fbc8e7a394b3b1b5b76f89a12345678901234348c2a",
    hash: "0xj1k2l123456789012345678901234567890123456789012345678901234aj1k2l",
    status: "1",
    proveTime: "00:18:22",
  },
  {
    submitterAddress: "0x0f4fbc8e7a394b3b1b5b76f89a12345678901234348c2a",
    hash: "0xm3n4o123456789012345678901234567890123456789012345678901234am3n4o",
    status: "0",
    proveTime: "00:14:50",
  },
  {
    submitterAddress: "0x0f4fbc8e7a394b3b1b5b76f89a12345678901234348c2a",
    hash: "0xp5q6r123456789012345678901234567890123456789012345678901234ap5q6r",
    status: "1",
    proveTime: "00:11:35",
  },
  {
    submitterAddress: "0x0f4fbc8e7a394b3b1b5b76f89a12345678901234348c2a",
    hash: "0xs7t8u123456789012345678901234567890123456789012345678901234s7t8u",
    status: "1",
    proveTime: "00:16:40",
  },
  {
    submitterAddress: "0x0f4fbc8e7a394b3b1b5b76f89a12345678901234348c2a",
    hash: "0xv9w0x123456789012345678901234567890123456789012345678901234v9w0x",
    status: "1",
    proveTime: "00:13:25",
  },
  {
    submitterAddress: "0x0f4fbc8e7a394b3b1b5b76f89a12345678901234348c2a",
    hash: "0xy1z2a123456789012345678901234567890123456789012345678901234y1z2a",
    status: "0",
    proveTime: "00:09:18",
  },
];
