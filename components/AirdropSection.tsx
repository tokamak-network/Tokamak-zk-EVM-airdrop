"use client";
import React, { useState } from "react";

interface AirdropCardProps {
  title: string;
  description: string;
  amount: number;
  isEligible: boolean;
  onClaim: () => void;
  isLoading?: boolean;
}

const AirdropCard: React.FC<AirdropCardProps> = ({
  title,
  description,
  amount,
  isEligible,
  onClaim,
  isLoading = false,
}) => {
  return (
    <div className="card">
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-700 mb-6 leading-relaxed">{description}</p>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl font-bold gradient-text">
            {amount.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wide">
            TON
          </span>
        </div>
        <button
          onClick={onClaim}
          disabled={!isEligible || isLoading}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-125 ${
            isEligible && !isLoading
              ? "bg-gradient-to-r from-tokamak-600 to-primary text-white hover:shadow-lg"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              처리 중...
            </div>
          ) : isEligible ? (
            "에어드랍 받기"
          ) : (
            "자격 없음"
          )}
        </button>
      </div>
    </div>
  );
};

const AirdropSection: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleClaim = async (cardId: string) => {
    setLoading(cardId);
    // Simulate claim process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(null);
    alert("에어드랍 신청이 완료되었습니다!");
  };

  return (
    <section id="airdrop" className="py-20 bg-gradient-to-b from-[#0a1930] to-[#1a2347]">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            에어드랍 참여하기
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            간단한 참여로 토큰을 받아보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <AirdropCard
            title="얼리 참여자 보상"
            description="테스트넷 사용하고 토큰 받기"
            amount={2000}
            isEligible={true}
            onClaim={() => handleClaim("early-participation")}
            isLoading={loading === "early-participation"}
          />

          <AirdropCard
            title="커뮤니티 보상"
            description="공식 채널 팔로우 (X, Medium, YouTube) 및 이벤트 공지 좋아요 누르기"
            amount={2000}
            isEligible={true}
            onClaim={() => handleClaim("community-rewards")}
            isLoading={loading === "community-rewards"}
          />
        </div>

        <div className="text-center mt-12">
          <div className="bg-tokamak-50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-tokamak-700 mb-2">
              📢 안내
            </h3>
            <p className="text-tokamak-600 text-sm">
              지갑 연결 후 참여 가능합니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AirdropSection;
