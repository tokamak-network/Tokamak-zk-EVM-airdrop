import { useState, useEffect } from 'react';

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
      console.log('🔄 Starting to fetch proofs...');
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/proofs');
      console.log('📡 API response status:', response.status);
      
      const data = await response.json();
      console.log('📊 API response data:', data);
      
      if (data.success) {
        console.log('✅ Setting proofs data:', data.data.length, 'items');
        setProofs(data.data);
      } else {
        console.log('❌ API returned error:', data.error);
        setError(data.error || 'Failed to fetch proofs');
      }
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      console.log('🏁 Setting loading to false');
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
