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
        <div className="text-hero-title-70">
          Do quests, show proof,
          <br />
          grab TON!
        </div>
      </div>
    </div>
  );
};

export default GrabTON;
