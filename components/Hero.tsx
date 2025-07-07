import Image from "next/image";
import React from "react";
import PipeImage from "@/assets/hero/overview/pipe.png";
import Buttons from "./hero/Buttons";
import { HeroCaoursel } from "./hero/HeroCaoursel";

// 공통 스타일 정의
const titleStyle = {
  color: "var(--text, #002139)",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "18px",
  fontStyle: "normal" as const,
  fontWeight: "500",
  lineHeight: "normal",
  letterSpacing: "-0.09px",
};

const contentStyle = {
  color: "var(--text, #002139)",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "18px",
  fontStyle: "normal" as const,
  fontWeight: "400",
  lineHeight: "normal",
  letterSpacing: "-0.09px",
};

const boldStyle = {
  color: "var(--text, #002139)",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "16px",
  fontStyle: "normal" as const,
  fontWeight: "700",
  lineHeight: "normal",
  letterSpacing: "-0.08px",
};

const lightStyle = {
  color: "var(--text, #002139)",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "16px",
  fontStyle: "normal" as const,
  fontWeight: "400",
  lineHeight: "normal",
  letterSpacing: "-0.08px",
};

// 테이블 행 컴포넌트
interface TableRowProps {
  title: string;
  children: React.ReactNode;
  isLastRow?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({
  title,
  children,
  isLastRow = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        borderRight: "1px solid var(--line, #00477A)",
        borderLeft: "1px solid var(--line, #00477A)",
        ...(isLastRow && { borderBottom: "1px solid var(--line, #00477A)" }),
      }}
    >
      <div className="w-[250px] flex items-center justify-center border-b-[1px] border-r-[1px] border-[#00477A] bg-[#ECF9FF]">
        <span style={titleStyle}>{title}</span>
      </div>
      <div className="w-[650px] px-[20px] py-[16px] flex items-start justify-start border-b-[1px] border-[#00477A] text-left bg-white">
        {children}
      </div>
    </div>
  );
};

const Overview = () => {
  return (
    <div className="w-full grid-background flex justify-center">
      <div className="flex w-full max-w-[1440px] h-[700px] pl-[72px] gap-x-[97px] items-center">
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
        <Image src={PipeImage} alt="overview" />
      </div>
    </div>
  );
};

const Quest = () => {
  return (
    <div
      style={{
        display: "flex",
        width: "1360px",
        padding: "58px 0px",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <h1 className="text-hero-title">Quests</h1>
      <div
        style={{
          display: "flex",
          width: "900px",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            borderTop: "1px solid var(--line, #00477A)",
          }}
        >
          <TableRow title="How to Participate">
            <span style={contentStyle}>
              Complete at least one task from the quest board
            </span>
          </TableRow>

          <TableRow title="Reward Criteria">
            <span style={contentStyle}>
              Complete at least one task from the mission board to be eligible.
              Top 100 scorers will be rewarded with TON tokens
            </span>
          </TableRow>

          <TableRow title="Reward Options">
            <div className="flex flex-col gap-[16px] w-full">
              <div className="flex flex-col gap-[8px]">
                <span style={boldStyle}>
                  1.Stake & Earn More (Default Option)
                </span>
                <div className="flex flex-col gap-[4px] ml-[16px]">
                  <span style={lightStyle}>
                    - Lock your reward to receive a 20% bonus.
                  </span>
                  <span style={lightStyle}>
                    &nbsp;&nbsp;&nbsp;- Example: 100 TON → 120 TON (claimable
                    after lock period)
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-[8px]">
                <span style={boldStyle}>2.Claim Now (Instant Payout)</span>
                <div className="flex flex-col gap-[4px] ml-[16px]">
                  <span style={lightStyle}>
                    - Receive TON immediately with no bonus.
                  </span>
                  <span style={lightStyle}>- Example: 100 TON → ~83 TON</span>
                </div>
              </div>
            </div>
          </TableRow>

          <TableRow title="Schedule" isLastRow>
            <span style={contentStyle}>
              <div>- Deadline: TBD </div>
              <div>- Announcement: TBD</div>
              <div>- Result Rewards Distribution: TBD</div>
            </span>
          </TableRow>
        </div>
      </div>
      <Buttons />
    </div>
  );
};

const QuestSection = () => {
  return (
    <div className="w-full flex flex-col items-center gap-[40px] p-[40px] bg-[#ccefff]">
      <h1
        style={{
          color: "var(--text, #002139)",
          fontFamily: '"Jersey 10"',
          fontSize: "64px",
          fontStyle: "normal",
          fontWeight: "400",
          lineHeight: "normal",
          letterSpacing: "3.2px",
        }}
      >
        Complete quests, prove what you did, and earn TON
      </h1>
      <div className="flex flex-col w-[1360px] border-2 border-[#00477A]">
        <Quest />
        <HeroCaoursel />
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
