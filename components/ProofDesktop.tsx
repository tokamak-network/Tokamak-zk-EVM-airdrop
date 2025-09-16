"use client";

import React, { useState, useEffect } from "react";

import { trimText, copyToClipboard, formatProvingTime } from "@/utils/text";
import {
  ProofCardProps,
  isEventLive,
  mockProofData,
  getStatusDisplay,
} from "@/data/proofData";
import { useProofs } from "@/hooks/useProofs";
// import ComingSoonCard from "@/components/ComingSoonCard";

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

interface ExtendedProofCardProps extends ProofCardProps {
  isMobile?: boolean;
}

const ProofCard: React.FC<ExtendedProofCardProps> = ({
  submitterAddress,
  hash,
  proofHash,
  status,
  proveTime,
  hardwareInfo,
  isMobile = false,
}) => {
  const handleCopyAddress = () => {
    copyToClipboard(submitterAddress, () => {
      alert("Address copied to clipboard!");
    });
  };

  const handleCopyHash = () => {
    copyToClipboard(hash, () => {
      alert("Transaction Hash copied to clipboard!");
    });
  };

  const handleCopyProofHash = () => {
    if (proofHash) {
      copyToClipboard(proofHash, () => {
        alert("Proof Hash copied to clipboard!");
      });
    }
  };

  // Use trimText function for display
  const displayAddress = trimText(submitterAddress);
  const displayHash = trimText(hash);
  const displayProofHash = proofHash ? trimText(proofHash) : 'N/A';
  const formattedProveTime = formatProvingTime(proveTime);
  const displayHardwareInfo = hardwareInfo || 'N/A';
  const getShortHardwareInfo = (info: string) => {
    if (!info || info === 'N/A') return 'N/A';
    // Extract just the chip name (e.g., "Apple M1 Max" from "Apple M1 Max, 10 cores, 32GB RAM, macOS")
    const chipMatch = info.match(/^([^,]+)/);
    return chipMatch ? chipMatch[1].trim() : info;
  };
  const shortHardwareInfo = getShortHardwareInfo(displayHardwareInfo);
  return (
    <div
      style={{
        display: "flex",
        padding: isMobile ? "8px 12px" : "12px 16px",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: isMobile ? "8px" : "12px",
        alignSelf: "stretch",
        border: "1px solid #619EC9",
        background: "#00223B",
        position: "relative",
      }}
    >
      {/* Row 1 - Proof Hash and Status */}
      <div style={{ display: "flex", gap: isMobile ? "8px" : "16px", width: "100%" }}>
        {/* Proof Hash */}
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
            Proof Hash
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
              {displayProofHash}
            </div>
            <div
              style={{
                width: "22px",
                height: "22px",
                aspectRatio: "1/1",
                cursor: "pointer",
              }}
              onClick={handleCopyProofHash}
            >
              <CopyIcon />
            </div>
          </div>
        </div>

        {/* Status */}
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
            Status
          </div>
          <div
            style={{
              display: "inline-flex",
              padding: "4px 8px",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              borderRadius: "4px",
              border: status === "1" ? "1px solid #66EAFF" : "1px solid #F5A623",
              background: status === "1" ? "#66EAFF" : "#F5A623",
              color: "#000",
              fontFamily: "IBM Plex Mono",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 600,
              lineHeight: "normal",
            }}
          >
            {getStatusDisplay(status)}
          </div>
        </div>

      </div>

      {/* Row 2 - Transaction Hash and Submitter Address */}
      <div style={{ display: "flex", gap: "16px", width: "100%" }}>
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

      </div>

      {/* Row 3 - Prove Time and Hardware Info */}
      <div style={{ display: "flex", gap: "16px", width: "100%" }}>
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
            {formattedProveTime}
          </div>
        </div>

        {/* Hardware Info */}
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
            Hardware Info
          </div>
          <div
            style={{
              color: "#FFF",
              fontFamily: "IBM Plex Mono",
              fontSize: "16px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              cursor: "help",
            }}
            title={displayHardwareInfo}
          >
            {shortHardwareInfo}
          </div>
        </div>
      </div>

    </div>
  );
};

const ProofDesktop = () => {
  const { proofs, loading, error } = useProofs();
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Debug logging
  console.log('🎯 ProofDesktop render:', { 
    loading, 
    error, 
    proofsCount: proofs.length, 
    isEventLive: isEventLive(),
    isMobile,
    proofs: proofs.slice(0, 1) // Log first proof for debugging
  });
  
  // Convert real proofs to ProofCardProps format
  const realProofs: ProofCardProps[] = proofs.map(proof => ({
    submitterAddress: proof.submitterAddress,
    hash: proof.hash,
    proofHash: proof.proofData?.proofHash,
    status: proof.status,
    proveTime: proof.proveTime,
    submissionTime: proof.submissionTime,
    id: proof.id,
    hardwareInfo: proof.hardwareInfo,
    proofData: proof.proofData,
  }));

  return (
    <div className="relative w-full max-w-[720px] mx-auto bg-gradient-to-b from-[#0a1930] to-[#1a2347] border-2 border-[#4fc3f7]">
      {/* Space-themed header */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#3730a3] p-3 sm:p-4 border-b-2 border-[#4fc3f7]">
        <h2 className="text-white text-2xl sm:text-3xl text-center" style={{fontFamily: '"Jersey 10"'}}>
          ZK Proof Dashboard
        </h2>
      </div>

      {/* Proof Cards Container */}
      <div
        className="w-full"
        style={{
          display: "flex",
          height: isMobile ? "500px" : "850px", // Responsive height
          padding: isMobile ? "12px" : "24px", // Responsive padding
          paddingBottom: isMobile ? "20px" : "40px",
          flexDirection: "column",
          alignItems: "center",
          gap: isMobile ? "8px" : "16px", // Responsive gap
          overflowY: "auto",
          overflowX: "hidden",
          flexShrink: 0,
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
          
          {!loading && !error && isEventLive() ? (
            realProofs.length > 0 ? (
              realProofs.map((proof, index) => (
                <ProofCard
                  key={`real-proof-${proof.id || index}`}
                  submitterAddress={proof.submitterAddress}
                  hash={proof.hash}
                  proofHash={proof.proofHash}
                  status={proof.status}
                  proveTime={proof.proveTime}
                  submissionTime={proof.submissionTime}
                  id={proof.id}
                  hardwareInfo={proof.hardwareInfo}
                  proofData={proof.proofData}
                  isMobile={isMobile}
                />
              ))
            ) : (
              // No real proofs available - show empty state message
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="mb-4">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#619EC9"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto"
                  >
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1"/>
                    <path d="M3 12v6c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-6"/>
                  </svg>
                </div>
                <h3 
                  className="text-white text-xl mb-2"
                  style={{ fontFamily: "IBM Plex Mono", fontWeight: 600 }}
                >
                  No Proof Submissions Yet
                </h3>
                <p 
                  className="text-[#619EC9] text-sm max-w-md"
                  style={{ fontFamily: "IBM Plex Mono", lineHeight: 1.5 }}
                >
                  Proof submissions will appear here once users start submitting their ZK proofs. 
                  Be the first to submit and see your proof verified on the dashboard!
                </p>
              </div>
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
                      isMobile={isMobile}
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
