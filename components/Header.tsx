"use client";

import React, { useState, useEffect } from "react";
import LogoImage from "@/assets/header/logo.svg";
import Image from "next/image";
import { isPlaygroundAppSource } from "@/utils/url";
import { LINKS } from "@/constants";



const Navigation = () => {
  const [isFromPlaygroundApp, setIsFromPlaygroundApp] = useState(false);

  useEffect(() => {
    setIsFromPlaygroundApp(isPlaygroundAppSource());
  }, []);

  const scrollToSection = (sectionId: string) => {
    // Check if mobile screen (1359px and below)
    const isMobile = window.innerWidth <= 1359;

    let targetId = sectionId;

    if (isMobile) {
      // Map desktop IDs to mobile IDs
      switch (sectionId) {
        case "quest":
          targetId = "quest-mobile";
          break;
        case "proof-dashboard":
          targetId = "proof-mobile";
          break;
        case "faq":
          targetId = "faq-mobile";
          break;
        default:
          targetId = sectionId;
      }
    }

    const element = document.getElementById(targetId);
    if (element) {
      const elementPosition =
        element.getBoundingClientRect().top + window.pageYOffset;
      // Calculate navigation height offset
      const navigationHeight = isMobile ? 62 : 80; // Mobile navigation height: ~62px, Desktop: 80px
      const targetPosition = elementPosition - navigationHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleButtonClick = () => {
    if (isFromPlaygroundApp) {
      window.open(LINKS.SUBMIT_PROOF, "_blank");
    } else {
      window.open(
        "https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/releases/tag/1.0.0",
        "_blank"
      );
    }
  };

  return (
    <>
      {/* Mobile Logo Section - NOT sticky */}
      <div className="desktop:hidden flex justify-center items-center bg-gradient-to-r from-[#0a1930] to-[#1a2347] py-4">
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
      <div className="hidden desktop:flex h-[80px] items-center justify-between pl-[40px] border-t-[2px] border-b-[2px] border-[#4fc3f7] bg-gradient-to-r from-[#0a1930] to-[#1a2347] sticky top-0 z-50">
        <div className="flex items-center gap-x-[112px]">
          <Image src={LogoImage} alt="logo" />
          <div className="flex gap-x-[72px] font-[500] text-[20px] text-white">
            <span
              style={{ cursor: "pointer" }}
              onClick={() => scrollToSection("overview")}
              className="hover:text-[#4fc3f7] hover:scale-110 transition-all duration-300"
            >
              Overview
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => scrollToSection("quest")}
              className="hover:text-[#4fc3f7] hover:scale-110 transition-all duration-300"
            >
              Quests
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => scrollToSection("proof-dashboard")}
              className="hover:text-[#4fc3f7] hover:scale-110 transition-all duration-300"
            >
              Proof
            </span>
            <span
              style={{ cursor: "pointer" }}
              onClick={() => scrollToSection("faq")}
              className="hover:text-[#4fc3f7] hover:scale-110 transition-all duration-300"
            >
              FAQ
            </span>
          </div>
        </div>

        {/* Conditional Button */}
        <button
          onClick={handleButtonClick}
          style={{
            display: "flex",
            padding: "0px 32px",
            alignItems: "center",
            gap: "72px",
            alignSelf: "stretch",
            borderLeft: "2px solid #4fc3f7",
            background: "linear-gradient(to right, #1e3a8a, #3730a3)",
            color: "#FFF",
            fontFamily: '"IBM Plex Mono"',
            fontSize: "20px",
            fontStyle: "normal",
            fontWeight: 600,
            lineHeight: "normal",
            letterSpacing: "-0.1px",
            cursor: "pointer",
          }}
          className="hover:shadow-lg hover:shadow-[#4fc3f7]/50 transition-all duration-300"
        >
          {isFromPlaygroundApp ? "Submit Proof" : "Start Now"}
        </button>
      </div>

      {/* Mobile Navigation - sticky */}
      <div
        className="desktop:hidden flex w-full bg-gradient-to-r from-[#0a1930] to-[#1a2347] sticky top-0 z-50"
        style={{
          borderTop: "2px solid #4fc3f7",
          borderBottom: "2px solid #4fc3f7",
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
            background: "linear-gradient(to right, #1e3a8a, #3730a3)",
            color: "#FFF",
            fontFamily: '"IBM Plex Mono"',
            fontSize: "22px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "normal",
            letterSpacing: "-0.11px",
            padding: "16px 0",
            borderRight: "2px solid #4fc3f7",
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
            background: "linear-gradient(to right, #1e3a8a, #3730a3)",
            color: "#FFF",
            fontFamily: '"IBM Plex Mono"',
            fontSize: "22px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "normal",
            letterSpacing: "-0.11px",
            padding: "16px 0",
            borderRight: "2px solid #4fc3f7",
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
            background: "linear-gradient(to right, #1e3a8a, #3730a3)",
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
        <div className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500"></div>
      </header>
      <Navigation />
    </>
  );
};

export default Header;
