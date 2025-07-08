import React from "react";
import FooterTankImage from "@/assets/footer/footer-tank.png";
import Image from "next/image";

const GrabTON: React.FC = () => {
  return (
    <div className="grid-background w-full h-[380px] relative flex">
      <div className="w-[712px]">
        <div className="absolute top-[-76px] left-[0]">
          <Image src={FooterTankImage} alt="FooterTankImage" />
        </div>
      </div>
      <div className="w-[692px] mt-[80px] ml-[70px] text-center">
        <div
          style={{
            color: "#00477A",
            textAlign: "center",
            textShadow: "2px 2px 0px #00477A",
            WebkitTextStrokeWidth: "2px",
            WebkitTextStrokeColor: "#7ED7FF",
            fontFamily: "'Jersey 10', 'Press Start 2P', monospace",
            fontSize: "70px",
            fontStyle: "normal",
            fontWeight: 400,
            lineHeight: "normal",
            letterSpacing: "6.3px",
          }}
        >
          Do quests, show proof,
          <br />
          grab TON!
        </div>
      </div>
    </div>
  );
};

export default GrabTON;
