import React from "react";

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
interface ProofCardProps {
  submitterAddress: string;
  hash: string;
  status: string;
  proveTime: string;
}

const ProofCard: React.FC<ProofCardProps> = ({
  submitterAddress,
  hash,
  status,
  proveTime,
}) => {
  return (
    <div
      style={{
        display: "flex",
        padding: "16px 20px",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "16px",
        alignSelf: "stretch",
        border: "1px solid #619EC9",
        background: "#00223B",
      }}
    >
      {/* Top Row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {/* Submitter Address */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "8px",
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
              {submitterAddress}
            </div>
            <div
              style={{
                width: "22px",
                height: "22px",
                aspectRatio: "1/1",
                cursor: "pointer",
              }}
            >
              <CopyIcon />
            </div>
          </div>
        </div>

        {/* Prove Time */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "8px",
            marginLeft: "auto",
            marginRight: "14px",
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
              textAlign: "left",
            }}
          >
            {proveTime}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        {/* Transaction Hash */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: "8px",
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
              {hash}
            </div>
            <div
              style={{
                width: "22px",
                height: "22px",
                aspectRatio: "1/1",
                cursor: "pointer",
              }}
            >
              <CopyIcon />
            </div>
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
            marginLeft: "auto",
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
              textAlign: "left",
            }}
          >
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProofMobile = () => {
  return (
    <div
      id="proof"
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
        }}
      >
        <ProofCard
          submitterAddress="0x0f4fb...48c2a"
          hash="0xf4fb9...f4fb9"
          status="1"
          proveTime="00:15:00"
        />
        <ProofCard
          submitterAddress="0x0f4fb...48c2a"
          hash="0xf4fb9...f4fb9"
          status="1"
          proveTime="00:12:45"
        />
        <ProofCard
          submitterAddress="0x0f4fb...48c2a"
          hash="0xf4fb9...f4fb9"
          status="1"
          proveTime="00:08:30"
        />
        <ProofCard
          submitterAddress="0x0f4fb...48c2a"
          hash="0xf4fb9...f4fb9"
          status="1"
          proveTime="00:20:15"
        />
        <ProofCard
          submitterAddress="0x0f4fb...48c2a"
          hash="0xf4fb9...f4fb9"
          status="1"
          proveTime="00:18:22"
        />
      </div>
    </div>
  );
};

export default ProofMobile;
