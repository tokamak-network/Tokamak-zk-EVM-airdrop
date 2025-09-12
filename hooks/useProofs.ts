import { useState, useEffect } from 'react';

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
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/proofs');
      const data = await response.json();
      
      if (data.success) {
        setProofs(data.data);
      } else {
        setError(data.error || 'Failed to fetch proofs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
    
    // Auto-refresh disabled to prevent loading indicators every 30 seconds
    // Users can manually refresh if needed, or we can add a less intrusive update method
    // const interval = setInterval(fetchProofs, 30000);
    // return () => clearInterval(interval);
  }, []);

  return {
    proofs,
    loading,
    error,
    refetch: fetchProofs,
  };
}
