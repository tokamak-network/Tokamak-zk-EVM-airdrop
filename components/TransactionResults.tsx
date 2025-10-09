"use client";
import React from "react";

interface Transaction {
  id: number;
  title: string;
  description: string;
  hash: string;
  type: "verification" | "distribution";
  participants?: number;
}

const TransactionResults: React.FC = () => {
  const transactions: Transaction[] = [
    {
      id: 1,
      title: "First Batch",
      description: "5 winners registration and ZK verification",
      hash: "0x815155fbfe4c002377c95a9073c89bffb8413edebc2413a25e5e7b82a6da00b2",
      type: "verification",
      participants: 5,
    },
    {
      id: 2,
      title: "Second Batch",
      description: "5 winners registration and ZK verification",
      hash: "0x6ffb242c29267c9a5eab3470a3549d03501cdd4c522111d2edc2867e52003cfc",
      type: "verification",
      participants: 5,
    },
    {
      id: 3,
      title: "Third Batch",
      description: "5 winners registration and ZK verification",
      hash: "0xfaf1ddb4d8ac73c42729618e02e725e45a945d274652e783fdad2c4a2fad86ec",
      type: "verification",
      participants: 5,
    },
    {
      id: 4,
      title: "Fourth Batch",
      description: "4 winners registration and ZK verification",
      hash: "0x91364fdd29bb33509ed0840d0f4ed7297bac0d047922034e2360a9767573ace4",
      type: "verification",
      participants: 4,
    },
    {
      id: 5,
      title: "Reward Distribution",
      description: "Final reward distribution to all verified winners",
      hash: "0x379d1c1c561c5fd335e60c3fc3bf3a7e61a2cf5ee346c6e53bc3874c419464d5",
      type: "distribution",
    },
  ];

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-[#0a1930] to-[#1a2347] relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#4fc3f7] rounded-full filter blur-[128px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#7ed7ff] rounded-full filter blur-[128px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#57D2FF] font-['Jersey_10'] tracking-wider">
            PAYMENT RESULTS
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            All transactions have been successfully processed on Ethereum Mainnet
          </p>
        </div>

        {/* Verification Transactions */}
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8 flex items-center gap-3">
            <span className="inline-block w-3 h-3 bg-[#4fc3f7] rounded-full animate-pulse"></span>
            ZK Proof Verification Batches
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {transactions
              .filter((tx) => tx.type === "verification")
              .map((tx) => (
                <div
                  key={tx.id}
                  className="bg-gradient-to-br from-[#0e1e35] to-[#1a2847] rounded-xl border-2 border-[#4fc3f7]/30 p-6 hover:border-[#4fc3f7]/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(79,195,247,0.3)] group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1 group-hover:text-[#57D2FF] transition-colors">
                        {tx.title}
                      </h4>
                      <p className="text-sm text-gray-400">{tx.description}</p>
                    </div>
                    {tx.participants && (
                      <div className="bg-[#4fc3f7]/20 px-3 py-1 rounded-full">
                        <span className="text-[#4fc3f7] font-semibold text-sm">
                          {tx.participants} Winners
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 bg-[#0a1930]/50 rounded-lg p-3 border border-[#4fc3f7]/20">
                    <span className="text-gray-400 text-xs font-mono flex-1 truncate">
                      {truncateHash(tx.hash)}
                    </span>
                    <button
                      onClick={() => copyToClipboard(tx.hash)}
                      className="text-[#4fc3f7] hover:text-[#57D2FF] transition-colors p-1"
                      title="Copy hash"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#4fc3f7] hover:text-[#57D2FF] transition-colors p-1"
                      title="View on Etherscan"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Distribution Transaction */}
        <div>
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-8 flex items-center gap-3">
            <span className="inline-block w-3 h-3 bg-[#7ed7ff] rounded-full animate-pulse"></span>
            Final Reward Distribution
          </h3>
          {transactions
            .filter((tx) => tx.type === "distribution")
            .map((tx) => (
              <div
                key={tx.id}
                className="bg-gradient-to-br from-[#0e1e35] to-[#1a2847] rounded-xl border-2 border-[#7ed7ff]/50 p-6 md:p-8 hover:border-[#7ed7ff]/80 transition-all duration-300 hover:shadow-[0_0_40px_rgba(126,215,255,0.4)] group"
              >
                <div className="flex flex-col gap-6">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="bg-[#7ed7ff]/20 p-2 rounded-lg flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-[#7ed7ff]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl md:text-2xl font-bold text-white group-hover:text-[#7ed7ff] transition-colors mb-2">
                        {tx.title}
                      </h4>
                      <p className="text-gray-300 text-base md:text-lg">{tx.description}</p>
                    </div>
                  </div>

                  {/* Transaction Hash */}
                  <div className="flex items-center gap-2 bg-[#0a1930]/50 rounded-lg p-4 border border-[#7ed7ff]/30">
                    <span className="text-gray-300 text-sm font-mono flex-1 break-all">
                      {tx.hash}
                    </span>
                    <button
                      onClick={() => copyToClipboard(tx.hash)}
                      className="text-[#7ed7ff] hover:text-white transition-colors p-2 flex-shrink-0"
                      title="Copy hash"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <a
                      href={`https://etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#7ed7ff] hover:text-white transition-colors p-2 flex-shrink-0"
                      title="View on Etherscan"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default TransactionResults;

