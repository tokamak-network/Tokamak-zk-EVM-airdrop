"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import QuestSection from "./hero/QuestSection";
import CTA_1 from "@/assets/hero/buttons/CTA.svg";
import CTA_2 from "@/assets/hero/buttons/CTA-2.svg";
import CTA_4 from "@/assets/hero/buttons/CTA-4.svg";
import { isPlaygroundAppSource } from "@/utils/url";
import { LINKS } from "@/constants";

// Star Component for cosmic background
const Star = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`absolute text-white ${className}`} style={style}>
    ✦
  </div>
);

// Plus Sign Component for cosmic background ( this is for the animation of the hero section )
const PlusSign = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`absolute text-white ${className}`} style={style}>
    +
  </div>
);

// Gear Component for cosmic background
const Gear = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`absolute text-white ${className}`} style={style}>
    ⚙
  </div>
);

const Overview = () => {
  const [isFromPlaygroundApp, setIsFromPlaygroundApp] = useState(false);

  useEffect(() => {
    setIsFromPlaygroundApp(isPlaygroundAppSource());
  }, []);

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
    <div
      id="overview"
      className="w-full min-h-screen flex flex-col justify-center items-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #0a1930 0%, #1a2347 100%)',
      }}
    >
      {/* Cosmic Background Elements */}
      <Star className="text-lg animate-pulse" style={{ top: '10%', left: '10%', animationDelay: '0s' }} />
      <Star className="text-sm animate-pulse" style={{ top: '20%', right: '15%', animationDelay: '1s' }} />
      <Star className="text-xl animate-pulse" style={{ top: '30%', left: '20%', animationDelay: '2s' }} />
      <PlusSign className="text-lg animate-pulse" style={{ top: '15%', right: '25%', animationDelay: '0.5s' }} />
      <PlusSign className="text-sm animate-pulse" style={{ bottom: '40%', left: '15%', animationDelay: '1.5s' }} />
      <Gear className="text-lg animate-pulse" style={{ bottom: '20%', right: '10%', animationDelay: '2.5s' }} />
      <Star className="text-md animate-pulse" style={{ bottom: '35%', right: '30%', animationDelay: '0.8s' }} />
      <PlusSign className="text-xl animate-pulse" style={{ top: '60%', left: '8%', animationDelay: '1.8s' }} />
      <Star className="text-sm animate-pulse" style={{ top: '70%', right: '20%', animationDelay: '2.2s' }} />
      <Gear className="text-sm animate-pulse" style={{ top: '25%', left: '85%', animationDelay: '1.2s' }} />

      {/* Main Content */}
      <div className="flex flex-col items-center text-center space-y-8 z-10 px-4">
        {/* ZK Proofs. One Click. */}
        <div className="flex flex-col items-center">
          <h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-wider"
            style={{
              fontFamily: '"Jersey 10", "Press Start 2P", monospace',
              textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
            }}
          >
            ZK Proofs. One Click.
          </h1>
          
          {/* Playground */}
          <h2 
            className="text-6xl md:text-8xl lg:text-[12rem] font-bold mt-4 bg-gradient-to-r from-[#4fc3f7] to-[#29b6f6] bg-clip-text text-transparent"
            style={{
              fontFamily: '"Jersey 10", "Press Start 2P", monospace',
            }}
          >
            Playground
          </h2>
        </div>

        {/* Interactive Button */}
        <div className="mt-16 relative flex items-center justify-center">
          {isFromPlaygroundApp ? (
            // Show Submit Proof button when from playground app
            <Image
              src={CTA_2}
              alt="Submit Proof"
              style={{ cursor: "pointer" }}
              draggable={false}
              className="transition-transform duration-200 hover:scale-125"
              onClick={handleButtonClick}
            />
          ) : (
            <>
              {/* 데스크탑용 CTA_1 (1360px 이상에서 표시) */}
              <Image
                src={CTA_1}
                alt="Try it Now"
                style={{ cursor: "pointer" }}
                draggable={false}
                className="hidden desktop:block transition-transform duration-200 hover:scale-125"
                onClick={handleButtonClick}
              />

              {/* 모바일용 CTA_4 (1359px 이하에서 표시) */}
              <Image
                src={CTA_4}
                alt="Start on Desktop"
                style={{ cursor: "pointer" }}
                draggable={false}
                className="block desktop:hidden transition-transform duration-200 hover:scale-125"
                onClick={handleButtonClick}
              />
            </>
          )}
        </div>

        {/* Event Information */}
        <div className="mt-12 text-center">
          <div 
            className="text-yellow-300 text-2xl font-bold mb-4"
            style={{
              fontFamily: '"Jersey 10"',
              textShadow: '2px 2px 0px #1a2347',
              letterSpacing: '2px',
            }}
          >
            Event: 2025.09.11 ~ 09.15
          </div>
          <div 
            className="text-white text-lg max-w-2xl"
            style={{
              fontFamily: '"IBM Plex Mono"',
              lineHeight: '1.6',
            }}
          >
            Complete onchain tasks, prove your actions, and earn TON.
          </div>
        </div>
      </div>

      {/* Rainbow Stripe at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500"></div>
    </div>
  );
};

const Hero: React.FC = () => {
  return (
    <section className="flex flex-col justify-center items-center">
      <Overview />
      <QuestSection />
    </section>
  );
};

export default Hero;
