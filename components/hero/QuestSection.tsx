import React from "react";
import Image from "next/image";
import Buttons from "./Buttons";
import { HeroCaoursel } from "./HeroCaoursel";
import QuestBGImage from "@/assets/hero/quest-bg.png";
import QuestBoardBGImage from "@/assets/hero/quest-board-bg.png";
import CTA_2 from "@/assets/hero/buttons/CTA-2.svg";
import CTA_2_MOBILE from "@/assets/hero/buttons/CTA-2-mobile.svg";

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

const mobileContentStyle = {
  color: "var(--text, #002139)",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "16px",
  fontStyle: "normal" as const,
  fontWeight: "400",
  lineHeight: "normal",
  letterSpacing: "-0.08px",
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
      height: "21px",
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
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
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

// 모바일 카드 컴포넌트
interface MobileCardProps {
  title: string;
  children: React.ReactNode;
  isLastRow?: boolean;
}

const MobileCard: React.FC<MobileCardProps> = ({
  title,
  children,
  isLastRow = false,
}) => {
  return (
    <div
      className="w-full border border-[#00477A] bg-white"
      style={{
        marginBottom: isLastRow ? "0" : "16px",
      }}
    >
      <div className="px-[20px] py-[12px] bg-[#ECF9FF] border-b border-[#00477A]">
        <span style={titleStyle}>{title}</span>
      </div>
      <div className="px-[20px] py-[12px] bg-white">
        <div style={mobileContentStyle}>{children}</div>
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

// QuestBoard용 2행 테이블 컴포넌트 (제목+리워드가 같은 행, 내용이 아래 행)
interface QuestBoardRowProps {
  title: string;
  content: React.ReactNode;
  reward: React.ReactNode;
  isLastRow?: boolean;
}

const QuestBoardRow: React.FC<QuestBoardRowProps> = ({
  title,
  content,
  reward,
  isLastRow = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid var(--line, #00477A)",
      }}
    >
      {/* 제목 + 리워드 행 */}
      <div style={{ display: "flex" }}>
        <div className="w-[250px] flex items-center justify-center border-b-[1px] border-r-[1px] border-[#00477A] bg-[#ECF9FF] py-[16px]">
          <span style={titleStyle}>{title}</span>
        </div>
        <div className="w-[650px] flex items-center justify-end px-[20px] py-[16px] border-b-[1px] border-r-[1px] border-[#00477A] bg-[#ECF9FF]">
          {reward}
        </div>
      </div>

      {/* 내용 행 */}
      <div style={{ display: "flex" }}>
        <div className="w-[900px] px-[20px] py-[16px] flex items-start justify-start border-b-[1px] border-r-[1px] border-[#00477A] text-left bg-white">
          {content}
        </div>
      </div>
    </div>
  );
};

// QuestBoard용 모바일 카드 컴포넌트
interface QuestBoardMobileCardProps {
  title: string;
  content: React.ReactNode;
  reward: React.ReactNode;
  isLastRow?: boolean;
}

const QuestBoardMobileCard: React.FC<QuestBoardMobileCardProps> = ({
  title,
  content,
  reward,
  isLastRow = false,
}) => {
  const mobileTitleStyle = {
    ...titleStyle,
    fontSize: "16px",
    lineHeight: "1.3",
  };

  const mobileRewardStyle = {
    color: "#008BEE",
    fontFamily: '"IBM Plex Mono"',
    fontSize: "16px",
    fontStyle: "normal" as const,
    fontWeight: "700",
    lineHeight: "1.3",
    letterSpacing: "-0.08px",
  };

  const mobileUnifiedContentStyle = {
    ...mobileContentStyle,
    fontSize: "16px",
  };

  return (
    <div
      className="w-full border border-[#00477A] bg-white"
      style={{
        marginBottom: isLastRow ? "0" : "8px",
      }}
    >
      <div className="px-[20px] py-[12px] bg-[#ECF9FF] border-b border-[#00477A] flex items-center gap-[12px]">
        <div className="flex-1" style={mobileTitleStyle}>
          {title}
        </div>
        <div
          className="flex-shrink-0 flex items-center"
          style={{ textAlign: "right", minHeight: "20px" }}
        >
          <div style={mobileRewardStyle}>{reward}</div>
        </div>
      </div>
      <div className="px-[20px] py-[12px] bg-white">
        <div style={mobileUnifiedContentStyle}>{content}</div>
      </div>
    </div>
  );
};

const Quest = () => {
  return (
    <div
      id="quest"
      className="grid-background relative w-full desktop:w-[1356px] px-[20px] desktop:px-0 py-[32px] desktop:py-[58px]"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <Image
        className="hidden desktop:block absolute top-[39px] left-0 w-[332px] h-[367px]"
        src={QuestBGImage}
        alt="QuestBGImage"
      />
      <h1 className="text-hero-title-70">Quests</h1>

      {/* Desktop Layout */}
      <div
        className="hidden desktop:flex"
        style={{
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

      {/* Mobile Layout */}
      <div className="desktop:hidden w-full flex flex-col">
        <MobileCard title="How to Participate">
          Complete at least one task from the quest board
        </MobileCard>

        <MobileCard title="Reward Criteria">
          Complete at least one task from the mission board to be eligible. Top
          100 scorers will be rewarded with TON tokens
        </MobileCard>

        <MobileCard title="Reward Options">
          <div className="flex flex-col gap-[12px] w-full">
            <div className="flex flex-col gap-[6px]">
              <span style={{ ...mobileContentStyle, fontWeight: "700" }}>
                1.Stake & Earn More (Default Option)
              </span>
              <div className="flex flex-col gap-[2px] ml-[12px]">
                <span style={mobileContentStyle}>
                  - Lock your reward to receive a 20% bonus.
                </span>
                <span style={mobileContentStyle}>
                  - Example: 100 TON → 120 TON (claimable after lock period)
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <span style={{ ...mobileContentStyle, fontWeight: "700" }}>
                2.Claim Now (Instant Payout)
              </span>
              <div className="flex flex-col gap-[2px] ml-[12px]">
                <span style={mobileContentStyle}>
                  - Receive TON immediately with no bonus.
                </span>
                <span style={mobileContentStyle}>
                  - Example: 100 TON → ~83 TON
                </span>
              </div>
            </div>
          </div>
        </MobileCard>

        <MobileCard title="Schedule" isLastRow>
          <div>- Deadline: TBD</div>
          <div>- Announcement: TBD</div>
          <div>- Result Rewards Distribution: TBD</div>
        </MobileCard>
      </div>

      <Buttons />
    </div>
  );
};

// Submit Proof Button 컴포넌트
const SubmitProofButton = () => {
  return (
    <div className="flex items-center justify-center">
      {/* 데스크탑용 CTA_2 (1360px 이상에서 표시) */}
      <Image
        src={CTA_2}
        alt="submit proof"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="hidden desktop:block"
      />

      {/* 모바일용 CTA_2_MOBILE (1359px 이하에서 표시) */}
      <Image
        src={CTA_2_MOBILE}
        alt="submit proof"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="block desktop:hidden"
      />
    </div>
  );
};

const QuestBoard = () => {
  return (
    <div
      className="grid-background relative w-full desktop:w-[1356px] px-[20px] desktop:px-0 py-[32px] desktop:py-[58px]"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <Image
        className="hidden desktop:block absolute top-[229px] right-0"
        src={QuestBoardBGImage}
        alt="QuestBoardBGImage"
      />
      <h1 className="text-hero-title-70">Quest Board</h1>

      {/* Desktop Layout - 기존 디자인 유지 */}
      <div
        className="hidden desktop:flex w-full desktop:w-[900px]"
        style={{
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

      {/* Mobile Layout */}
      <div className="desktop:hidden w-full flex flex-col">
        <QuestBoardMobileCard
          title="Setup and Feature Attempt"
          content="Attempting Playground setup and initial feature usage"
          reward="20 TON"
        />

        <QuestBoardMobileCard
          title="Feature Completion"
          content="Completing the use of key features within the Playground"
          reward="30 TON"
        />

        <QuestBoardMobileCard
          title="Experience Feedback"
          content="Provide meaningful suggestions or bug reports"
          reward={
            <>
              Up to
              <br />
              25 TON
            </>
          }
        />

        <QuestBoardMobileCard
          title="SNS Activity"
          content={
            <div>
              <div>Posts/comments/shares about Playground on social media:</div>
              <ul className="mt-2 ml-4">
                <li>• Follow X</li>
                <li>• share posts</li>
                <li>• comments</li>
                <li>• YouTube subscribe</li>
              </ul>
            </div>
          }
          reward="20 TON"
        />

        <QuestBoardMobileCard
          title="Quiz"
          content="Answer a short quiz"
          reward="5 TON"
          isLastRow
        />
      </div>

      <SubmitProofButton />
    </div>
  );
};

// Notes Mobile Card 컴포넌트
interface NotesMobileCardProps {
  children: React.ReactNode;
  isLastRow?: boolean;
}

const NotesMobileCard: React.FC<NotesMobileCardProps> = ({
  children,
  isLastRow = false,
}) => {
  return (
    <div
      className="w-full border border-[#00477A] bg-white"
      style={{
        marginBottom: isLastRow ? "0" : "16px",
      }}
    >
      <div className="px-[20px] py-[12px] bg-white flex items-center gap-[16px]">
        <div className="flex-shrink-0">
          <ArrowIcon />
        </div>
        <div className="flex-1" style={mobileContentStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};

const Notes = () => {
  return (
    <div
      className="grid-background relative w-full desktop:w-[1356px] px-[20px] desktop:px-0 py-[32px] desktop:py-[58px]"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <h1 className="text-hero-title-70">Notes</h1>

      {/* Desktop Layout */}
      <div
        className="hidden desktop:flex w-full desktop:w-[900px]"
        style={{
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

      {/* Mobile Layout */}
      <div className="desktop:hidden w-full flex flex-col">
        <NotesMobileCard>
          Only one submission per wallet address is allowed
        </NotesMobileCard>

        <NotesMobileCard>
          Submissions with copied content may be excluded from rewards
        </NotesMobileCard>

        <NotesMobileCard>
          Make sure to enter accurate details — changes won't be allowed later
        </NotesMobileCard>

        <NotesMobileCard>
          In the event of a tie, submission time and feedback quality will be
          considered
        </NotesMobileCard>

        <NotesMobileCard isLastRow>
          <div>
            <div className="font-bold">
              Minimum and recommended system requirements:
            </div>
            <div>
              <div>Minimum: at least 16GB RAM</div>
              <div>Recommended: GPU supporting CUDA</div>
            </div>
          </div>
        </NotesMobileCard>
      </div>
    </div>
  );
};

const QuestSection = () => {
  return (
    <div className="w-full flex flex-col items-center bg-[#ccefff]">
      {/* Desktop Layout - 기존 구조 유지 */}
      <div className="hidden desktop:flex w-full flex-col items-center gap-[40px] p-[40px]">
        <h1
          className="text-center"
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

        <div className="flex flex-col w-full desktop:w-[1360px] border-2 border-[#00477A]">
          <Quest />
          <HeroCaoursel />
          <QuestBoard />
          <HeroCaoursel />
          <Notes />
        </div>
      </div>

      {/* Mobile Layout - 분리된 구조 */}
      <div className="desktop:hidden w-full flex flex-col items-center">
        {/* Mobile Title Section with padding */}
        <div className="w-full flex flex-col items-center gap-[20px] py-[20px] px-[20px]">
          <h1
            className="text-center"
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
            <div>Complete quests,</div>
            <div>prove what you did,</div>
            <div>and earn TON</div>
          </h1>
        </div>

        {/* Mobile Top Border Line - 전체 너비 */}
        <div className="w-full border-t-2 border-[#00477A]"></div>

        {/* Mobile Content Section */}
        <div className="flex flex-col w-full">
          <Quest />
          <HeroCaoursel />
          <QuestBoard />
          <HeroCaoursel />
          <Notes />
        </div>

        {/* Mobile Bottom Border Line - 전체 너비 */}
        <div className="w-full border-b-2 border-[#00477A]"></div>
      </div>
    </div>
  );
};

export default QuestSection;
