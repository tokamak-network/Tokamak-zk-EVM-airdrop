"use client";

import React from "react";
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

// Proof Card Component

const ProofCard: React.FC<ProofCardProps> = ({
  submitterAddress,
  hash,
  proofHash,
  status,
  proveTime,
  hardwareInfo,
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
        padding: "16px",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "16px",
        alignSelf: "stretch",
        border: "1px solid #619EC9",
        background: "#00223B",
        position: "relative",
      }}
    >
      {/* Row 1 - Submitter Address */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#619EC9",
            fontFamily: "IBM Plex Mono",
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: 300,
            lineHeight: "normal",
            textTransform: "uppercase",
          }}
        >
          Submitter Address
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
          <div
            style={{
              color: "#FFF",
              fontFamily: "IBM Plex Mono",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayAddress}
          </div>
          <div
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onClick={handleCopyAddress}
          >
            <CopyIcon />
          </div>
        </div>
      </div>

      {/* Row 2 - Transaction Hash */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#619EC9",
            fontFamily: "IBM Plex Mono",
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: 300,
            lineHeight: "normal",
            textTransform: "uppercase",
          }}
        >
          Transaction Hash
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
          <div
            style={{
              color: "#FFF",
              fontFamily: "IBM Plex Mono",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayHash}
          </div>
          <div
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onClick={handleCopyHash}
          >
            <CopyIcon />
          </div>
        </div>
      </div>

      {/* Row 3 - Proof Hash */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#619EC9",
            fontFamily: "IBM Plex Mono",
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: 300,
            lineHeight: "normal",
            textTransform: "uppercase",
          }}
        >
          Proof Hash
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
          <div
            style={{
              color: "#FFF",
              fontFamily: "IBM Plex Mono",
              fontSize: "14px",
              fontStyle: "normal",
              fontWeight: 500,
              lineHeight: "normal",
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {displayProofHash}
          </div>
          <div
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer",
              flexShrink: 0,
            }}
            onClick={handleCopyProofHash}
          >
            <CopyIcon />
          </div>
        </div>
      </div>

      {/* Row 4 - Status */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#619EC9",
            fontFamily: "IBM Plex Mono",
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: 300,
            lineHeight: "normal",
            textTransform: "uppercase",
          }}
        >
          Status
        </div>
        <div
          style={{
            color: getStatusDisplay(status) === "Verified" ? "#10B981" : 
                   getStatusDisplay(status) === "Rejected" ? "#EF4444" : "#F59E0B",
            fontFamily: "IBM Plex Mono",
            fontSize: "14px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "normal",
          }}
        >
          {getStatusDisplay(status)}
        </div>
      </div>

      {/* Row 5 - Prove Time */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#619EC9",
            fontFamily: "IBM Plex Mono",
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: 300,
            lineHeight: "normal",
            textTransform: "uppercase",
          }}
        >
          Prove Time
        </div>
        <div
          style={{
            color: "#66EAFF",
            fontFamily: "IBM Plex Mono",
            fontSize: "16px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "normal",
          }}
        >
          {formattedProveTime}
        </div>
      </div>

      {/* Row 6 - Hardware Info */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          width: "100%",
        }}
      >
        <div
          style={{
            color: "#619EC9",
            fontFamily: "IBM Plex Mono",
            fontSize: "12px",
            fontStyle: "normal",
            fontWeight: 300,
            lineHeight: "normal",
            textTransform: "uppercase",
          }}
        >
          Hardware Info
        </div>
        <div
          style={{
            color: "#FFF",
            fontFamily: "IBM Plex Mono",
            fontSize: "14px",
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
  );
};

const ProofMobile = () => {
  const { proofs, loading, error } = useProofs();
  
  // Debug logging
  console.log('📱 ProofMobile render:', { 
    loading, 
    error, 
    proofsCount: proofs.length, 
    isEventLive: isEventLive(),
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
    <div
      id="proof-mobile"
      className="w-full"
      style={{
        display: "flex",
        width: "100%",
        padding: "32px 20px",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
        background: "#002F51",
      }}
    >
      <h1 className="text-hero-title-70">Proof</h1>

      {/* Proof Cards */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "100%",
          height: "600px", // Fixed height like FAQ
          overflowY: "auto",
          overflowX: "hidden",
          padding: "16px 4px",
          paddingBottom: "40px",
          marginBottom: "32px",
          flexShrink: 0,
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
                key={`real-proof-mobile-${proof.id || index}`}
                submitterAddress={proof.submitterAddress}
                hash={proof.hash}
                proofHash={proof.proofHash}
                status={proof.status}
                proveTime={proof.proveTime}
                hardwareInfo={proof.hardwareInfo}
              />
            ))
          ) : (
            // Show empty state message (since ProofMobile doesn't use proofData fallback)
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="mb-4">
                <svg
                  width="48"
                  height="48"
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
                className="text-white text-lg mb-2"
                style={{ fontFamily: "IBM Plex Mono", fontWeight: 600 }}
              >
                No Proof Submissions Yet
              </h3>
              <p 
                className="text-[#619EC9] text-xs leading-relaxed"
                style={{ fontFamily: "IBM Plex Mono" }}
              >
                Proof submissions will appear here once users start submitting their ZK proofs. 
                Be the first to submit!
              </p>
            </div>
          )
        ) : !loading && !error ? (
          <>
            {/* <ComingSoonCard /> */}
            {mockProofData.map((proof, index) => (
              <div
                key={`mock-proof-mobile-${index}`}
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
                    hardwareInfo={proof.hardwareInfo}
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
        ) : null}
      </div>
    </div>
  );
};

export default ProofMobile;
