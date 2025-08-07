import Image from "next/image";
import React from "react";
import PipeImage from "@/assets/hero/overview/pipe.png";
import PipeImageMobile from "@/assets/hero/overview/pipe-mobile.png";
import PipeMiddle from "@/assets/hero/overview/pipe-middle.png";
import QuestSection from "./hero/QuestSection";
import { Lines } from "./common/lines";

const Overview = () => {
  return (
    <div
      id="overview"
      className="w-full grid-background flex justify-center overflow-x-hidden"
    >
      {/* Desktop Layout */}
      <div className="hidden desktop:flex relative w-full h-[700px] pl-[72px] items-center">
        <div className="flex flex-col justify-between min-w-[630px] max-w-[630px] 3xl:max-w-[1130px] h-[472px] 3xl:h-auto 3xl:mt-[95px] gap-y-[30px]">
          <div className="text-hero-title">
            <div className="3xl:hidden">Experience</div>
            <div className="3xl:hidden">Tokamak zk-EVM</div>
            <div className="hidden 3xl:block">Experience Tokamak zk-EVM</div>
            <div>on Playground</div>
          </div>
          <div className="relative max-w-[600px]">
            <Lines height={13} />
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                color: "#FFF716",
                textShadow: "2px 3px 0px #002C4B",
                WebkitTextStrokeWidth: "0.7px",
                WebkitTextStrokeColor: "#002C4B",
                fontFamily: '"Jersey 10"',
                fontSize: "50px",
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
                letterSpacing: "4.5px",
                filter: "drop-shadow(1px 1px 0 #00477a) !important",
              }}
            >
              Event: 2025.08.11 ~ 08.24
            </div>
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
            <span className="3xl:hidden">Try real onchain tasks,</span>
            <span className="3xl:hidden">prove your actions,</span>
            <span className="3xl:hidden">and earn TON.</span>
            <span className="hidden 3xl:block">
              Try real onchain tasks, prove your actions, and earn TON.
            </span>
          </div>
        </div>
        <Image
          src={PipeImage}
          alt="overview"
          className="absolute bottom-0 right-0 w-auto h-[550px]"
        />
      </div>

      {/* Mobile Layout */}
      <div className="desktop:hidden w-full pl-[21px] pt-[40px] flex flex-col items-center justify-center min-h-[400px] overflow-x-hidden">
        <div className="w-full flex flex-col items-center text-center gap-y-[23px] max-w-full">
          <div
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
            className="pr-[21px]"
          >
            <div className="md:hidden">Experience</div>
            <div className="md:hidden">Tokamak zk-EVM</div>
            <div className="hidden md:block">Experience Tokamak zk-EVM</div>
            <div>on Playground</div>
          </div>
          <div className="relative w-full max-w-[600px] pr-[21px]">
            <div className="relative z-0">
              <Lines height={15} />
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center z-10 text-[40px] md:text-[50px] tracking-[3.6px] md:tracking-[2.5px]"
              style={{
                color: "#FFF716",
                textShadow: "2px 3px 0px #002C4B",
                WebkitTextStrokeWidth: "0.7px",
                WebkitTextStrokeColor: "#002C4B",
                fontFamily: '"Jersey 10"',
                fontStyle: "normal",
                fontWeight: 400,
                lineHeight: "normal",
                filter: "drop-shadow(1px 1px 0 #00477a) !important",
              }}
            >
              <span className="md:hidden">2025.08.11 ~ 08.24</span>
              <span className="hidden md:inline">
                Event: 2025.08.11 ~ 08.24
              </span>
            </div>
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
            <span className="md:hidden">Try real onchain tasks,</span>
            <span className="md:hidden">prove your actions,</span>
            <span className="md:hidden">and earn TON.</span>
            <span className="hidden md:block">
              Try real onchain tasks, prove your actions, and earn TON.
            </span>
          </div>

          {/* Mobile Pipe Image */}
          <div className="mt-[32px] w-full relative overflow-hidden">
            <div className="flex justify-end">
              <Image
                src={PipeImageMobile}
                alt="overview mobile"
                className="w-auto h-auto max-w-none md:hidden"
                style={{ marginRight: "-21px" }}
              />
              <Image
                src={PipeMiddle}
                alt="overview middle"
                className="w-[704px] h-auto max-w-none hidden md:block"
                style={{ marginRight: "-21px" }}
              />
            </div>
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
