"use client";

import React from "react";
import ProofDesktop from "./ProofDesktop";
import ProofMobile from "./ProofMobile";
import FAQMobile from "./FAQMobile";

const FAQ = () => {
  const scrollToProof = () => {
    // Check if mobile screen (1359px and below)
    const isMobile = window.innerWidth <= 1359;

    let targetId = "proof-dashboard";

    if (isMobile) {
      targetId = "proof-mobile";
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#0a1930] to-[#1a2347]">
      {/* Mobile Layout - Proof 먼저 */}
      <div className="desktop:hidden w-full">
        <ProofMobile />
      </div>

      {/* Desktop Layout */}
      <div className="hidden desktop:flex w-full items-center justify-center">
        <div
          id="proof-dashboard"
          className="flex justify-between relative h-[924px]"
          style={{
            width: "1360px",
          }}
        >
          <ProofDesktop />

          {/* FAQ 섹션 - 오른쪽 */}
          <div
            id="faq"
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
            <h1 className="text-hero-title-70" style={{color: '#ffffff'}}>FAQ</h1>

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
                  border: "1px solid #4fc3f7",
                  background: "#0a1930",
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
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "20px",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "normal",
                  }}
                >
                  Q1. What types of transactions can be converted to ZKP
                </div>

                {/* 답변 영역 */}
                <div
                  style={{
                    display: "flex",
                    padding: "16px 24px",
                    alignItems: "center",
                    gap: "16px",
                    alignSelf: "stretch",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                  }}
                >
                  While Tokamak zk-EVM is theoretically compatible with any transaction that calls a smart contract, the airdrop limited the transaction types. This is due to a trade-off between compatibility and proof generation speed. Under the event configuration, we confirmed that the Playground is compatible with frequently used and simple transactions, such as USDC, USDT, and TON transfers. Transactions requiring high fees, such as TON's approve-and-call transactions or rollup transactions, may not be able to be converted to ZKP under the current configuration.
                </div>
              </div>

              {/* Q2 박스 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "640px",
                  border: "1px solid #4fc3f7",
                  background: "#0a1930",
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
                    color: "#ffffff",
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
                    background: "#1e3a8a",
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                  }}
                >
                  Yes. To qualify for rewards, you must complete all mandatory tasks: ZKP submission and Social Media Activity. Experience Feedback is optional but encouraged.
                </div>
              </div>

              {/* Q3 박스 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "640px",
                  border: "1px solid #4fc3f7",
                  background: "#0a1930",
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
                    color: "#ffffff",
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
                    display: "block",
                    padding: "16px 24px",
                    alignSelf: "stretch",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                  }}
                >
                  Playground has initially verified the ZKP you generate. If you want more, you can verify your ZKP at the following link. In addition, you can check the status of your proof in the{" "}
                  <a
                    href="https://github.com/tokamak-network/create-tokamak-zk-evm/blob/main/README.md#verify-a-proof"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontWeight: "700",
                      color: "#4fc3f7",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Proof section
                  </a>
                  .
                  <br />
                  <br />
                  You can check the status of your proof [
                  <span
                    style={{ fontWeight: "bold", cursor: "pointer" }}
                    onClick={() => scrollToProof()}
                  >
                    here
                  </span>
                  ].
                </div>
              </div>

              {/* Q4 박스 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "640px",
                  border: "1px solid #4fc3f7",
                  background: "#0a1930",
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
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "20px",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "normal",
                  }}
                >
                  Q4. What is the difference between the two reward options?
                </div>

                {/* 답변 영역 */}
                <div
                  style={{
                    display: "block",
                    padding: "16px 24px",
                    alignSelf: "stretch",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                  }}
                >
                  <strong>1. Stake (Default Option):</strong> Your reward will lock it into{" "}
                  <a
                    href="https://etherscan.io/address/0x0b58ca72b12f01fc05f8f252e226f3e2089bd00e#writeProxyContract"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontWeight: "700",
                      color: "#4fc3f7",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Tokamak Staking (TON/WTON) Contract
                  </a>
                  . Rewards keep accruing while staked. When you want funds back, You can withdraw your rewards with {">"}25% APY after at least two weeks. You can either interact directly with the smart contract or use community-hosted sites. For a step-by-step tutorial,{" "}
                  <a
                    href="https://github.com/tokamak-network/TokamakStaking/blob/main/docs/EN/unstake%2C%20restake%20and%20withdraw.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontWeight: "700",
                      color: "#4fc3f7",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Visit
                  </a>
                  {" "}or check the{" "}
                  <a
                    href="https://github.com/tokamak-network/TokamakStaking?tab=readme-ov-file#community-hosted-links"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontWeight: "700",
                      color: "#4fc3f7",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    community sites
                  </a>
                  .
                  <br />
                  <br />
                  <strong>2. Claim Now:</strong> You take 50% immediately, with no waiting period. The trade-off is that you give up the other half and miss out on any extra yield from staking.
                </div>
              </div>

              {/* Q5 박스 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "640px",
                  border: "1px solid #4fc3f7",
                  background: "#0a1930",
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
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "20px",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "normal",
                  }}
                >
                  Q5. What can I do in Playground?
                </div>

                {/* 답변 영역 */}
                <div
                  style={{
                    display: "flex",
                    padding: "16px 24px",
                    alignItems: "center",
                    gap: "16px",
                    alignSelf: "stretch",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                  }}
                >
                  Playground is a tool that lets you experience converting
                  Ethereum transactions into ZKPs (Zero-Knowledge Proofs). All
                  you need to do is select a transaction you want to apply ZKP
                  to and click a button. Once you send us the ZKP, we'll verify
                  it on-chain for you.
                </div>
              </div>

              {/* Q6 박스 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "640px",
                  border: "1px solid #4fc3f7",
                  background: "#0a1930",
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
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "20px",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "normal",
                  }}
                >
                  Q6. Why is Windows showing a security warning?
                </div>

                {/* 답변 영역 */}
                <div
                  style={{
                    display: "block",
                    padding: "16px 24px",
                    alignSelf: "stretch",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                  }}
                >
                  Windows may show a security warning because the app is new and hasn't been widely downloaded yet. This is normal for newly released applications.
                  <br />
                  <br />
                  <strong>To run the app safely:</strong>
                  <br />
                  1. Click on <strong>"More info"</strong> when you see the warning
                  <br />
                  2. Then click <strong>"Run anyway"</strong>
                  <br />
                  <br />
                  The app is safe to use and comes directly from the official Tokamak Network team.
                </div>
              </div>

              {/* Q7 박스 */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "640px",
                  border: "1px solid #4fc3f7",
                  background: "#0a1930",
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
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "20px",
                    fontStyle: "normal",
                    fontWeight: 700,
                    lineHeight: "normal",
                  }}
                >
                  Q7. What is Tokamak zkEVM and what is it for?
                </div>

                {/* 답변 영역 */}
                <div
                  style={{
                    display: "flex",
                    padding: "16px 24px",
                    alignItems: "center",
                    gap: "16px",
                    alignSelf: "stretch",
                    background: "#1e3a8a",
                    color: "#ffffff",
                    fontFamily: "IBM Plex Mono",
                    fontSize: "16px",
                    fontStyle: "normal",
                    fontWeight: 400,
                    lineHeight: "normal",
                  }}
                >
                  Tokamak zkEVM allows Ethereum transactions to be fully
                  replaced with ZKPs, making it easy for anyone to use without
                  requiring special hardware to generate proofs.
                  <br />
                  <br />
                  It's also one of the core technologies for Tokamak Network's
                  upcoming On-demand Rollup Hub. In the near future, you'll be
                  able to easily launch, operate, and close your own
                  app-specific Layer 2 at a low cost.
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - FAQ 질문들 */}
      <div className="desktop:hidden w-full bg-gradient-to-b from-[#0a1930] to-[#1a2347]">
        <FAQMobile />
      </div>
    </div>
  );
};

export default FAQ;
