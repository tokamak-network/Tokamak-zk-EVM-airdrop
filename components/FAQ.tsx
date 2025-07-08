import React from "react";
import Image from "next/image";
import PipeTopImage from "@/assets/FAQ/pipe-top.png";
import ProofDashboardImage from "@/assets/FAQ/proof-dashboard.png";

const FAQ = () => {
  return (
    <div className="flex w-full items-center justify-center bg-[#CCEFFF]">
      <div
        className="flex justify-between relative h-[947px]"
        style={{
          display: "flex",
          width: "1360px",
        }}
      >
        <div className="">
          <div className="absolute top-[-154px] left-[146px]">
            <Image className="" src={PipeTopImage} alt="piep_top" />
          </div>
          <div className="absolute top-[37px] left-[-30px]">
            <Image src={ProofDashboardImage} alt="ProofDashboardImage" />
          </div>
        </div>

        {/* FAQ 섹션 - 오른쪽 */}
        <div
          className="gap-y-[32px] pt-[18px]"
          style={{
            display: "flex",
            width: "640px",
            height: "827px",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {/* FAQ 제목 */}
          <h1 className="text-hero-title-70">FAQ</h1>

          {/* FAQ 박스들 전체 컨테이너 */}
          <div
            style={{
              display: "flex",
              height: "798px",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "16px",
              flexShrink: 0,
              alignSelf: "stretch",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {/* Q1 박스 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "640px",
                border: "1px solid var(--line, #00477A)",
                background: "#FFF",
              }}
            >
              {/* 질문 영역 */}
              <div
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  alignItems: "center",
                  gap: "16px",
                  alignSelf: "stretch",
                  borderBottom: "1px solid var(--line, #00477A)",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "20px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "normal",
                }}
              >
                Q1. Who can participate?
              </div>

              {/* 답변 영역 */}
              <div
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  alignItems: "center",
                  gap: "16px",
                  alignSelf: "stretch",
                  background: "#ECF9FF",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                Anyone with access to Playground Airdrop can participate freely.
                However, each wallet address can only submit once, so
                double-check before submitting!
              </div>
            </div>

            {/* Q2 박스 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "640px",
                border: "1px solid var(--line, #00477A)",
                background: "#FFF",
              }}
            >
              {/* 질문 영역 */}
              <div
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  alignItems: "center",
                  gap: "16px",
                  alignSelf: "stretch",
                  borderBottom: "1px solid var(--line, #00477A)",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "20px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "normal",
                }}
              >
                Q2. Do I have to complete all missions?
              </div>

              {/* 답변 영역 */}
              <div
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  alignItems: "center",
                  gap: "16px",
                  alignSelf: "stretch",
                  background: "#ECF9FF",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                Nope! You can earn TON rewards even by completing a single task.
                But we highly recommend completing all missions to maximize your
                rewards.
              </div>
            </div>

            {/* Q3 박스 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "640px",
                border: "1px solid var(--line, #00477A)",
                background: "#FFF",
              }}
            >
              {/* 질문 영역 */}
              <div
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  alignItems: "center",
                  gap: "16px",
                  alignSelf: "stretch",
                  borderBottom: "1px solid var(--line, #00477A)",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "20px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "normal",
                }}
              >
                Q3. How do I know if my proof is valid?
              </div>

              {/* 답변 영역 */}
              <div
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  alignItems: "center",
                  gap: "16px",
                  alignSelf: "stretch",
                  background: "#ECF9FF",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                If the water tank shows 1 (True), it means your proof is valid.
                <br />
                <br />
                Once you send us the ZKP, we'll verify it on-chain for you. You
                can check the status of your proof [here].
              </div>
            </div>

            {/* Q4 박스 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "640px",
                border: "1px solid var(--line, #00477A)",
                background: "#FFF",
              }}
            >
              {/* 질문 영역 */}
              <div
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  alignItems: "center",
                  gap: "16px",
                  alignSelf: "stretch",
                  borderBottom: "1px solid var(--line, #00477A)",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "20px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "normal",
                }}
              >
                Q4. What can I do in Playground?
              </div>

              {/* 답변 영역 */}
              <div
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  alignItems: "center",
                  gap: "16px",
                  alignSelf: "stretch",
                  background: "#ECF9FF",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                Playground is a tool that lets you experience converting
                Ethereum transactions into ZKPs (Zero-Knowledge Proofs). All you
                need to do is select a transaction you want to apply ZKP to and
                click a button. Once you send us the ZKP, we'll verify it
                on-chain for you.
              </div>
            </div>

            {/* Q5 박스 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                width: "640px",
                border: "1px solid var(--line, #00477A)",
                background: "#FFF",
              }}
            >
              {/* 질문 영역 */}
              <div
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  alignItems: "center",
                  gap: "16px",
                  alignSelf: "stretch",
                  borderBottom: "1px solid var(--line, #00477A)",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "20px",
                  fontStyle: "normal",
                  fontWeight: 700,
                  lineHeight: "normal",
                }}
              >
                Q5. What is Tokamak zkEVM and what is it for?
              </div>

              {/* 답변 영역 */}
              <div
                style={{
                  display: "flex",
                  padding: "16px 24px",
                  alignItems: "center",
                  gap: "16px",
                  alignSelf: "stretch",
                  background: "#ECF9FF",
                  color: "var(--text, #002139)",
                  fontFamily: "IBM Plex Mono",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "normal",
                }}
              >
                Tokamak zkEVM allows Ethereum transactions to be fully replaced
                with ZKPs, making it easy for anyone to use without requiring
                special hardware to generate proofs.
                <br />
                <br />
                It's also one of the core technologies for Tokamak Network's
                upcoming On-demand Rollup Hub. In the near future, you'll be
                able to easily launch, operate, and close your own app-specific
                Layer 2 at a low cost.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
