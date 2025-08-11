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
        background: "#ECF9FF",
      }}
    >
      <div
        style={{
          color: "var(--text, #002139)",
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
          border: "1px solid var(--line, #00477A)",
          background: "#FFF",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            flex: 1,
            color: "var(--text, #002139)",
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
      question: "Q1. Who can participate?",
      answer:
        "Anyone with access to Playground Airdrop can participate freely. However, each wallet address can only submit once, so double-check before submitting!",
    },
    {
      question: "Q2. Do I have to complete all missions?",
      answer:
        "Yes. To qualify for rewards, you must complete all mandatory tasks:Feature Completion, Experience Feedback, Social Media Activity, and Quiz. Experience Feedback is optional but encouraged.",
    },
    {
      question: "Q3. How do I know if my proof is valid?",
      answer: (
        <>
          If the water tank shows 1 (True), it means your proof is valid.
          <br />
          <br />
          Once you send us the ZKP, we'll verify it on-chain for you.
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
      question: "Q4. What can I do in Playground?",
      answer:
        "Playground is a tool that lets you experience converting Ethereum transactions into ZKPs (Zero-Knowledge Proofs). All you need to do is select a transaction you want to apply ZKP to and click a button. Once you send us the ZKP, we'll verify it on-chain for you.",
    },
    {
      question: "Q5. What is Tokamak zk-EVM and what is it for?",
      answer:
        "Tokamak zk-EVM allows Ethereum transactions to be fully replaced with ZKPs, making it easy for anyone to use without requiring special hardware to generate proofs.",
    },
    {
      question: "Q6. Can I trust this app?",
      answer:
        "You don't need to trust the app. If you're unsure, try participating in the event offline.",
    },
    {
      question: "Q7. Why the proof generation is too slow on my computer?",
      answer: (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>
            Proof generation speed depends on your system’s hardware. Devices
            without a GPU may experience significantly slower performance.
          </span>
          <ul
            className="my-2"
            style={{
              paddingLeft: "16px",
              listStyleType: "disc",
            }}
          >
            <li>With GPU (7800X3D + RTX 4070Ti): about 10 minutes</li>
            <li>
              Without GPU: about 1 hour, including Docker image download and
              verification
            </li>
          </ul>
          <span>
            For faster processing, using an NVIDIA GPU supporting CUDA is highly
            recommended, along with a multicore CPU.
          </span>
        </div>
      ),
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
