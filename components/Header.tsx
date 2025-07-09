"use client";

import React from "react";
import CarouselItemImage from "@/assets/header/carousel-item.svg";
import LogoImage from "@/assets/header/logo.svg";
import SwatchImage from "@/assets/header/swatch.svg";
import Image from "next/image";
import { Lines } from "./common/lines";

const Banner = () => {
  return (
    <div
      className="relative h-[144px] overflow-hidden"
      style={{
        backgroundImage: `url(${SwatchImage.src || SwatchImage})`,
        backgroundRepeat: "repeat",
        backgroundSize: "192px 192px",
        backgroundPosition: "top left",
      }}
    >
      {/* 무한 스크롤 컨테이너 */}
      <div className="absolute inset-0 flex items-center">
        <div className="flex animate-scroll-right">
          {/* 첫 번째 그룹 */}
          <div className="flex items-center gap-x-[80px] whitespace-nowrap px-[80px]">
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
          </div>

          {/* 두 번째 그룹 (동일한 내용 반복) */}
          <div className="flex items-center gap-x-[80px] whitespace-nowrap px-[80px]">
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Navigation = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="h-[80px] flex items-center justify-between pl-[40px] border-t-[2px] border-b-[2px] border-[#111111]">
      <div className="flex items-center gap-x-[112px]">
        <Image src={LogoImage} alt="logo" />
        <div className="flex gap-x-[72px] font-[500]">
          <span
            style={{ cursor: "pointer" }}
            onClick={() => scrollToSection("overview")}
          >
            Overview
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => scrollToSection("quest")}
          >
            Quests
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => scrollToSection("proof-dashboard")}
          >
            Proof
          </span>
          <span
            style={{ cursor: "pointer" }}
            onClick={() => scrollToSection("faq")}
          >
            FAQ
          </span>
        </div>
      </div>

      {/* Start Now 버튼 */}
      <button
        style={{
          display: "flex",
          padding: "0px 32px",
          alignItems: "center",
          gap: "72px",
          alignSelf: "stretch",
          borderLeft: "2px solid #00477A",
          background: "#008BEE",
          color: "#FFF",
          fontFamily: '"IBM Plex Mono"',
          fontSize: "20px",
          fontStyle: "normal",
          fontWeight: 600,
          lineHeight: "normal",
          letterSpacing: "-0.1px",
          cursor: "pointer",
        }}
      >
        Start Now
      </button>
    </div>
  );
};

const Header: React.FC = () => {
  return (
    <header>
      <Lines />
      <Banner />
      <Navigation />
    </header>
  );
};

export default Header;
