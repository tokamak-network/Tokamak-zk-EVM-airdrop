import { useState, useEffect } from 'react';
import { staticAirdropProofs } from '@/data/staticProofData';

export interface ProofSubmission {
  id: string;
  submitterAddress: string;
  hash: string;
  status: string;
  proveTime: string;
  submissionTime: string;
  zipFileUrl?: string;
  hardwareInfo?: string;
  proofData?: {
    publicSignals?: any;
    proof?: any;
    transactionHash?: string;
    proofHash?: string;
  };
}

export interface UseProofsReturn {
  proofs: ProofSubmission[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProofs(): UseProofsReturn {
  const [proofs, setProofs] = useState<ProofSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProofs = async () => {
    try {
      console.log('🔄 Loading static airdrop proof data...');
      setLoading(true);
      setError(null);
      
      // Simulate a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Setting static proofs data:', staticAirdropProofs.length, 'items');
      setProofs(staticAirdropProofs);
      
    } catch (err) {
      console.error('❌ Error loading static data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
    
    // No auto-refresh needed for static data
  }, []);

  return {
    proofs,
    loading,
    error,
    refetch: fetchProofs,
  };
}
