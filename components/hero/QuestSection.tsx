"use client";
import React from "react";
import Image from "next/image";
import Buttons from "./Buttons";
import { HeroCaoursel } from "./HeroCaoursel";
import QuestBGImage from "@/assets/hero/quest-bg.png";
import QuestBoardBGImage from "@/assets/hero/quest-board-bg.png";
import CTA_2 from "@/assets/hero/buttons/CTA-2.svg";
import CTA_2_MOBILE from "@/assets/hero/buttons/CTA-2-mobile.svg";
import ExclamationMark from "@/assets/hero/quest/exclamation.svg";
import { LINKS } from "@/constants";

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

const subTextStyle = {
  color: "var(--text, #002139)",
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
  // isLastRow = false, // eslint-disable-line @typescript-eslint/no-unused-vars
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
              Complete all mandatory tasks (Feature Completion, Experience
              Feedback, Social Media Activity, Quiz) from the quest board to
              qualify for rewards.
            </span>
          </TableRow>

          <TableRow title="Reward Criteria">
            <div style={contentStyle}>
              <div>
                All submitted proofs will be verified on-chain to ensure
                fairness.
              </div>
              <ul
                style={{
                  paddingLeft: "16px",
                  listStyleType: "disc",
                }}
                className="ml-2"
              >
                <li>
                  If there are 30 or fewer verified participants, all will
                  receive rewards.
                </li>
                <li>
                  If there are more than 30, 30 participants will be randomly
                  selected for rewards.
                </li>
              </ul>
              <div style={contentStyle}>
                Each selected participant can earn up to{" "}
                <span style={{ fontWeight: "700" }}>100 TON.</span>
              </div>
            </div>
          </TableRow>

          <TableRow title="Reward Options">
            <div className="flex flex-col gap-[16px] w-full">
              <div className="flex flex-col">
                <span style={boldStyle}>1.Stake (Default Option)</span>
                <div className="flex flex-col gap-[4px] letter-spacing-[-0.32px]">
                  <span style={lightStyle}>
                    - Receive the full reward amount (e.g., 100 TON → 100 TON)
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                <span style={boldStyle}>2.Claim Now</span>
                <div className="flex flex-col gap-[4px] letter-spacing-[-0.32px]">
                  <span style={lightStyle}>
                    - Receive 80% of your reward immediately (e.g., 100 TON → 80
                    TON)
                  </span>
                </div>
              </div>
            </div>
          </TableRow>

          <TableRow title="Schedule">
            <div
              style={contentStyle}
              className="h-[115px] flex flex-col justify-between"
            >
              <div>
                <div>
                  Event Period:{" "}
                  <span style={{ fontWeight: "700" }}>
                    Aug 11 (Mon) – Aug 24 (Sun)
                  </span>
                </div>
                <div>Reward Distribution: Aug 25 (Mon)</div>
              </div>
              <div>
                Verification results will be published on the event page after
                on-chain proof validation.
              </div>
            </div>
          </TableRow>

          <TableRow title="Github Repositories" isLastRow>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  window.open(
                    "https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds",
                    "_blank"
                  )
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    width: "24px",
                    height: "24px",
                    aspectRatio: "1/1",
                  }}
                >
                  <g clipPath="url(#clip0_1719_119585)">
                    <path
                      d="M24 12.0006C23.9993 9.79655 23.3916 7.63521 22.2434 5.75375C21.0953 3.87228 19.4512 2.34337 17.4914 1.33474C15.5316 0.326097 13.3319 -0.123298 11.1336 0.0358399C8.93524 0.194978 6.82318 0.9565 5.02911 2.23688C3.23504 3.51726 1.82827 5.26703 0.963108 7.29423C0.0979437 9.32143 -0.192182 11.5478 0.124558 13.729C0.441297 15.9102 1.35267 17.9621 2.75869 19.6595C4.16472 21.3569 6.01107 22.6342 8.09521 23.3514C8.26377 23.2647 8.40834 23.1377 8.51614 22.9818C8.62393 22.8259 8.6916 22.6458 8.71319 22.4574C8.71319 21.7974 8.6988 20.0994 8.6988 20.0994C8.28007 20.1611 7.85726 20.1908 7.43402 20.1882C6.83578 20.2255 6.24202 20.0639 5.7452 19.7285C5.24839 19.3932 4.87641 18.903 4.68722 18.3342C4.4255 17.668 3.95142 17.1066 3.33841 16.737C3.02761 16.5354 2.95681 16.3002 3.31561 16.2342C4.97281 15.9234 5.3976 18.1039 6.5052 18.4519C7.27064 18.6903 8.09857 18.6241 8.81639 18.267C8.91933 17.6469 9.26145 17.092 9.7692 16.7214C6.9528 16.4514 5.28241 15.4794 4.41721 13.9146L4.32361 13.7406L4.10641 13.2438L4.04161 13.065C3.763 12.1866 3.63084 11.2684 3.65042 10.3471C3.62342 9.71327 3.72661 9.08065 3.95364 8.4883C4.18067 7.89595 4.52672 7.35643 4.97041 6.90305C4.60795 5.76434 4.6824 4.53147 5.17922 3.44464C5.17922 3.44464 6.39843 3.19265 8.70243 4.83425C10.714 4.29614 12.8262 4.25495 14.8572 4.71424C15.8172 4.07824 17.5932 3.17464 18.306 3.42904C18.7825 4.42506 18.8727 5.56237 18.5592 6.62104C19.5668 7.69569 20.1082 9.12536 20.0652 10.5978C20.062 11.4305 19.9581 12.2598 19.7556 13.0675L19.6524 13.4202C19.6524 13.4202 19.5924 13.587 19.5324 13.7454L19.4556 13.9194C18.6156 15.7446 16.9068 16.4262 14.1384 16.7094C15.0348 17.2722 15.2916 17.9766 15.2916 19.8834C15.2916 21.7902 15.2664 22.0435 15.2724 22.4863C15.2987 22.6678 15.3658 22.8411 15.4687 22.993C15.5716 23.1449 15.7075 23.2716 15.8664 23.3634C18.2389 22.556 20.2991 21.026 21.7578 18.9881C23.2165 16.9502 24.0006 14.5068 24 12.0006Z"
                      fill="black"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1719_119585">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span style={{ ...contentStyle, fontWeight: "700" }}>
                  Tokamak-zk-EVM-playgrounds
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  width: "214px",
                  cursor: "pointer",
                }}
                onClick={() =>
                  window.open(
                    "https://github.com/tokamak-network/Tokamak-zk-EVM",
                    "_blank"
                  )
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{
                    width: "24px",
                    height: "24px",
                    aspectRatio: "1/1",
                  }}
                >
                  <g clipPath="url(#clip0_1719_119585)">
                    <path
                      d="M24 12.0006C23.9993 9.79655 23.3916 7.63521 22.2434 5.75375C21.0953 3.87228 19.4512 2.34337 17.4914 1.33474C15.5316 0.326097 13.3319 -0.123298 11.1336 0.0358399C8.93524 0.194978 6.82318 0.9565 5.02911 2.23688C3.23504 3.51726 1.82827 5.26703 0.963108 7.29423C0.0979437 9.32143 -0.192182 11.5478 0.124558 13.729C0.441297 15.9102 1.35267 17.9621 2.75869 19.6595C4.16472 21.3569 6.01107 22.6342 8.09521 23.3514C8.26377 23.2647 8.40834 23.1377 8.51614 22.9818C8.62393 22.8259 8.6916 22.6458 8.71319 22.4574C8.71319 21.7974 8.6988 20.0994 8.6988 20.0994C8.28007 20.1611 7.85726 20.1908 7.43402 20.1882C6.83578 20.2255 6.24202 20.0639 5.7452 19.7285C5.24839 19.3932 4.87641 18.903 4.68722 18.3342C4.4255 17.668 3.95142 17.1066 3.33841 16.737C3.02761 16.5354 2.95681 16.3002 3.31561 16.2342C4.97281 15.9234 5.3976 18.1039 6.5052 18.4519C7.27064 18.6903 8.09857 18.6241 8.81639 18.267C8.91933 17.6469 9.26145 17.092 9.7692 16.7214C6.9528 16.4514 5.28241 15.4794 4.41721 13.9146L4.32361 13.7406L4.10641 13.2438L4.04161 13.065C3.763 12.1866 3.63084 11.2684 3.65042 10.3471C3.62342 9.71327 3.72661 9.08065 3.95364 8.4883C4.18067 7.89595 4.52672 7.35643 4.97041 6.90305C4.60795 5.76434 4.6824 4.53147 5.17922 3.44464C5.17922 3.44464 6.39843 3.19265 8.70243 4.83425C10.714 4.29614 12.8262 4.25495 14.8572 4.71424C15.8172 4.07824 17.5932 3.17464 18.306 3.42904C18.7825 4.42506 18.8727 5.56237 18.5592 6.62104C19.5668 7.69569 20.1082 9.12536 20.0652 10.5978C20.062 11.4305 19.9581 12.2598 19.7556 13.0675L19.6524 13.4202C19.6524 13.4202 19.5924 13.587 19.5324 13.7454L19.4556 13.9194C18.6156 15.7446 16.9068 16.4262 14.1384 16.7094C15.0348 17.2722 15.2916 17.9766 15.2916 19.8834C15.2916 21.7902 15.2664 22.0435 15.2724 22.4863C15.2987 22.6678 15.3658 22.8411 15.4687 22.993C15.5716 23.1449 15.7075 23.2716 15.8664 23.3634C18.2389 22.556 20.2991 21.026 21.7578 18.9881C23.2165 16.9502 24.0006 14.5068 24 12.0006Z"
                      fill="black"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_1719_119585">
                      <rect width="24" height="24" fill="white" />
                    </clipPath>
                  </defs>
                </svg>
                <span style={{ ...contentStyle, fontWeight: "700" }}>
                  Tokamak-zk-EVM
                </span>
              </div>
            </div>
          </TableRow>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="desktop:hidden w-full flex flex-col">
        <MobileCard title="How to Participate">
          Complete all mandatory tasks (Feature Completion, Experience Feedback,
          Social Media Activity, Quiz) from the quest board to qualify for
          rewards.
        </MobileCard>

        <MobileCard title="Reward Criteria">
          <div style={mobileContentStyle}>
            <div>
              All submitted proofs will be verified on-chain to ensure fairness.
            </div>
            <ul
              style={{
                margin: "4px 0",
                paddingLeft: "16px",
                listStyleType: "disc",
              }}
            >
              <li>
                If there are 30 or fewer verified participants, all will receive
                rewards.
              </li>
              <li>
                If there are more than 30, 30 participants will be randomly
                selected for rewards.
              </li>
            </ul>
            <div style={mobileContentStyle}>
              Each selected participant can earn up to{" "}
              <span style={{ fontWeight: "700" }}>100 TON.</span>
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
                  - Receive the full reward amount (e.g., 100 TON → 100 TON)
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-[6px]">
              <span style={{ ...mobileContentStyle, fontWeight: "700" }}>
                2.Claim Now
              </span>
              <div className="flex flex-col gap-[2px] ml-[12px]">
                <span style={mobileContentStyle}>
                  - Receive 80% of your reward immediately (e.g., 100 TON → 80
                  TON)
                </span>
              </div>
            </div>
          </div>
        </MobileCard>

        <MobileCard title="Schedule">
          <div style={mobileContentStyle}>
            <div>
              Event Period:
              <br className="max-500:block hidden" />
              <span style={{ fontWeight: "700" }}>
                Aug 11 (Mon) – Aug 24 (Sun)
              </span>
            </div>
            <div>
              <span style={{ fontWeight: "700" }}>Reward Distribution:</span>
              <br className="max-500:block hidden" />
              Aug 25 (Mon)
            </div>
            <div>
              Verification results will be published on the event page after
              on-chain proof validation.
            </div>
          </div>
        </MobileCard>

        <MobileCard title="Github Repositories" isLastRow>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
              }}
              onClick={() =>
                window.open(
                  "https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds",
                  "_blank"
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  width: "24px",
                  height: "24px",
                  aspectRatio: "1/1",
                }}
              >
                <g clipPath="url(#clip0_1719_119585)">
                  <path
                    d="M24 12.0006C23.9993 9.79655 23.3916 7.63521 22.2434 5.75375C21.0953 3.87228 19.4512 2.34337 17.4914 1.33474C15.5316 0.326097 13.3319 -0.123298 11.1336 0.0358399C8.93524 0.194978 6.82318 0.9565 5.02911 2.23688C3.23504 3.51726 1.82827 5.26703 0.963108 7.29423C0.0979437 9.32143 -0.192182 11.5478 0.124558 13.729C0.441297 15.9102 1.35267 17.9621 2.75869 19.6595C4.16472 21.3569 6.01107 22.6342 8.09521 23.3514C8.26377 23.2647 8.40834 23.1377 8.51614 22.9818C8.62393 22.8259 8.6916 22.6458 8.71319 22.4574C8.71319 21.7974 8.6988 20.0994 8.6988 20.0994C8.28007 20.1611 7.85726 20.1908 7.43402 20.1882C6.83578 20.2255 6.24202 20.0639 5.7452 19.7285C5.24839 19.3932 4.87641 18.903 4.68722 18.3342C4.4255 17.668 3.95142 17.1066 3.33841 16.737C3.02761 16.5354 2.95681 16.3002 3.31561 16.2342C4.97281 15.9234 5.3976 18.1039 6.5052 18.4519C7.27064 18.6903 8.09857 18.6241 8.81639 18.267C8.91933 17.6469 9.26145 17.092 9.7692 16.7214C6.9528 16.4514 5.28241 15.4794 4.41721 13.9146L4.32361 13.7406L4.10641 13.2438L4.04161 13.065C3.763 12.1866 3.63084 11.2684 3.65042 10.3471C3.62342 9.71327 3.72661 9.08065 3.95364 8.4883C4.18067 7.89595 4.52672 7.35643 4.97041 6.90305C4.60795 5.76434 4.6824 4.53147 5.17922 3.44464C5.17922 3.44464 6.39843 3.19265 8.70243 4.83425C10.714 4.29614 12.8262 4.25495 14.8572 4.71424C15.8172 4.07824 17.5932 3.17464 18.306 3.42904C18.7825 4.42506 18.8727 5.56237 18.5592 6.62104C19.5668 7.69569 20.1082 9.12536 20.0652 10.5978C20.062 11.4305 19.9581 12.2598 19.7556 13.0675L19.6524 13.4202C19.6524 13.4202 19.5924 13.587 19.5324 13.7454L19.4556 13.9194C18.6156 15.7446 16.9068 16.4262 14.1384 16.7094C15.0348 17.2722 15.2916 17.9766 15.2916 19.8834C15.2916 21.7902 15.2664 22.0435 15.2724 22.4863C15.2987 22.6678 15.3658 22.8411 15.4687 22.993C15.5716 23.1449 15.7075 23.2716 15.8664 23.3634C18.2389 22.556 20.2991 21.026 21.7578 18.9881C23.2165 16.9502 24.0006 14.5068 24 12.0006Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1719_119585">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span style={{ ...mobileContentStyle, fontWeight: "700" }}>
                Tokamak-zk-EVM-playgrounds
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "214px",
                cursor: "pointer",
              }}
              onClick={() =>
                window.open(
                  "https://github.com/tokamak-network/Tokamak-zk-EVM",
                  "_blank"
                )
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{
                  width: "24px",
                  height: "24px",
                  aspectRatio: "1/1",
                }}
              >
                <g clipPath="url(#clip0_1719_119585)">
                  <path
                    d="M24 12.0006C23.9993 9.79655 23.3916 7.63521 22.2434 5.75375C21.0953 3.87228 19.4512 2.34337 17.4914 1.33474C15.5316 0.326097 13.3319 -0.123298 11.1336 0.0358399C8.93524 0.194978 6.82318 0.9565 5.02911 2.23688C3.23504 3.51726 1.82827 5.26703 0.963108 7.29423C0.0979437 9.32143 -0.192182 11.5478 0.124558 13.729C0.441297 15.9102 1.35267 17.9621 2.75869 19.6595C4.16472 21.3569 6.01107 22.6342 8.09521 23.3514C8.26377 23.2647 8.40834 23.1377 8.51614 22.9818C8.62393 22.8259 8.6916 22.6458 8.71319 22.4574C8.71319 21.7974 8.6988 20.0994 8.6988 20.0994C8.28007 20.1611 7.85726 20.1908 7.43402 20.1882C6.83578 20.2255 6.24202 20.0639 5.7452 19.7285C5.24839 19.3932 4.87641 18.903 4.68722 18.3342C4.4255 17.668 3.95142 17.1066 3.33841 16.737C3.02761 16.5354 2.95681 16.3002 3.31561 16.2342C4.97281 15.9234 5.3976 18.1039 6.5052 18.4519C7.27064 18.6903 8.09857 18.6241 8.81639 18.267C8.91933 17.6469 9.26145 17.092 9.7692 16.7214C6.9528 16.4514 5.28241 15.4794 4.41721 13.9146L4.32361 13.7406L4.10641 13.2438L4.04161 13.065C3.763 12.1866 3.63084 11.2684 3.65042 10.3471C3.62342 9.71327 3.72661 9.08065 3.95364 8.4883C4.18067 7.89595 4.52672 7.35643 4.97041 6.90305C4.60795 5.76434 4.6824 4.53147 5.17922 3.44464C5.17922 3.44464 6.39843 3.19265 8.70243 4.83425C10.714 4.29614 12.8262 4.25495 14.8572 4.71424C15.8172 4.07824 17.5932 3.17464 18.306 3.42904C18.7825 4.42506 18.8727 5.56237 18.5592 6.62104C19.5668 7.69569 20.1082 9.12536 20.0652 10.5978C20.062 11.4305 19.9581 12.2598 19.7556 13.0675L19.6524 13.4202C19.6524 13.4202 19.5924 13.587 19.5324 13.7454L19.4556 13.9194C18.6156 15.7446 16.9068 16.4262 14.1384 16.7094C15.0348 17.2722 15.2916 17.9766 15.2916 19.8834C15.2916 21.7902 15.2664 22.0435 15.2724 22.4863C15.2987 22.6678 15.3658 22.8411 15.4687 22.993C15.5716 23.1449 15.7075 23.2716 15.8664 23.3634C18.2389 22.556 20.2991 21.026 21.7578 18.9881C23.2165 16.9502 24.0006 14.5068 24 12.0006Z"
                    fill="black"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1719_119585">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              <span style={{ ...mobileContentStyle, fontWeight: "700" }}>
                Tokamak-zk-EVM
              </span>
            </div>
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
        className="hidden desktop:block"
        onClick={() =>
          alert(
            "Hold on! 🚀 TONs are still traveling from space! Please wait a little longer~ ⏰"
          )
        }
      />

      {/* 모바일용 CTA_2_MOBILE (1359px 이하에서 표시) */}
      <Image
        src={CTA_2_MOBILE}
        alt="submit proof"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="block desktop:hidden"
        onClick={() =>
          alert(
            "Hold on! 🚀 TONs are still traveling from space! Please wait a little longer~ ⏰"
          )
        }
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
            title="Feature Completion"
            content={
              <div className="flex flex-col h-[102px] justify-between">
                <span style={contentStyle}>
                  Attempting Playground setup and initial feature usage
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
                    TON transaction hashes are recommended for proof generation
                    during the airdrop period.
                  </span>
                </div>
              </div>
            }
            reward={<span style={rewardStyle}>50 TON</span>}
          />

          <ThreeColumnTableRow
            title="Experience Feedback"
            content={
              <span style={contentStyle}>
                Submitting meaningful improvement suggestions or bug reports
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
            title="Social Media Activity"
            content={
              <div style={{ ...contentStyle, letterSpacing: "-0.7px" }}>
                <div>Complete all social media tasks:</div>
                <ul
                  className="ml-2"
                  style={{
                    paddingLeft: "16px",
                    listStyleType: "disc",
                  }}
                >
                  <li>
                    Follow Tokamak Network on{" "}
                    <span
                      style={{ fontWeight: "700" }}
                      onClick={() => window.open(LINKS.X)}
                    >
                      X
                    </span>{" "}
                    (Twitter)
                  </li>
                  <li>
                    Share and comment on Tokamak Network{" "}
                    <span style={{ fontWeight: "700" }}>posts</span> on X
                  </li>
                  <li>
                    Subscribe to the Tokamak Network{" "}
                    <span style={{ fontWeight: "700" }}>YouTube</span> channel
                  </li>
                </ul>
              </div>
            }
            reward={<span style={rewardStyle}>20 TON</span>}
          />

          <ThreeColumnTableRow
            title="Quiz"
            content={
              <span style={contentStyle}>
                Answer a simple quiz about Tokamak-zk-EVM.
              </span>
            }
            reward={<span style={rewardStyle}>5 TON</span>}
            isLastRow
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="desktop:hidden w-full flex flex-col">
        <QuestBoardMobileCard
          title="Feature Completion"
          content={
            <div className="flex flex-col gap-2">
              <div>Attempting Playground setup and initial feature usage</div>
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
                  TON transaction hashes are recommended for proof generation
                  during the airdrop period.
                </span>
              </div>
            </div>
          }
          reward="50 TON"
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
        />

        <QuestBoardMobileCard
          title="Social Media Activity"
          content={
            <div>
              <div>Complete all social media tasks:</div>
              <ul
                className="mt-2 ml-4"
                style={{
                  paddingLeft: "16px",
                  listStyleType: "disc",
                }}
              >
                <li>
                  Follow Tokamak Network on{" "}
                  <span
                    style={{ fontWeight: "700", cursor: "pointer" }}
                    onClick={() => window.open(LINKS.X)}
                  >
                    X
                  </span>{" "}
                  (Twitter)
                </li>
                <li>
                  Share and comment on Tokamak Network{" "}
                  <span style={{ fontWeight: "700" }}>posts</span> on{" "}
                  <span style={{ fontWeight: "700" }}>X</span>
                </li>
                <li>
                  Subscribe to the Tokamak Network{" "}
                  <span style={{ fontWeight: "700" }}>YouTube</span> channel
                </li>
              </ul>
            </div>
          }
          reward="20 TON"
        />

        <QuestBoardMobileCard
          title="Quiz"
          content="Answer a simple quiz about Tokamak-zk-EVM."
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
            borderBottom: "1px solid var(--line, #00477A)",
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
            borderBottom: "1px solid var(--line, #00477A)",
          }}
        >
          <ArrowIcon />
          <span style={notesCellStyle}>
            Check event announcements only on the official{" "}
            <span style={{ fontWeight: "700" }}>Tokamak Network X</span>{" "}
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
                  <li>Minimum: 16GB RAM, 10GB disk space</li>
                  <li>
                    Recommended: NVIDIA GPU supporting CUDA (highly recommended
                    for faster processing)
                  </li>
                </ul>
              </div>
              <div className="flex flex-col w-[396px]">
                <div className="font-bold">Estimated Processing Time:</div>
                <ul
                  style={{
                    paddingLeft: "16px",
                    listStyleType: "disc",
                  }}
                  className="ml-2"
                >
                  <li>With GPU: ~10 minutes</li>
                  <li>Without GPU: Up to 1 hour</li>
                </ul>
              </div>
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
          Submissions with plagiarized or copied content may be excluded from
          rewards.
        </NotesMobileCard>

        <NotesMobileCard>
          Make sure to enter accurate details — changes won't be allowed later
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
          <span style={{ fontWeight: "700" }}>Tokamak Network X</span> account.
        </NotesMobileCard>

        <NotesMobileCard isLastRow>
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
                <li>Minimum: 16GB RAM, 10GB disk space</li>
                <li>
                  Recommended: NVIDIA GPU supporting CUDA (highly recommended
                  for faster processing)
                </li>
              </ul>
            </div>
            <div>
              <div className="font-bold">Estimated Processing Time:</div>
              <ul
                style={{
                  paddingLeft: "16px",
                  listStyleType: "disc",
                }}
                className="ml-2 mt-1"
              >
                <li>With GPU: ~10 minutes</li>
                <li>Without GPU: Up to 1 hour</li>
              </ul>
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
      <div
        id="quest-mobile"
        className="desktop:hidden w-full flex flex-col items-center"
      >
        {/* Mobile Title Section with padding */}
        <div className="w-full flex flex-col items-center gap-[20px] py-[20px] px-[20px]">
          <h1
            className="text-center"
            style={{
              color: "var(--text, #002139)",
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
