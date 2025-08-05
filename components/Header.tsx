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
      className="desktop:block hidden relative h-[144px] overflow-hidden"
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

  const handlePlaygroundClick = () => {
    window.open(
      "https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/blob/main/packages/playground-hub/README.md",
      "_blank"
    );
  };

  return (
    <>
      {/* Mobile Logo Section - NOT sticky */}
      <div className="desktop:hidden flex justify-center items-center bg-white py-4">
        <Image
          src={LogoImage}
          alt="logo"
          style={{
            width: "318px",
            height: "27px",
            flexShrink: 0,
            aspectRatio: "106/9",
          }}
        />
      </div>

      {/* Desktop Navigation - sticky */}
      <div className="hidden desktop:flex h-[80px] items-center justify-between pl-[40px] border-t-[2px] border-b-[2px] border-[#111111] bg-white sticky top-0 z-50">
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
          onClick={handlePlaygroundClick}
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

      {/* Mobile Navigation - sticky */}
      <div
        className="desktop:hidden flex w-full bg-white sticky top-0 z-50"
        style={{
          borderTop: "2px solid var(--line, #00477A)",
          borderBottom: "2px solid var(--line, #00477A)",
        }}
      >
        <div
          className="flex cursor-pointer"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            flex: "1 0 0",
            alignSelf: "stretch",
            background: "#008BEE",
            color: "#FFF",
            fontFamily: '"IBM Plex Mono"',
            fontSize: "22px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "normal",
            letterSpacing: "-0.11px",
            padding: "16px 0",
            borderRight: "2px solid var(--line, #00477A)",
          }}
          onClick={() => scrollToSection("quest")}
        >
          Quests
        </div>
        <div
          className="flex cursor-pointer"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            flex: "1 0 0",
            alignSelf: "stretch",
            background: "#008BEE",
            color: "#FFF",
            fontFamily: '"IBM Plex Mono"',
            fontSize: "22px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "normal",
            letterSpacing: "-0.11px",
            padding: "16px 0",
            borderRight: "2px solid var(--line, #00477A)",
          }}
          onClick={() => scrollToSection("proof-dashboard")}
        >
          Proof
        </div>
        <div
          className="flex cursor-pointer"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "8px",
            flex: "1 0 0",
            alignSelf: "stretch",
            background: "#008BEE",
            color: "#FFF",
            fontFamily: '"IBM Plex Mono"',
            fontSize: "22px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "normal",
            letterSpacing: "-0.11px",
            padding: "16px 0",
          }}
          onClick={() => scrollToSection("faq")}
        >
          FAQ
        </div>
      </div>
    </>
  );
};

const Header: React.FC = () => {
  return (
    <>
      <header>
        <Lines />
        <Banner />
      </header>
      <Navigation />
    </>
  );
};

export default Header;
