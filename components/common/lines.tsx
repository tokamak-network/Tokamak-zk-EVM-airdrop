import React from "react";

interface LinesProps {
  height?: number;
}

export const Lines: React.FC<LinesProps> = ({ height = 6 }) => {
  return (
    <div>
      <div style={{ height: `${height}px` }} className="bg-[#159CFC]"></div>
      <div style={{ height: `${height}px` }} className="bg-[#7AC8FF]"></div>
      <div style={{ height: `${height}px` }} className="bg-[#159CFC]"></div>
      <div style={{ height: `${height}px` }} className="bg-[#0079D0]"></div>
    </div>
  );
};
