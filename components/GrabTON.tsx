import React from "react";
import FooterTankImage from "@/assets/footer/footer-tank.png";
import Image from "next/image";
import { GrabTONButton } from "./hero/Buttons";

const GrabTON: React.FC = () => {
  return (
    <div className="grid-background w-full h-[380px] relative flex px-[30px] justify-between">
      <div className="w-[712px]">
        <div className="absolute top-[-76px] left-[0]">
          <Image
            src={FooterTankImage}
            alt="FooterTankImage"
            className="w-auto h-[389px]"
          />
        </div>
      </div>
      <div className="w-[850px] mt-[82px] text-center flex flex-col items-center gap-y-[28px]">
        <div className="text-hero-title-70">
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
