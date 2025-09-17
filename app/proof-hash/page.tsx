'use client';

import React, { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Star Component for cosmic background
const Star = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`absolute text-white ${className}`} style={style}>
    ✦
  </div>
);

// Plus Sign Component for cosmic background
const PlusSign = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`absolute text-white ${className}`} style={style}>
    +
  </div>
);

// Gear Component for cosmic background
const Gear = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`absolute text-white ${className}`} style={style}>
    ⚙
  </div>
);

const ProofHashPage = () => {
  const [hash, setHash] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setError('');
      setHash('');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setHash('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const file = formData.get('proofFile') as File;

    if (!file) {
      setError('Please select a file to upload.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/compute-hash', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to compute hash. Please check your file format.');
      }

      const data = await response.json();
      setHash(data.hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (hash) {
      try {
        await navigator.clipboard.writeText(hash);
        // You could add a toast notification here
        alert('Hash copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-[#0a1930] to-[#1a2347] overflow-x-hidden relative">
        {/* Cosmic Background Elements */}
        <Star className="text-lg animate-pulse" style={{ top: '10%', left: '10%', animationDelay: '0s' }} />
        <Star className="text-sm animate-pulse" style={{ top: '20%', right: '15%', animationDelay: '1s' }} />
        <Star className="text-xl animate-pulse" style={{ top: '30%', left: '20%', animationDelay: '2s' }} />
        <PlusSign className="text-lg animate-pulse" style={{ top: '15%', right: '25%', animationDelay: '0.5s' }} />
        <PlusSign className="text-sm animate-pulse" style={{ bottom: '40%', left: '15%', animationDelay: '1.5s' }} />
        <Gear className="text-lg animate-pulse" style={{ bottom: '20%', right: '10%', animationDelay: '2.5s' }} />
        <Star className="text-md animate-pulse" style={{ bottom: '35%', right: '30%', animationDelay: '0.8s' }} />
        <PlusSign className="text-xl animate-pulse" style={{ top: '60%', left: '8%', animationDelay: '1.8s' }} />
        <Star className="text-sm animate-pulse" style={{ top: '70%', right: '20%', animationDelay: '2.2s' }} />
        <Gear className="text-sm animate-pulse" style={{ top: '25%', left: '85%', animationDelay: '1.2s' }} />

        <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 
              className="text-4xl md:text-6xl text-white mb-6"
              style={{
                fontFamily: '"Jersey 10", "Press Start 2P", monospace',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                letterSpacing: '2px'
              }}
            >
              Proof Hash Calculator
            </h1>
            <div className="max-w-3xl mx-auto">
              <p 
                className="text-lg md:text-xl text-[#4fc3f7] mb-4"
                style={{
                  fontFamily: '"IBM Plex Mono"',
                  lineHeight: '1.6',
                }}
              >
                Generate SHA256 hash from your ZK proof file
              </p>
              <p 
                className="text-white/80"
                style={{
                  fontFamily: '"IBM Plex Mono"',
                  lineHeight: '1.6',
                }}
              >
                This tool computes a SHA256 hash based on the <code className="bg-[#1a2347] px-2 py-1 rounded text-[#4fc3f7]">proof_entries_part1</code> and <code className="bg-[#1a2347] px-2 py-1 rounded text-[#4fc3f7]">proof_entries_part2</code> fields from your proof.json file.
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-2xl mx-auto">
            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="card mb-8">
              <div className="mb-6">
                <label 
                  htmlFor="proofFile" 
                  className="block text-lg font-medium text-white mb-4"
                  style={{ fontFamily: '"IBM Plex Mono"' }}
                >
                  Upload proof.json file
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="proofFile"
                    name="proofFile"
                    accept=".json"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-white/80 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-[#4fc3f7] file:to-[#29b6f6] file:text-white hover:file:from-[#29b6f6] hover:file:to-[#4fc3f7] file:cursor-pointer cursor-pointer bg-[#1a2347] border-2 border-[#4fc3f7]/30 rounded-lg focus:border-[#4fc3f7] focus:outline-none transition-all duration-300"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  />
                  {fileName && (
                    <p className="mt-2 text-sm text-[#4fc3f7]" style={{ fontFamily: '"IBM Plex Mono"' }}>
                      Selected: {fileName}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading || !fileName}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#4fc3f7] to-[#29b6f6] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-[#29b6f6] hover:to-[#4fc3f7] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                style={{ fontFamily: '"IBM Plex Mono"' }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Computing Hash...
                  </div>
                ) : (
                  'Compute SHA256 Hash'
                )}
              </button>
            </form>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border-2 border-red-500/30 rounded-lg">
                <p className="text-red-400" style={{ fontFamily: '"IBM Plex Mono"' }}>
                  ❌ {error}
                </p>
              </div>
            )}

            {/* Hash Result */}
            {hash && (
              <div className="card">
                <h2 
                  className="text-2xl text-[#4fc3f7] mb-4"
                  style={{ fontFamily: '"Jersey 10"' }}
                >
                  Generated Hash
                </h2>
                <div className="bg-[#1a2347] p-4 rounded-lg border-2 border-[#4fc3f7]/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/60" style={{ fontFamily: '"IBM Plex Mono"' }}>
                      SHA256 Hash:
                    </span>
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-1 bg-[#4fc3f7]/20 hover:bg-[#4fc3f7]/30 text-[#4fc3f7] text-xs rounded border border-[#4fc3f7]/50 transition-colors duration-200"
                      style={{ fontFamily: '"IBM Plex Mono"' }}
                    >
                      Copy
                    </button>
                  </div>
                  <p 
                    className="text-white font-mono text-sm md:text-base break-all p-3 bg-black/30 rounded border"
                    style={{ 
                      fontFamily: '"IBM Plex Mono"',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {hash}
                  </p>
                </div>
                
                {/* Hash Info */}
                <div className="mt-6 p-4 bg-[#4fc3f7]/10 rounded-lg border border-[#4fc3f7]/30">
                  <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: '"IBM Plex Mono"' }}>
                    ℹ️ About this hash
                  </h3>
                  <ul className="text-white/80 text-sm space-y-1" style={{ fontFamily: '"IBM Plex Mono"' }}>
                    <li>• Generated using SHA256 algorithm</li>
                    <li>• Based on proof_entries_part1 and proof_entries_part2 fields</li>
                    <li>• Used for Tokamak zk-EVM airdrop verification</li>
                    <li>• Keep this hash safe for your records</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rainbow Stripe at bottom */}
        <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500"></div>
      </main>
      <Footer />
    </>
  );
};

export default ProofHashPage;
