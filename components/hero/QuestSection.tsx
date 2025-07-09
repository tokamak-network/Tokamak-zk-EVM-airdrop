import React from "react";
import Image from "next/image";
import Buttons from "./Buttons";
import { HeroCaoursel } from "./HeroCaoursel";
import QuestBGImage from "@/assets/hero/quest-bg.png";
import QuestBoardBGImage from "@/assets/hero/quest-board-bg.png";

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

const notesCellStyle = {
  flex: "1 0 0",
  color: "var(--text, #002139)",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "16px",
  fontStyle: "normal" as const,
  fontWeight: "400",
  lineHeight: "normal",
  letterSpacing: "-0.08px",
};

const ArrowIcon = () => (
  <div
    className="flex-shrink-0"
    style={{
      width: "21px",
      height: "12px",
    }}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="24"
      viewBox="0 0 14 24"
      fill="none"
    >
      <g filter="url(#filter0_d_1588_115946)">
        <path
          d="M2.50422e-07 0.000488138L3 0.000488174L3 3.00049L6 3.00049L6 6.00049L9 6.00049L9 9.00049L12 9.00049L12 12.0005L9 12.0005L9 15.0005L6 15.0005L6 18.0005L3 18.0005L3 21.0005L0 21.0005L2.50422e-07 0.000488138Z"
          fill="#00CCEC"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_1588_115946"
          x="0"
          y="0.000488281"
          width="14"
          height="24"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dx="2" dy="3" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.211765 0 0 0 0 0.34902 0 0 0 0 0.411765 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1588_115946"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1588_115946"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  </div>
);

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
      id="quest"
      className="grid-background relative"
      style={{
        display: "flex",
        width: "1356px",
        padding: "58px 0px",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <Image
        className="absolute top-[39px] left-0 w-[332px] h-[367px]"
        src={QuestBGImage}
        alt="QuestBGImage"
      />
      <h1 className="text-hero-title-70">Quests</h1>
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
        width: "1356px",
        padding: "58px 0px",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <Image
        className="absolute top-[229px] right-0"
        src={QuestBoardBGImage}
        alt="QuestBoardBGImage"
      />
      <h1 className="text-hero-title-70">Quest Board</h1>
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

const Notes = () => {
  return (
    <div
      className="grid-background relative"
      style={{
        display: "flex",
        width: "1356px",
        padding: "58px 0px",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <h1 className="text-hero-title-70">Notes</h1>
      <div
        style={{
          display: "flex",
          width: "900px",
          flexDirection: "column",
          alignItems: "flex-start",
          border: "1px solid var(--line, #00477A)",
          background: "#FFF",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid var(--line, #00477A)",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            Only one submission per wallet address is allowed
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid var(--line, #00477A)",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            Submissions with copied content may be excluded from rewards
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid var(--line, #00477A)",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            Make sure to enter accurate details — changes won't be allowed later
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid var(--line, #00477A)",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            In the event of a tie, submission time and feedback quality will be
            considered
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
          }}
        >
          <ArrowIcon />
          <div style={notesCellStyle}>
            <div className="font-bold">
              Minimum and recommended system requirements:
            </div>
            <div>
              <div>Minimum: at least 16GB RAM</div>
              <div>Recommended: GPU supporting CUDA</div>
            </div>
          </div>
        </div>
      </div>
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
        <Notes />
      </div>
    </div>
  );
};

export default QuestSection;
