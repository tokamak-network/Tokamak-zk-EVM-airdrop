import Image from "next/image";
import React from "react";
import PipeImage from "@/assets/hero/overview/pipe.png";
import PipeImageMobile from "@/assets/hero/overview/pipe-mobile.png";
import QuestSection from "./hero/QuestSection";

const Overview = () => {
  return (
    <div id="overview" className="w-full grid-background flex justify-center">
      {/* Desktop Layout */}
      <div className="hidden desktop:flex relative w-full h-[700px] pl-[72px] items-center">
        <div className="flex flex-col justify-between min-w-[630px] max-w-[630px] h-[472px]">
          <div className="text-hero-title">
            <div>Experience</div>
            <div>Tokamak zk-EVM</div>
            <div>on Playground</div>
          </div>
          <div
            className="flex flex-col"
            style={{
              color: "var(--text, #002139)",
              fontFamily: '"IBM Plex Mono"',
              fontSize: "26px",
              fontStyle: "normal",
              fontWeight: "400",
              lineHeight: "38px",
              letterSpacing: "-0.13px",
            }}
          >
            <span>Try real onchain tasks,</span>
            <span>prove your actions,</span>
            <span>and earn TON.</span>
          </div>
        </div>
        <Image
          src={PipeImage}
          alt="overview"
          className="absolute bottom-0 right-0 w-auto h-[550px]"
        />
      </div>

      {/* Mobile Layout */}
      <div className="desktop:hidden w-full pl-[21px] pt-[40px] flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-full flex flex-col items-center text-center">
          <div
            className="mb-[32px]"
            style={{
              color: "#00477a",
              textShadow:
                "-2px -2px 0 #7ed7ff, -2px 0 0 #7ed7ff, -2px 2px 0 #7ed7ff, 0 -2px 0 #7ed7ff, 0 2px 0 #7ed7ff, 2px -2px 0 #7ed7ff, 2px 0 0 #7ed7ff, 2px 2px 0 #7ed7ff",
              filter: "drop-shadow(2px 2px 0 #00477a)",
              fontFamily: '"Jersey 10", "Press Start 2P", monospace',
              fontSize: "50px",
              fontStyle: "normal",
              fontWeight: "400",
              lineHeight: "normal",
              letterSpacing: "1px",
            }}
          >
            <div>Experience</div>
            <div>Tokamak zk-EVM</div>
            <div>on Playground</div>
          </div>
          <div
            className="flex flex-col text-center"
            style={{
              color: "var(--text, #002139)",
              fontFamily: '"IBM Plex Mono"',
              fontSize: "20px",
              fontStyle: "normal",
              fontWeight: "400",
              lineHeight: "30px",
              letterSpacing: "-0.1px",
            }}
          >
            <span>Try real onchain tasks,</span>
            <span>prove your actions,</span>
            <span>and earn TON.</span>
          </div>

          {/* Mobile Pipe Image */}
          <div className="mt-[32px] w-full flex justify-end">
            <Image
              src={PipeImageMobile}
              alt="overview mobile"
              className="w-auto h-auto max-w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const BorderLine = () => {
  return (
    <div
      className="w-full h-[2px] relative z-10"
      style={{
        backgroundColor: "#111111",
        borderTop: "2px solid #111111",
      }}
    ></div>
  );
};

const Hero: React.FC = () => {
  return (
    <section className="flex flex-col justify-center items-center">
      <Overview />
      <BorderLine />
      <QuestSection />
    </section>
  );
};

export default Hero;
