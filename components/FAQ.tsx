"use client";

import React, { useState } from "react";

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <span className="font-semibold text-gray-900">{question}</span>
        <span className="text-2xl transform transition-transform duration-300 ease-in-out">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-700 leading-relaxed">
          <div className="border-t border-gray-200 pt-4">
            <p>{answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "에어드랍 참여 자격은 무엇인가요?",
      answer:
        "유효한 지갑 주소를 보유하고 KYC 인증을 완료한 사용자라면 누구나 참여할 수 있습니다. 추가로 커뮤니티 활동에 참여하면 더 많은 혜택을 받을 수 있습니다.",
    },
    {
      question: "언제 토큰을 받을 수 있나요?",
      answer:
        "에어드랍 신청 승인 후 7일 이내에 토큰이 지갑으로 전송됩니다. 네트워크 상황에 따라 다소 지연될 수 있습니다.",
    },
    {
      question: "지원하는 지갑은 무엇인가요?",
      answer:
        "MetaMask, WalletConnect, Coinbase Wallet 등 주요 이더리움 지갑들을 지원합니다. 모바일과 데스크톱 모두 사용 가능합니다.",
    },
    {
      question: "에어드랍 토큰의 사용 용도는 무엇인가요?",
      answer:
        "토큰은 Tokamak 네트워크의 거버넌스 참여, 스테이킹, 트랜잭션 수수료 지불 등에 사용할 수 있습니다.",
    },
    {
      question: "KYC 인증이 필요한 이유는 무엇인가요?",
      answer:
        "규제 준수와 보안을 위해 KYC 인증이 필요합니다. 개인정보는 안전하게 보호되며, 에어드랍 외 다른 용도로 사용되지 않습니다.",
    },
    {
      question: "에어드랍 토큰에 제한이 있나요?",
      answer:
        "초기 6개월간 점진적으로 락업 해제되며, 네트워크 활동에 따라 추가 보상을 받을 수 있습니다.",
    },
  ];

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            자주 묻는 질문
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            에어드랍에 대한 궁금증을 해결해보세요
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-tokamak-50 to-airdrop-primary/10 rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🤝 추가 지원이 필요하신가요?
            </h3>
            <p className="text-gray-700 mb-4">
              더 자세한 정보나 기술적 지원이 필요하시면 언제든지 문의해주세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="px-6 py-3 bg-tokamak-600 text-white rounded-lg font-semibold hover:bg-tokamak-700 transition-colors">
                고객 지원 센터
              </button>
              <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                커뮤니티 참여
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
