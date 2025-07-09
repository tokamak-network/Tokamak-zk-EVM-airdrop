import Image from "next/image";
import React from "react";
import PipeImage from "@/assets/hero/overview/pipe.png";
import QuestSection from "./hero/QuestSection";

const Overview = () => {
  return (
    <div id="overview" className="w-full grid-background flex justify-center">
      <div className="relative flex w-full  h-[700px] pl-[72px] items-center">
        <div className="flex flex-col justify-between min-w-[630px] max-w-[630px] h-[472px]">
          <div className="text-hero-title">
            <div>Experiehnce</div>
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
    </div>
  );
};

const BorderLine = () => {
  return (
    <div
      className="h-[2px] bg-[#111111]"
      style={{ backgroundColor: "#111111" }}
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
