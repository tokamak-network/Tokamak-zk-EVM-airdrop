import React from "react";
import Image from "next/image";
import Buttons from "./Buttons";
import { HeroCaoursel } from "./HeroCaoursel";
import QuestBGImage from "@/assets/hero/Quest-bg.svg";

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

const rewardStyle = {
  color: "#008BEE",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "18px",
  fontStyle: "normal" as const,
  fontWeight: "700",
  lineHeight: "normal",
  letterSpacing: "-0.09px",
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
        borderLeft: "1px solid var(--line, #00477A)",
        ...(isLastRow && { borderBottom: "1px solid var(--line, #00477A)" }),
      }}
    >
      <div className="w-[250px] flex items-center justify-center border-b-[1px] border-r-[1px] border-[#00477A] bg-[#ECF9FF]">
        <span style={titleStyle}>{title}</span>
      </div>
      <div className="w-[650px] px-[20px] py-[16px] flex items-start justify-start border-b-[1px] border-r-[1px] border-[#00477A] text-left bg-white">
        {children}
      </div>
    </div>
  );
};

// 3칸 테이블 행 컴포넌트
interface ThreeColumnTableRowProps {
  title: string;
  content: React.ReactNode;
  reward: React.ReactNode;
  isLastRow?: boolean;
}

const ThreeColumnTableRow: React.FC<ThreeColumnTableRowProps> = ({
  title,
  content,
  reward,
  isLastRow = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        borderLeft: "1px solid var(--line, #00477A)",
        ...(isLastRow && { borderBottom: "1px solid var(--line, #00477A)" }),
      }}
    >
      {/* 첫번째 칸 - 250px */}
      <div className="w-[250px] flex items-center justify-start px-[24px] py-[16px] border-b-[1px] border-r-[1px] border-[#00477A] bg-[#ECF9FF]">
        <span style={titleStyle}>{title}</span>
      </div>

      {/* 두번째 칸 - 545px */}
      <div className="w-[545px] px-[20px] py-[16px] flex items-center justify-start border-b-[1px] border-r-[1px] border-[#00477A] text-left bg-white">
        {content}
      </div>

      {/* 세번째 칸 - 105px */}
      <div className="w-[105px] flex items-center justify-start px-[16px] py-[16px] border-b-[1px] border-r-[1px] border-[#00477A] text-left bg-white">
        {reward}
      </div>
    </div>
  );
};

const Quest = () => {
  return (
    <div
      className="grid-background relative"
      style={{
        display: "flex",
        width: "1360px",
        padding: "58px 0px",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <Image
        className="absolute top-[39px] left-0"
        src={QuestBGImage}
        alt="QuestBGImage"
      />
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

const QuestBoard = () => {
  return (
    <div
      className="grid-background relative"
      style={{
        display: "flex",
        width: "1360px",
        padding: "58px 0px",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <Image
        className="absolute top-[39px] left-0"
        src={QuestBGImage}
        alt="QuestBGImage"
      />
      <h1 className="text-hero-title">Quest Board</h1>
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
          <ThreeColumnTableRow
            title="Setup and Feature Attempt"
            content={
              <span style={contentStyle}>
                Attempting Playground setup and initial feature usage
              </span>
            }
            reward={<span style={rewardStyle}>20 TON</span>}
          />

          <ThreeColumnTableRow
            title="Feature Completion"
            content={
              <span style={contentStyle}>
                Completing the use of key features within the Playground
              </span>
            }
            reward={<span style={rewardStyle}>30 TON</span>}
          />

          <ThreeColumnTableRow
            title="Experience Feedback"
            content={
              <span style={contentStyle}>
                Provide meaningful suggestions or bug reports
              </span>
            }
            reward={
              <span style={rewardStyle}>
                Up to
                <br />
                25 TON
              </span>
            }
          />

          <ThreeColumnTableRow
            title="SNS Activity"
            content={
              <div style={contentStyle}>
                <div>
                  Posts/comments/shares about Playground on social media:
                </div>
                <ul className="mt-2 ml-4">
                  <li>• Follow X</li>
                  <li>• share posts</li>
                  <li>• comments</li>
                  <li>• YouTube subscribe</li>
                </ul>
              </div>
            }
            reward={<span style={rewardStyle}>20 TON</span>}
          />

          <ThreeColumnTableRow
            title="Quiz"
            content={<span style={contentStyle}>Answer a short quiz</span>}
            reward={<span style={rewardStyle}>5 TON</span>}
            isLastRow
          />
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
        <QuestBoard />
        <HeroCaoursel />
      </div>
    </div>
  );
};

export default QuestSection;
