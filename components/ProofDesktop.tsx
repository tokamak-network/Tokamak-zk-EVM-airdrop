"use client";

import React from "react";

import { trimText, copyToClipboard } from "@/utils/text";
import {
  ProofCardProps,
  proofData,
  isEventLive,
  mockProofData,
} from "@/data/proofData";
import { useProofs } from "@/hooks/useProofs";
import ComingSoonCard from "@/components/ComingSoonCard";

// Copy Icon Component
const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="23"
    viewBox="0 0 22 23"
    fill="none"
  >
    <path
      d="M3.66634 15.1671C2.65801 15.1671 1.83301 14.3421 1.83301 13.3337V4.16707C1.83301 3.15874 2.65801 2.33374 3.66634 2.33374H12.833C13.8413 2.33374 14.6663 3.15874 14.6663 4.16707M9.16634 7.83374H18.333C19.3455 7.83374 20.1663 8.65455 20.1663 9.66707V18.8337C20.1663 19.8463 19.3455 20.6671 18.333 20.6671H9.16634C8.15382 20.6671 7.33301 19.8463 7.33301 18.8337V9.66707C7.33301 8.65455 8.15382 7.83374 9.16634 7.83374Z"
      stroke="#619EC9"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Proof Card Component (Desktop Version)

const ProofCard: React.FC<ProofCardProps> = ({
  submitterAddress,
  hash,
  status,
  proveTime,
}) => {
  const handleCopyAddress = () => {
    copyToClipboard(submitterAddress, () => {
      alert("Address copied to clipboard!");
    });
  };

  const handleCopyHash = () => {
    copyToClipboard(hash, () => {
      alert("Hash copied to clipboard!");
    });
  };

  // Use trimText function for display
  const displayAddress = trimText(submitterAddress);
  const displayHash = trimText(hash);
  return (
    <div
      style={{
        display: "flex",
        padding: "16px 24px",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "16px",
        alignSelf: "stretch",
        border: "1px solid #619EC9",
        background: "#00223B",
      }}
    >
      {/* Top Row */}
      <div style={{ display: "flex", gap: "24px", width: "100%" }}>
        {/* Submitter Address */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "8px",
            flex: "1 0 0",
          }}
        >
          <div
            style={{
              color: "#619EC9",
              fontFamily: "IBM Plex Mono",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 300,
              lineHeight: "normal",
            }}
          >
            Submitter Address
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                color: "#FFF",
                fontFamily: "IBM Plex Mono",
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "normal",
              }}
            >
              {displayAddress}
            </div>
            <div
              style={{
                width: "22px",
                height: "22px",
                aspectRatio: "1/1",
                cursor: "pointer",
              }}
              onClick={handleCopyAddress}
            >
              <CopyIcon />
            </div>
          </div>
        </div>

        {/* Transaction Hash */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "8px",
            flex: "1 0 0",
          }}
        >
          <div
            style={{
              color: "#619EC9",
              fontFamily: "IBM Plex Mono",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 300,
              lineHeight: "normal",
            }}
          >
            Transaction Hash
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                color: "#FFF",
                fontFamily: "IBM Plex Mono",
                fontSize: "16px",
                fontStyle: "normal",
                fontWeight: 500,
                lineHeight: "normal",
              }}
            >
              {displayHash}
            </div>
            <div
              style={{
                width: "22px",
                height: "22px",
                aspectRatio: "1/1",
                cursor: "pointer",
              }}
              onClick={handleCopyHash}
            >
              <CopyIcon />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: "flex", gap: "24px", width: "100%" }}>
        {/* Prove Time */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "8px",
            flex: "1 0 0",
          }}
        >
          <div
            style={{
              color: "#619EC9",
              fontFamily: "IBM Plex Mono",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 300,
              lineHeight: "normal",
            }}
          >
            Prove Time
          </div>
          <div
            style={{
              color: "#66EAFF",
              fontFamily: "IBM Plex Mono",
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
            }}
          >
            {proveTime}
          </div>
        </div>

        {/* Proof Status */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "8px",
            flex: "1 0 0",
          }}
        >
          <div
            style={{
              color: "#619EC9",
              fontFamily: "IBM Plex Mono",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 300,
              lineHeight: "normal",
            }}
          >
            Proof Status
          </div>
          <div
            style={{
              color: "#66EAFF",
              fontFamily: "IBM Plex Mono",
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
            }}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProofDesktop = () => {
  const { proofs, loading, error } = useProofs();
  
  // Debug logging
  console.log('🎯 ProofDesktop render:', { 
    loading, 
    error, 
    proofsCount: proofs.length, 
    isEventLive,
    proofs: proofs.slice(0, 1) // Log first proof for debugging
  });
  
  // Convert real proofs to ProofCardProps format
  const realProofs: ProofCardProps[] = proofs.map(proof => ({
    submitterAddress: proof.submitterAddress,
    hash: proof.hash,
    status: proof.status,
    proveTime: proof.proveTime,
    submissionTime: proof.submissionTime,
    id: proof.id,
    proofData: proof.proofData,
  }));

  return (
    <div className="relative w-full max-w-[720px] mx-auto bg-gradient-to-b from-[#0a1930] to-[#1a2347] border-2 border-[#4fc3f7]">
      {/* Space-themed header */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3730a3] p-4 border-b-2 border-[#4fc3f7]">
        <h2 className="text-white text-3xl text-center" style={{fontFamily: '"Jersey 10"'}}>
          ZK Proof Dashboard
        </h2>
      </div>

      {/* Proof Cards Container */}
      <div
        style={{
          display: "flex",
          width: "100%",
          minHeight: "600px",
          padding: "24px",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          overflowY: "auto",
        }}
      >
        {/* Proof Cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            width: "100%",
            flex: 1,
          }}
        >
          {loading && (
            <div className="flex justify-center items-center h-32">
              <div className="text-white text-lg">Loading proofs...</div>
            </div>
          )}
          
          {error && (
            <div className="flex justify-center items-center h-32">
              <div className="text-red-400 text-lg">Error: {error}</div>
            </div>
          )}
          
          {!loading && !error && isEventLive ? (
            realProofs.length > 0 ? (
              realProofs.map((proof, index) => (
                <ProofCard
                  key={`real-proof-${proof.id || index}`}
                  submitterAddress={proof.submitterAddress}
                  hash={proof.hash}
                  status={proof.status}
                  proveTime={proof.proveTime}
                  submissionTime={proof.submissionTime}
                  id={proof.id}
                  proofData={proof.proofData}
                />
              ))
            ) : (
              proofData.map((proof, index) => (
                <ProofCard
                  key={`proof-${index}`}
                  submitterAddress={proof.submitterAddress}
                  hash={proof.hash}
                  status={proof.status}
                  proveTime={proof.proveTime}
                />
              ))
            )
          ) : (
            <>
              {/* <ComingSoonCard /> */}
              {mockProofData.map((proof, index) => (
                <div
                  key={`mock-proof-${index}`}
                  style={{ position: "relative" }}
                >
                  <div
                    style={{
                      filter: "blur(2px)",
                      opacity: 0.6,
                    }}
                  >
                    <ProofCard
                      submitterAddress={proof.submitterAddress}
                      hash={proof.hash}
                      status={proof.status}
                      proveTime={proof.proveTime}
                    />
                  </div>
                  {/* Overlay */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "#00223B",
                      opacity: 0.4,
                      zIndex: 10,
                      cursor: "not-allowed",
                    }}
                  />
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProofDesktop;
