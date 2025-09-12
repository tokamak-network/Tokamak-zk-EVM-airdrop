"use client";

import React, { useState } from 'react';

interface ProofTestFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onProofSubmitted?: (proof: any) => void;
}

const ProofTestForm: React.FC<ProofTestFormProps> = ({ 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onProofSubmitted 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !walletAddress) {
      alert('Please provide both a zip file and wallet address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('zipFile', file);
      formData.append('submitterAddress', walletAddress);

      const response = await fetch('/api/proofs', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        onProofSubmitted?.(data.data);
      } else {
        setResult({ error: data.error });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setResult({ error: 'Failed to process proof' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
      <h3 className="text-white text-xl mb-4">Test Proof Submission</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white text-sm mb-2">
            Wallet Address:
          </label>
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            placeholder="0x..."
            required
          />
        </div>
        
        <div>
          <label className="block text-white text-sm mb-2">
            Proof Zip File:
          </label>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded"
        >
          {loading ? 'Processing...' : 'Submit Proof'}
        </button>
      </form>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-700 rounded">
          <h4 className="text-white font-bold mb-2">Result:</h4>
          <pre className="text-green-400 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ProofTestForm;
