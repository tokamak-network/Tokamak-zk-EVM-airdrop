const ComingSoonCard: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        padding: "24px",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: "18px",
        alignSelf: "stretch",
        border: "1px solid #619EC9",
        background: "#00223B",
      }}
    >
      {/* Coming Soon Title */}
      <div
        style={{
          color: "#CCEFFF",
          fontFamily: '"IBM Plex Mono"',
          fontSize: "32px",
          fontStyle: "normal",
          fontWeight: 500,
          lineHeight: "normal",
        }}
      >
        Coming soon!
      </div>

      {/* Description Text */}
      <div
        style={{
          color: "#619EC9",
          textAlign: "center",
          fontFamily: '"IBM Plex Mono"',
          fontSize: "14px",
          fontStyle: "normal",
          fontWeight: 300,
          lineHeight: "normal",
        }}
      >
        Proof submissions will appear here
        <br />
        once the event goes live.
      </div>
    </div>
  );
};

export default ComingSoonCard;
