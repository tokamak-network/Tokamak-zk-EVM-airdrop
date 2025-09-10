import React from "react";


import { GrabTONButton } from "./hero/Buttons";

const GrabTON: React.FC = () => {
  return (
    <div className="w-full min-h-[380px] bg-gradient-to-b from-[#0a1930] to-[#1a2347] relative flex items-center justify-center px-[30px]">
      {/* Space theme decorations */}
      <div className="absolute top-10 left-10 text-white text-2xl animate-pulse">✦</div>
      <div className="absolute top-20 right-20 text-white text-lg animate-pulse" style={{animationDelay: '1s'}}>+</div>
      <div className="absolute bottom-20 left-20 text-white text-xl animate-pulse" style={{animationDelay: '2s'}}>⚙</div>
      <div className="absolute bottom-10 right-10 text-white text-lg animate-pulse" style={{animationDelay: '0.5s'}}>✦</div>
      <div className="text-center flex flex-col items-center gap-y-[28px] z-10">
        <div className="text-white text-6xl" style={{
          fontFamily: '"Jersey 10"',
        }}>
          Do quests, show proof,
          <br />
          grab TON!
        </div>
        <GrabTONButton />
      </div>
    </div>
  );
};

export default GrabTON;
