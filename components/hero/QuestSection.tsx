"use client";
import React from "react";
import Image from "next/image";
import Buttons from "./Buttons";
import { HeroCaoursel } from "./HeroCaoursel";

import CTA_2 from "@/assets/hero/buttons/CTA-2.svg";
import CTA_2_MOBILE from "@/assets/hero/buttons/CTA-2-mobile.svg";
import ExclamationMark from "@/assets/hero/quest/exclamation.svg";
import PlusIcon from "@/assets/hero/quest/plus.svg";
import EqualIcon from "@/assets/hero/quest/equal.svg";
import { LINKS } from "@/constants";

// 공통 스타일 정의
const titleStyle = {
  color: "#ffffff",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "18px",
  fontStyle: "normal" as const,
  fontWeight: "500",
  lineHeight: "normal",
  letterSpacing: "-0.09px",
};

const contentStyle = {
  color: "#ffffff",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "18px",
  fontStyle: "normal" as const,
  fontWeight: "400",
  lineHeight: "normal",
  letterSpacing: "-0.09px",
};

const mobileContentStyle = {
  color: "#ffffff",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "16px",
  fontStyle: "normal" as const,
  fontWeight: "400",
  lineHeight: "normal",
  letterSpacing: "-0.08px",
};

const boldStyle = {
  color: "#ffffff",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "16px",
  fontStyle: "normal" as const,
  fontWeight: "700",
  lineHeight: "normal",
  letterSpacing: "-0.08px",
};

const lightStyle = {
  color: "#ffffff",
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
  fontSize: "26px",
  fontStyle: "normal" as const,
  fontWeight: "700",
  lineHeight: "normal",
  letterSpacing: "-0.09px",
};

const notesCellStyle = {
  flex: "1 0 0",
  color: "#ffffff",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "16px",
  fontStyle: "normal" as const,
  fontWeight: "400",
  lineHeight: "normal",
  letterSpacing: "-0.08px",
};

const subTextStyle = {
  color: "#ffffff",
  fontFamily: '"IBM Plex Mono"',
  fontSize: "15px",
  fontStyle: "normal" as const,
  fontWeight: "400",
  lineHeight: "normal",
  letterSpacing: "-0.54px",
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // isLastRow = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        borderLeft: "1px solid var(--line, #00477A)",
      }}
    >
      <div className="w-[250px] flex items-center justify-center border-b-[1px] border-r-[1px] border-[#4fc3f7] bg-[#1e3a8a]">
        <span style={titleStyle}>{title}</span>
      </div>
      <div className="w-[650px] px-[20px] py-[16px] flex items-start justify-start border-b-[1px] border-r-[1px] border-[#4fc3f7] text-left bg-[#0a1930]">
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
      className="w-full border border-[#4fc3f7] bg-[#0a1930]"
      style={{
        marginBottom: isLastRow ? "0" : "16px",
      }}
    >
      <div className="px-[20px] py-[12px] bg-[#1e3a8a] border-b border-[#4fc3f7]">
        <span style={titleStyle}>{title}</span>
      </div>
      <div className="px-[20px] py-[12px] bg-[#0a1930]">
        <div style={mobileContentStyle}>{children}</div>
      </div>
    </div>
  );
};

// 3칸 테이블 행 컴포넌트
interface ThreeColumnTableRowProps {
  title: string;
  content: React.ReactNode;
  reward?: React.ReactNode;
  isFirstRewardRow?: boolean;
  isLastRewardRow?: boolean;
  isLast?: boolean;
}

const ThreeColumnTableRow: React.FC<ThreeColumnTableRowProps> = ({
  title,
  content,
  reward,
  isFirstRewardRow = false,
  isLastRewardRow = false,
  isLast,
}) => {
  return (
    <div
      style={{
        display: "flex",
        borderLeft: "1px solid var(--line, #00477A)",
        position: "relative",
      }}
    >
      {/* 첫번째 칸 - 250px */}
      <div className="w-[250px] flex items-center justify-start px-[24px] py-[16px] border-b-[1px] border-r-[1px] border-[#4fc3f7] bg-[#1e3a8a]">
        <span style={titleStyle}>{title}</span>
      </div>

      {/* 두번째 칸 - 600px */}
      <div className="w-[600px] px-[20px] py-[16px] flex items-center justify-start border-b-[1px] border-r-[1px] border-[#4fc3f7] text-left bg-[#0a1930]">
        {content}
      </div>

      {/* 세번째 칸 - 105px */}
      <div
        className={`w-[137px] flex items-center justify-center border-r-[1px] border-[#4fc3f7] text-left bg-[#0a1930] relative  ${
          isFirstRewardRow ? "border-t-[1px]" : ""
        } ${isLastRewardRow ? "border-b-[1px]" : ""}`}
      >
        {isLast && (
          <Image
            className="absolute top-[-19px]"
            src={PlusIcon}
            alt={"PlusIcon"}
          />
        )}
        {isLast && (
          <Image
            className="absolute bottom-[-19px]"
            src={EqualIcon}
            alt={"EqualIcon"}
          />
        )}
        {reward}
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
      className="w-full border border-[#4fc3f7] bg-[#0a1930]"
      style={{
        marginBottom: isLastRow ? "0" : "8px",
      }}
    >
      <div className="px-[20px] py-[12px] bg-[#1e3a8a] border-b border-[#4fc3f7] flex items-center gap-[12px]">
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
      <div className="px-[20px] py-[12px] bg-[#0a1930]">
        <div style={mobileUnifiedContentStyle}>{content}</div>
      </div>
    </div>
  );
};

const Quest = () => {
  return (
    <div
      id="quest"
      className="relative w-full desktop:w-[1356px] px-[20px] desktop:px-0 py-[32px] desktop:py-[58px] bg-gradient-to-b from-[#0a1930] to-[#1a2347]"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >

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
              Complete all mandatory tasks (
              <span style={{ fontWeight: "700" }}>
                Feature Completion, Social Media Activity
              </span>
              ) from the quest board to qualify for rewards.
            </span>
          </TableRow>

          <TableRow title="How to Earn">
            <div style={contentStyle}>
              <div className="mt-2">
                - Thirty winners will be selected at random from participants (any abuse will be detected and filtered out).
              </div>
              <div className="mt-2" style={contentStyle}>
                - Each selected participant can earn up to{" "}
                <span style={{ fontWeight: "700" }}>150 TON.</span>
              </div>
            </div>
          </TableRow>

          <TableRow title="Reward Options">
            <div className="flex flex-col gap-[16px] w-full">
              <div className="flex flex-col">
                <span style={boldStyle}>1.Stake (Default Option)</span>
                <div className="flex flex-col gap-[4px] letter-spacing-[-0.32px]">
                  <span style={lightStyle}>
                    - Receive the full reward amount. You can withdraw your rewards with some interest after at least two weeks.
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span style={boldStyle}>2.Claim Now</span>
                <div className="flex flex-col gap-[4px] letter-spacing-[-0.32px]">
                  <span style={lightStyle}>
                    - Receive 50% of your reward immediately
                  </span>
                </div>
              </div>
            </div>
          </TableRow>

          <TableRow title="Schedule">
            <div
              style={contentStyle}
              className="h-[115px] flex flex-col justify-center items-center text-left"
            >
              <div>
                <div>
                  Event Period:{" "}
                  <span style={{ fontWeight: "700" }}>
                    Sep 8 (Mon) – Sep 10 (Wed), 12PM KST
                  </span>
                </div>
                <div style={{ marginTop: "8px" }}>Reward Distribution: Sep 18 (Thu)</div>
              </div>
            </div>
          </TableRow>

          <TableRow title="Community & Support" isLastRow>
            <div style={contentStyle}>
              <div style={{ marginBottom: "12px" }}>
                To report any bugs or technical issues encountered during the
                event, contact us via our official{" "}
                <span
                  style={{
                    fontWeight: "700",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => window.open(LINKS.DISCORD, "_blank")}
                >
                  Discord
                </span>{" "}
                or{" "}
                <span
                  style={{
                    fontWeight: "700",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => window.open("https://github.com/tokamak-network", "_blank")}
                >
                  Github
                </span>
                .
              </div>
              <div style={{ marginTop: "12px", fontSize: "14px", fontWeight: "600", color: "#cccccc" }}>
                Additional Community Links:
              </div>
              <ul
                style={{
                  paddingLeft: "16px",
                  listStyleType: "disc",
                  marginTop: "8px",
                }}
              >
                <li style={{ color: "#ffffff", marginBottom: "4px" }}>
                  Subscribe to our{" "}
                  <span
                    style={{
                      fontWeight: "700",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => window.open(LINKS.YOUTUBE)}
                  >
                    YouTube
                  </span>{" "}
                  channel for tutorials
                </li>
                <li style={{ color: "#ffffff", marginBottom: "4px" }}>
                  Join our{" "}
                  <span
                    style={{
                      fontWeight: "700",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => window.open("https://t.me/+9My2ZmBemYs2YTFk", "_blank")}
                  >
                    Telegram
                  </span>{" "}
                  for updates
                </li>
                <li style={{ color: "#ffffff" }}>
                  Follow{" "}
                  <span
                    style={{
                      fontWeight: "700",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() => window.open("https://x.com/TokamakZKPWorld", "_blank")}
                  >
                    @TokamakZKPWorld
                  </span>{" "}
                  on X for announcements
                </li>
              </ul>
            </div>
          </TableRow>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="desktop:hidden w-full flex flex-col">
        <MobileCard title="How to Participate">
          Complete all mandatory tasks (Feature Completion, Social Media
          Activity) from the quest board to qualify for rewards.
        </MobileCard>

        <MobileCard title="How to Earn">
          <div style={mobileContentStyle}>
            <div className="mt-2">
              - Thirty winners will be selected at random from participants (any abuse will be detected and filtered out).
            </div>
            <div className="mt-2" style={mobileContentStyle}>
              - Each selected participant can earn up to{" "}
              <span style={{ fontWeight: "700" }}>150 TON.</span>
            </div>
          </div>
        </MobileCard>

        <MobileCard title="Reward Options">
          <div className="flex flex-col gap-[12px] w-full">
            <div className="flex flex-col gap-[6px]">
              <span style={{ ...mobileContentStyle, fontWeight: "700" }}>
                1.Stake (Default Option)
              </span>
              <div className="flex flex-col gap-[2px] ml-[12px]">
                <span style={mobileContentStyle}>
                  - Receive the full reward amount. You can withdraw your rewards with some interest after at least two weeks.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <span style={{ ...mobileContentStyle, fontWeight: "700" }}>
                2.Claim Now
              </span>
              <div className="flex flex-col gap-[2px] ml-[12px]">
                <span style={mobileContentStyle}>
                  - Receive 50% of your reward immediately (e.g., 150 TON → 75
                  TON)
                </span>
              </div>
            </div>
          </div>
        </MobileCard>

        <MobileCard title="Schedule">
          <div style={{ ...mobileContentStyle, textAlign: "center" }}>
            <div>
              Event Period:
              <br className="max-500:block hidden" />
              <span style={{ fontWeight: "700" }}>
                Sep 8 (Mon) – Sep 10 (Wed), 12PM KST
              </span>
            </div>
            <div style={{ marginTop: "8px" }}>
              <span style={{ fontWeight: "700" }}>Reward Distribution:</span>
              <br className="max-500:block hidden" />
              Sep 18 (Thu)
            </div>
          </div>
        </MobileCard>


        <MobileCard title="Community & Support" isLastRow>
          <div style={mobileContentStyle}>
            <div style={{ marginBottom: "12px" }}>
              To report any bugs or technical issues encountered during the
              event, contact us via our official{" "}
              <span
                style={{
                  fontWeight: "700",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => window.open(LINKS.DISCORD, "_blank")}
              >
                Discord
              </span>{" "}
              or{" "}
              <span
                style={{
                  fontWeight: "700",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => window.open("https://github.com/tokamak-network", "_blank")}
              >
                Github
              </span>
              .
            </div>
            <div style={{ marginTop: "12px", fontSize: "12px", fontWeight: "600", color: "#cccccc" }}>
              Additional Community Links:
            </div>
            <ul
              style={{
                paddingLeft: "16px",
                listStyleType: "disc",
                marginTop: "8px",
              }}
            >
              <li style={{ color: "#ffffff", marginBottom: "4px" }}>
                Subscribe to our{" "}
                <span
                  style={{
                    fontWeight: "700",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => window.open(LINKS.YOUTUBE)}
                >
                  YouTube
                </span>{" "}
                channel for tutorials
              </li>
              <li style={{ color: "#ffffff", marginBottom: "4px" }}>
                Join our{" "}
                <span
                  style={{
                    fontWeight: "700",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => window.open("https://t.me/+9My2ZmBemYs2YTFk", "_blank")}
                >
                  Telegram
                </span>{" "}
                for updates
              </li>
              <li style={{ color: "#ffffff" }}>
                Follow{" "}
                <span
                  style={{
                    fontWeight: "700",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                  onClick={() => window.open("https://x.com/TokamakZKPWorld", "_blank")}
                >
                  @TokamakZKPWorld
                </span>{" "}
                on X for announcements
              </li>
            </ul>
          </div>
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
        className="hidden desktop:block transition-transform duration-200 hover:scale-125"
        onClick={() =>
          // alert(
          //   "Hold on! 🚀 TONs are still traveling from space! Please wait a little longer~ ⏰"
          // )
          window.open(LINKS.SUBMIT_PROOF, "_blank")
        }
      />

      {/* 모바일용 CTA_2_MOBILE (1359px 이하에서 표시) */}
      <Image
        src={CTA_2_MOBILE}
        alt="submit proof"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="block desktop:hidden transition-transform duration-200 hover:scale-125"
        onClick={() =>
          // alert(
          //   "Hold on! 🚀 TONs are still traveling from space! Please wait a little longer~ ⏰"
          // )
          window.open(LINKS.SUBMIT_PROOF, "_blank")
        }
      />
    </div>
  );
};

const QuestBoard = () => {
  return (
    <div
      className="relative w-full desktop:w-[1356px] px-[20px] desktop:px-0 py-[32px] desktop:py-[58px] bg-gradient-to-b from-[#0a1930] to-[#1a2347]"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >

      <h1 className="text-hero-title-70">Quest Board</h1>

      {/* Desktop Layout - 기존 디자인 유지 */}
      <div
        className="hidden desktop:flex w-full desktop:w-[1000px]"
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          zIndex: 10,
        }}
      >
        <div
          style={{
            borderTop: "1px solid var(--line, #00477A)",
            width: "987px",
          }}
        >
          <ThreeColumnTableRow
            title="Feature Completion*"
            content={
              <div className="flex flex-col h-[102px] justify-between">
                <span style={contentStyle}>
                  Generate a zero-knowledge proof (ZKP) from an Ethereum transaction and submit it through the Playground.
                </span>
                <div className="relative">
                  <Image
                    src={ExclamationMark}
                    alt={"ExclamationMark"}
                    className="absolute top-0 left-0"
                  />
                  <span
                    style={{
                      ...subTextStyle,
                      display: "block",
                      paddingLeft: "30px",
                      letterSpacing: "-0.54px",
                    }}
                  >
                    TON transfer transactions are recommended for proof generation
                    during the airdrop period.
                  </span>
                </div>
              </div>
            }
            isFirstRewardRow
            reward={
              <div
                className="w-[88px] flex justify-between absolute"
                style={{
                  ...rewardStyle,
                  top: "75%",
                  transform: "translateY(0%)"
                }}
              >
                <span>125</span>
                <span
                  style={{
                    fontWeight: 400,
                  }}
                >
                  TON
                </span>
              </div>
            }
          />

          <ThreeColumnTableRow
            title="Social Media Activity*"
            content={
              <div style={{ ...contentStyle, letterSpacing: "-0.7px" }}>
                <div>Complete required social media tasks: </div>
                <ul
                  className="ml-2"
                  style={{
                    paddingLeft: "16px",
                    listStyleType: "disc",
                  }}
                >
                  <li style={{ fontWeight: "700", color: "#4fc3f7" }}>
                    <span style={{ color: "#ffffff" }}>Follow Tokamak Network on{" "}</span>
                    <span
                      style={{
                        fontWeight: "700",
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "#ffffff"
                      }}
                      onClick={() => window.open(LINKS.X)}
                    >
                      X
                    </span>{" "}
                    <span style={{ color: "#ffffff" }}>(Twitter) - </span>
                    <span style={{ color: "#4fc3f7", fontSize: "14px" }}>REQUIRED</span>
                  </li>
                  <li style={{ fontWeight: "700", color: "#4fc3f7" }}>
                    <span style={{ color: "#ffffff" }}>Repost our event announcement - </span>
                    <span style={{ color: "#4fc3f7", fontSize: "14px" }}>REQUIRED</span>
                  </li>
                </ul>
              </div>
            }
            isLastRewardRow
          />


          <ThreeColumnTableRow
            title="Experience Feedback"
            content={
              <span style={contentStyle}>
                Submitting meaningful improvement suggestions or bug reports
              </span>
            }
            isLast={true}
            reward={
              <div className="w-[84px] flex flex-col justify-between items-center">
                <span>
                  Up to
                </span>
                <div className="flex justify-between w-full">
                  <span
                    style={{
                      ...rewardStyle,
                      fontSize: "26px",
                      fontWeight: 700,
                    }}
                  >
                    25
                  </span>
                  <span
                    style={{
                      ...rewardStyle,
                      fontSize: "26px",
                      fontWeight: 400,
                    }}
                  >
                    {" "}
                    TON
                  </span>
                </div>
              </div>
            }
            isLastRewardRow
          />
        </div>
        <div
          style={{
            borderRight: "1px solid var(--line, #00477A)",
            borderBottom: "1px solid #4fc3f7",
            borderLeft: "1px solid var(--line, #00477A)",
            background: "#1D9BF0",
            display: "flex",
            width: "990px",
            height: "55px",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="12"
            viewBox="0 0 14 24"
            fill="none"
            style={{
              width: "21px",
              height: "21px",
              transform: "rotate(0deg)",
            }}
          >
            <g filter="url(#filter0_d_2014_87967)">
              <path
                d="M2.50422e-07 0.000243998L3 0.000244033L3 3.00024L6 3.00024L6 6.00024L9 6.00024L9 9.00024L12 9.00024L12 12.0002L9 12.0002L9 15.0002L6 15.0002L6 18.0002L3 18.0002L3 21.0002L0 21.0002L2.50422e-07 0.000243998Z"
                fill="#FFF716"
              />
            </g>
            <defs>
              <filter
                id="filter0_d_2014_87967"
                x="0"
                y="0.000244141"
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
                  result="effect1_dropShadow_2014_87967"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_2014_87967"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
          <span
            style={{
              color: "#FFF716",
              fontFamily: '"IBM Plex Mono"',
              fontSize: "22px",
              fontStyle: "normal",
              fontWeight: "700",
              lineHeight: "normal",
              letterSpacing: "-0.11px",
            }}
          >
            Complete 2 Tasks. Claim up to 150 TON.
          </span>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="desktop:hidden w-full flex flex-col">
        <div
          style={{
            borderRight: "1px solid var(--line, #00477A)",
            borderBottom: "1px solid #4fc3f7",
            borderLeft: "1px solid var(--line, #00477A)",
            background: "#1D9BF0",
            display: "flex",
            height: "101px",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            marginBottom: "8px",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="12"
            viewBox="0 0 14 24"
            fill="none"
            style={{
              width: "21px",
              height: "21px",
              transform: "rotate(0deg)",
            }}
          >
            <g filter="url(#filter0_d_2014_87967)">
              <path
                d="M2.50422e-07 0.000243998L3 0.000244033L3 3.00024L6 3.00024L6 6.00024L9 6.00024L9 9.00024L12 9.00024L12 12.0002L9 12.0002L9 15.0002L6 15.0002L6 18.0002L3 18.0002L3 21.0002L0 21.0002L2.50422e-07 0.000243998Z"
                fill="#FFF716"
              />
            </g>
            <defs>
              <filter
                id="filter0_d_2014_87967"
                x="0"
                y="0.000244141"
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
                  result="effect1_dropShadow_2014_87967"
                />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="effect1_dropShadow_2014_87967"
                  result="shape"
                />
              </filter>
            </defs>
          </svg>
          <div
            className="flex flex-col"
            style={{
              color: "#FFF716",
              fontFamily: '"IBM Plex Mono"',
              fontSize: "18px",
              fontStyle: "normal",
              fontWeight: "700",
              lineHeight: "normal",
              letterSpacing: "-0.11px",
            }}
          >
            <span>Complete 2 Tasks. Claim up to 150 TON.</span>
            <span className="text-white">Mandatory: 125 TON + Optional: 25 TON</span>
          </div>
        </div>
        <QuestBoardMobileCard
          title="Feature Completion*"
          content={
            <div className="flex flex-col gap-2">
              <div>
                Generate a zero-knowledge proof (ZKP) from an Ethereum transaction and submit it through the Playground.
              </div>
              <div className="flex items-start gap-2">
                <Image
                  src={ExclamationMark}
                  alt={"ExclamationMark"}
                  className="mt-0.5"
                  style={{ width: "20px", height: "auto" }}
                />
                <span
                  style={{
                    ...mobileContentStyle,
                    letterSpacing: "-0.54px",
                    fontSize: "14px",
                  }}
                >
                  TON transfer transactions are recommended for proof generation
                  during the airdrop period.
                </span>
              </div>
            </div>
          }
          reward="Mandatory"
        />

        <QuestBoardMobileCard
          title="Social Media Activity*"
          content={
            <div>
              <div>Complete required social media tasks:</div>
              <ul
                className="mt-2 ml-4"
                style={{
                  paddingLeft: "16px",
                  listStyleType: "disc",
                }}
              >
                 <li style={{ fontWeight: "700", color: "#4fc3f7" }}>
                   <span style={{ color: "#ffffff" }}>Follow Tokamak Network on{" "}</span>
                   <span
                     style={{
                       fontWeight: "700",
                       cursor: "pointer",
                       textDecoration: "underline",
                       color: "#ffffff"
                     }}
                     onClick={() => window.open(LINKS.X)}
                   >
                     X
                   </span>{" "}
                   <span style={{ color: "#ffffff" }}>(Twitter) - </span>
                   <span style={{ color: "#4fc3f7", fontSize: "12px" }}>REQUIRED</span>
                 </li>
                 <li style={{ fontWeight: "700", color: "#4fc3f7" }}>
                   <span style={{ color: "#ffffff" }}>Repost our event announcement - </span>
                   <span style={{ color: "#4fc3f7", fontSize: "12px" }}>REQUIRED</span>
                 </li>
              </ul>
            </div>
          }
          reward="Mandatory"
        />


        <QuestBoardMobileCard
          title="Experience Feedback"
          content="Submitting meaningful improvement suggestions or bug reports"
          reward={
            <>
              Up to
              <br />
              25 TON
            </>
          }
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
      className="w-full border border-[#4fc3f7] bg-[#0a1930]"
      style={{
        marginBottom: isLastRow ? "0" : "16px",
      }}
    >
      <div className="px-[20px] py-[12px] bg-[#0a1930] flex items-center gap-[16px]">
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
      className="relative w-full desktop:w-[1356px] px-[20px] desktop:px-0 py-[32px] desktop:py-[58px] bg-gradient-to-b from-[#0a1930] to-[#1a2347]"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
              <h1 className="text-hero-title-70" style={{color: '#ffffff'}}>Notes</h1>

      {/* Desktop Layout */}
      <div
        className="hidden desktop:flex w-full desktop:w-[1000px]"
        style={{
          flexDirection: "column",
          alignItems: "flex-start",
          border: "1px solid #4fc3f7",
          background: "#0a1930",
        }}
      >
        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid #4fc3f7",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            All submitted proofs will be verified on-chain to ensure fairness
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid #4fc3f7",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            To prevent duplicate participation or farming, your account may be reviewed. This includes checking that the account was created at least 1 month ago, holds at least 0.1 ETH, and that the provided social media IDs are valid and unique
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid #4fc3f7",
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
            borderBottom: "1px solid #4fc3f7",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            Submissions with plagiarized or copied content may be excluded from
            rewards.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid #4fc3f7",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            Make sure to enter accurate details, changes won't be allowed later
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid #4fc3f7",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            If there are 30 or fewer verified participants, all will receive
            rewards. If more than 30, 30 participants will be randomly selected.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid #4fc3f7",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            Beware of fake apps or files containing malware. Download only from
            the official Tokamak Network channels.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid #4fc3f7",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            Check event announcements only on the official{" "}
            <span
              style={{
                fontWeight: "700",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Tokamak Network X
            </span>{" "}
            account.
          </span>
        </div>

        <div
          style={{
            display: "flex",
            padding: "16px 24px",
            alignItems: "center",
            gap: "16px",
            alignSelf: "stretch",
            borderBottom: "1px solid #4fc3f7",
          }}
        >
          <ArrowIcon />
          <div style={notesCellStyle}>
            <div className="flex justify-between ">
              <div className="flex flex-col w-[396px]">
                <div className="font-bold">System requirements:</div>
                <ul
                  style={{
                    paddingLeft: "16px",
                    listStyleType: "disc",
                  }}
                  className="ml-2"
                >
                  <li>Minimum: 8GB RAM, 3GB disk space</li>
                  <li>
                    Recommended: NVIDIA GPU supporting CUDA (highly recommended
                    for faster processing)
                  </li>
                </ul>
              </div>
              <div className="flex flex-col w-[396px]">
                <div className="font-bold">Estimated Processing Time:</div>
                <div className="mt-2">
                  <table style={{ fontSize: "16px", width: "100%" }}>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #4fc3f7" }}>
                        <td style={{ padding: "4px 8px 4px 0", color: "#ffffff" }}>12th Gen Intel i3 CPU</td>
                        <td style={{ padding: "4px 0", color: "#ffffff" }}>3-4 minutes</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #4fc3f7" }}>
                        <td style={{ padding: "4px 8px 4px 0", color: "#ffffff" }}>Apple Silicon M4 Pro CPU</td>
                        <td style={{ padding: "4px 0", color: "#ffffff" }}>1-2 minutes</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "4px 8px 4px 0", color: "#ffffff" }}>CUDA with RTX 3070ti</td>
                        <td style={{ padding: "4px 0", color: "#ffffff" }}>&lt; 1 minute</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
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
          <span style={notesCellStyle}>
            If your computer has lower specifications than those listed in the table above, processing may take longer (typically 5-10 minutes or more). This is completely normal and the playground will still work perfectly, just be patient! For faster performance, consider installing CUDA if you have an NVIDIA GPU (see CUDA Setup Guide). Close other resource-intensive applications during processing.
          </span>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="desktop:hidden w-full flex flex-col">
        <NotesMobileCard>
          All submitted proofs will be verified on-chain to ensure fairness
        </NotesMobileCard>

        <NotesMobileCard>
          To prevent duplicate participation or farming, your account may be reviewed. This includes checking that the account was created at least 1 month ago, holds at least 0.1 ETH, and that the provided social media IDs are valid and unique
        </NotesMobileCard>

        <NotesMobileCard>
          Only one submission per wallet address is allowed
        </NotesMobileCard>

        <NotesMobileCard>
          Submissions with plagiarized or copied content may be excluded from
          rewards.
        </NotesMobileCard>

        <NotesMobileCard>
          Make sure to enter accurate details, changes won't be allowed later
        </NotesMobileCard>

        <NotesMobileCard>
          If there are 30 or fewer verified participants, all will receive
          rewards. If more than 30, 30 participants will be randomly selected.
        </NotesMobileCard>

        <NotesMobileCard>
          Beware of fake apps or files containing malware. Download only from
          the official Tokamak Network channels.
        </NotesMobileCard>

        <NotesMobileCard>
          Check event announcements only on the official{" "}
          <span
            style={{
              fontWeight: "700",
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => window.open(LINKS.X)}
          >
            Tokamak Network X
          </span>{" "}
          account.
        </NotesMobileCard>

        <NotesMobileCard>
          <div className="flex flex-col gap-4">
            <div>
              <div className="font-bold">System requirements:</div>
              <ul
                style={{
                  paddingLeft: "16px",
                  listStyleType: "disc",
                }}
                className="ml-2 mt-1"
              >
                <li>Minimum: 8GB RAM, 3GB disk space</li>
                <li>
                  Recommended: NVIDIA GPU supporting CUDA (highly recommended
                  for faster processing)
                </li>
              </ul>
            </div>
            <div>
              <div className="font-bold">Estimated Processing Time:</div>
              <div className="mt-2">
                <table style={{ fontSize: "16px", width: "100%" }}>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid #4fc3f7" }}>
                      <td style={{ padding: "4px 8px 4px 0", color: "#ffffff" }}>12th Gen Intel i3 CPU</td>
                      <td style={{ padding: "4px 0", color: "#ffffff" }}>3-4 minutes</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid #4fc3f7" }}>
                      <td style={{ padding: "4px 8px 4px 0", color: "#ffffff" }}>Apple Silicon M4 Pro CPU</td>
                      <td style={{ padding: "4px 0", color: "#ffffff" }}>1-2 minutes</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "4px 8px 4px 0", color: "#ffffff" }}>CUDA with RTX 3070ti</td>
                      <td style={{ padding: "4px 0", color: "#ffffff" }}>&lt; 1 minute</td>
                    </tr>
                  </tbody>
                  </table>
                </div>
              </div>
          </div>
        </NotesMobileCard>

        <NotesMobileCard isLastRow>
          If your computer has lower specifications than those listed in the table above, processing may take longer (typically 5-10 minutes or more). This is completely normal and the playground will still work perfectly, just be patient! For faster performance, consider installing CUDA if you have an NVIDIA GPU (see CUDA Setup Guide). Close other resource-intensive applications during processing.
        </NotesMobileCard>
      </div>
    </div>
  );
};

const QuestSection = () => {
  return (
    <div className="w-full flex flex-col items-center bg-gradient-to-b from-[#0a1930] to-[#1a2347]">
      {/* Desktop Layout - 기존 구조 유지 */}
      <div className="hidden desktop:flex w-full flex-col items-center gap-[40px] p-[40px]">
        <h1
          className="text-center"
          style={{
            color: "#ffffff",
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

        <div className="flex flex-col w-full desktop:w-[1360px] border-2 border-[#4fc3f7]">
          <Quest />
          <HeroCaoursel />
          <QuestBoard />
          <HeroCaoursel />
          <Notes />
        </div>
      </div>

      {/* Mobile Layout - 분리된 구조 */}
      <div
        id="quest-mobile"
        className="desktop:hidden w-full flex flex-col items-center"
      >
        {/* Mobile Title Section with padding */}
        <div className="w-full flex flex-col items-center gap-[20px] py-[20px] px-[20px]">
          <h1
            className="text-center"
            style={{
              color: "#ffffff",
              fontFamily: '"Jersey 10"',
              fontSize: "40px",
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
        <div className="w-full border-t-2 border-[#4fc3f7]"></div>

        {/* Mobile Content Section */}
        <div className="flex flex-col w-full">
          <Quest />
          <HeroCaoursel />
          <QuestBoard />
          <HeroCaoursel />
          <Notes />
        </div>

        {/* Mobile Bottom Border Line - 전체 너비 */}
        <div className="w-full border-b-2 border-[#4fc3f7]"></div>
      </div>
    </div>
  );
};

export default QuestSection;
