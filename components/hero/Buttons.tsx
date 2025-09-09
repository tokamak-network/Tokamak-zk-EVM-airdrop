"use client";
import React from "react";
import Image from "next/image";
import CTA_1 from "../../assets/hero/buttons/CTA.svg";
import CTA_2 from "../../assets/hero/buttons/CTA-2.svg";
import CTA_3 from "../../assets/hero/buttons/CTA-3.svg";
import CTA_4 from "../../assets/hero/buttons/CTA-4.svg";
import CTA_2_MOBILE from "../../assets/hero/buttons/CTA-2-mobile.svg";
import { LINKS } from "@/constants";

const handleSubmitProofClick = () => {
  // alert(
  //   "Hold on! 🚀 TONs are still traveling from space! Please wait a little longer~ ⏰"
  // );
  window.open(LINKS.SUBMIT_PROOF, "_blank");
};

export const GrabTONButton = () => {
  const handlePlaygroundClick = () => {
    window.open(
      "https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/releases/tag/1.0.0",
      "_blank"
    );
  };

  return (
    <div className="flex items-center gap-10 max-800:flex-col max-800:gap-4">
      {/* First button - always Start Now */}
      <Image
        src={CTA_3}
        alt="Start Now"
        style={{ cursor: "pointer" }}
        draggable={false}
        onClick={handlePlaygroundClick}
        className="transition-transform duration-200 hover:scale-125"
      />

      {/* Second button - always Submit Proof */}
      {/* 데스크탑용 CTA_2 (1360px 이상에서 표시) */}
      <Image
        src={CTA_2}
        alt="Submit Proof"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="hidden desktop:block transition-transform duration-200 hover:scale-125"
        onClick={handleSubmitProofClick}
      />

      {/* 모바일용 CTA_2_MOBILE (1359px 이하에서 표시) */}
      <Image
        src={CTA_2_MOBILE}
        alt="Submit Proof"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="block desktop:hidden transition-transform duration-200 hover:scale-125"
        onClick={handleSubmitProofClick}
      />
    </div>
  );
};

export const FAQMobileButtons = () => {
  const handlePlaygroundClick = () => {
    window.open(
      "https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/releases/tag/1.0.0",
      "_blank"
    );
  };

  return (
    <div className="flex items-center gap-4 max-800:flex-col max-800:gap-4 self-stretch justify-center">
      {/* First button - always Start on Desktop */}
      <Image
        src={CTA_4}
        alt="Start on Desktop"
        style={{ cursor: "pointer" }}
        draggable={false}
        onClick={handlePlaygroundClick}
        className="transition-transform duration-200 hover:scale-125"
      />
      
      {/* Second button - always Submit Proof */}
      <Image
        src={CTA_2_MOBILE}
        alt="Submit Proof"
        style={{ cursor: "pointer" }}
        draggable={false}
        onClick={handleSubmitProofClick}
        className="transition-transform duration-200 hover:scale-125"
      />
    </div>
  );
};

export default function Buttons() {
  const handlePlaygroundClick = () => {
    window.open(
      "https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/releases/tag/1.0.0",
      "_blank"
    );
  };

  return (
    <div className="flex items-center gap-10 max-800:flex-col max-800:gap-4">
      {/* First button - always Try it Now / Start on Desktop */}
      {/* 데스크탑용 CTA_1 (1360px 이상에서 표시) */}
      <Image
        src={CTA_1}
        alt="Try it Now"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="hidden desktop:block transition-transform duration-200 hover:scale-125"
        onClick={handlePlaygroundClick}
      />

      {/* 모바일용 CTA_4 (1359px 이하에서 표시) */}
      <Image
        src={CTA_4}
        alt="Start on Desktop"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="block desktop:hidden transition-transform duration-200 hover:scale-125"
        onClick={handlePlaygroundClick}
      />

      {/* Second button - always Submit Proof */}
      {/* 데스크탑용 CTA_2 (1360px 이상에서 표시) */}
      <Image
        src={CTA_2}
        alt="Submit Proof"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="hidden desktop:block transition-transform duration-200 hover:scale-125"
        onClick={handleSubmitProofClick}
      />

      {/* 모바일용 CTA_2_MOBILE (1359px 이하에서 표시) */}
      <Image
        src={CTA_2_MOBILE}
        alt="Submit Proof"
        style={{ cursor: "pointer" }}
        draggable={false}
        onClick={handleSubmitProofClick}
        className="block desktop:hidden transition-transform duration-200 hover:scale-125"
      />
    </div>
  );
}
