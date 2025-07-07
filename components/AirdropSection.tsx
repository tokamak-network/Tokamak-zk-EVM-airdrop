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
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
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
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
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
    <section id="airdrop" className="py-20 bg-white">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            에어드랍 참여하기
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            다양한 에어드랍 기회를 통해 토큰을 받아보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AirdropCard
            title="얼리 어답터 보너스"
            description="Tokamak ZK-EVM 네트워크의 초기 사용자들을 위한 특별 보너스"
            amount={1000}
            isEligible={true}
            onClaim={() => handleClaim("early-adopter")}
            isLoading={loading === "early-adopter"}
          />

          <AirdropCard
            title="개발자 인센티브"
            description="DApp 개발자들을 위한 추가 토큰 지원"
            amount={2500}
            isEligible={false}
            onClaim={() => handleClaim("developer")}
            isLoading={loading === "developer"}
          />

          <AirdropCard
            title="커뮤니티 참여"
            description="활발한 커뮤니티 활동을 통한 토큰 획득"
            amount={500}
            isEligible={true}
            onClaim={() => handleClaim("community")}
            isLoading={loading === "community"}
          />
        </div>

        <div className="text-center mt-12">
          <div className="bg-tokamak-50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-tokamak-700 mb-2">
              📢 중요 안내사항
            </h3>
            <p className="text-tokamak-600 text-sm">
              에어드랍 참여는 지갑 연결 후 가능합니다. 자격 조건을 만족하는
              사용자만 토큰을 받을 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AirdropSection;
