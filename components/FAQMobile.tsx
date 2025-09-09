"use client";
import React, { useState } from "react";
import { FAQMobileButtons } from "./hero/Buttons";
import UnfoldedIcon from "../assets/FAQ/unfolded-icon.svg";
import Image from "next/image";

// FAQ Button Icon Component
interface FAQButtonIconProps {
  isOpen: boolean;
}

const FAQButtonIcon: React.FC<FAQButtonIconProps> = ({ isOpen }) => {
  if (isOpen) {
    return <Image src={UnfoldedIcon} alt="unfolded" width={32} height={32} />;
  }

  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 4V5.95H3V7.9H0V26.1H3V28.05H6V30H9V4H6Z" fill="#1D9BF0" />
      <path
        d="M6 3V0H9V2.4V4.8H6V7.2H3V24.8H6V27.2H9V29.6V32H6V29H3V26H0V6H3V3H6Z"
        fill="#1D9BF0"
      />
      <rect
        width="14"
        height="32"
        transform="translate(9 0.000488281)"
        fill="#1D9BF0"
      />
      <rect x="9" y="0.000488281" width="14" height="3" fill="#1D9BF0" />
      <rect x="9" y="29.0005" width="14" height="3" fill="#1D9BF0" />
      <path
        d="M26 2V4.1H29V6.2H32V25.8H29V27.9H26V30H23V2H26Z"
        fill="#1D9BF0"
      />
      <path
        d="M26 3V0H23V2.4V4.8H26V7.2H29V24.8H26V27.2H23V29.6V32H26V29H29V26H32V6H29V3H26Z"
        fill="#1D9BF0"
      />
      <path
        d="M23.5 13V15.25H21.3574V17.5H19.2139V19.75H17.0713V22H14.9287V19.75H12.7861V17.5H10.6426V15.25H8.5V13H23.5Z"
        fill="white"
      />
    </svg>
  );
};

// FAQ Answer Component
interface FAQAnswerProps {
  answer: string | React.ReactNode;
}

const FAQAnswer: React.FC<FAQAnswerProps> = ({ answer }) => {
  return (
    <div
      style={{
        display: "block",
        padding: "12px 20px",
        alignSelf: "stretch",
        borderRight: "1px solid var(--line, #00477A)",
        borderBottom: "1px solid var(--line, #00477A)",
        borderLeft: "1px solid var(--line, #00477A)",
        background: "#1e3a8a",
      }}
    >
      <div
        style={{
          color: "#ffffff",
          fontFamily: "IBM Plex Mono",
          fontSize: "16px",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "normal",
          letterSpacing: "-0.08px",
          whiteSpace: "pre-line",
        }}
      >
        {answer}
      </div>
    </div>
  );
};

// FAQ Card Component
interface FAQCardProps {
  question: string;
  answer: string | React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQCard: React.FC<FAQCardProps> = ({
  question,
  answer,
  isOpen,
  onToggle,
}) => {
  return (
    <div style={{ width: "100%" }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          padding: "10px 20px",
          alignItems: "center",
          gap: "12px",
          alignSelf: "stretch",
          border: "1px solid #4fc3f7",
          background: "#0a1930",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            flex: 1,
            color: "#ffffff",
            fontFamily: "IBM Plex Mono",
            fontSize: "16px",
            fontStyle: "normal",
            fontWeight: 500,
            lineHeight: "normal",
            letterSpacing: "-0.08px",
          }}
        >
          {question}
        </div>
        <div
          style={{
            display: "flex",
            width: "32px",
            height: "32px",
            alignItems: "flex-start",
            aspectRatio: "1/1",
          }}
        >
          <FAQButtonIcon isOpen={isOpen} />
        </div>
      </div>
      {isOpen && <FAQAnswer answer={answer} />}
    </div>
  );
};

const FAQMobile = () => {
  const [openItems, setOpenItems] = useState<{ [key: number]: boolean }>({});

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

  const faqData = [
    {
      question: "Q1. What types of transactions can be converted to ZKP",
      answer:
        "While Tokamak zk-EVM is theoretically compatible with any transaction that calls a smart contract, the airdrop limited the transaction types. This is due to a trade-off between compatibility and proof generation speed. Under the event configuration, we confirmed that the Playground is compatible with frequently used and simple transactions, such as USDC, USDT, and TON transfers. Transactions requiring high fees, such as TON's approve-and-call transactions or rollup transactions, may not be able to be converted to ZKP under the current configuration.",
    },
    {
      question: "Q2. Do I have to complete all missions?",
      answer:
        "Yes. To qualify for rewards, you must complete all mandatory tasks: ZKP submission and Social Media Activity. Experience Feedback is optional but encouraged.",
    },
    {
      question: "Q3. How do I know if my proof is valid?",
      answer: (
        <>
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
        </>
      ),
    },
    {
      question: "Q4. What is the difference between the two reward options?",
      answer: (
        <>
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
        </>
      ),
    },
    {
      question: "Q5. What can I do in Playground?",
      answer:
        "Playground is a tool that lets you experience converting Ethereum transactions into ZKPs (Zero-Knowledge Proofs). All you need to do is select a transaction you want to apply ZKP to and click a button. Once you send us the ZKP, we'll verify it on-chain for you.",
    },
    {
      question: "Q6. Why is Windows showing a security warning?",
      answer:
        "Windows may show a security warning because the app is new and hasn't been widely downloaded yet. This is normal for newly released applications.\n\nTo run the app safely:\n1. Click on \"More info\" when you see the warning\n2. Then click \"Run anyway\"\n\nThe app is safe to use and comes directly from the official Tokamak Network team.",
    },
    {
      question: "Q7. What is Tokamak zk-EVM and what is it for?",
      answer:
        "Tokamak zk-EVM allows Ethereum transactions to be fully replaced with ZKPs, making it easy for anyone to use without requiring special hardware to generate proofs.\n\nIt's also one of the core technologies for Tokamak Network's upcoming On-demand Rollup Hub. In the near future, you'll be able to easily launch, operate, and close your own app-specific Layer 2 at a low cost.",
    },
  ];

  const toggleItem = (index: number) => {
    setOpenItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div
      id="faq-mobile"
      className="w-full"
      style={{
        display: "flex",
        width: "100%",
        padding: "32px 20px",
        flexDirection: "column",
        alignItems: "center",
        gap: "32px",
      }}
    >
      <h1 className="text-hero-title-70">FAQ</h1>

      {/* FAQ Cards Frame */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "8px",
          alignSelf: "stretch",
        }}
      >
        {faqData.map((item, index) => (
          <FAQCard
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={!!openItems[index]}
            onToggle={() => toggleItem(index)}
          />
        ))}
      </div>

      {/* Buttons Section */}
      <FAQMobileButtons />
    </div>
  );
};

export default FAQMobile;
