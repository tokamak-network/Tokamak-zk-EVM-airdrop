import React from "react";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: string;
}

const Step: React.FC<StepProps> = ({ number, title, description, icon }) => {
  return (
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-tokamak-600 to-airdrop-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-airdrop-accent rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-white">{number}</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{description}</p>
    </div>
  );
};

const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container-max section-padding">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            참여 방법
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            간단한 4단계로 에어드랍에 참여해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Step
            number={1}
            title="지갑 연결"
            description="MetaMask 또는 지원하는 지갑을 연결하세요"
            icon="🔗"
          />
          <Step
            number={2}
            title="자격 확인"
            description="에어드랍 참여 자격 조건을 확인하세요"
            icon="✅"
          />
          <Step
            number={3}
            title="신청하기"
            description="원하는 에어드랍을 선택하고 신청하세요"
            icon="📝"
          />
          <Step
            number={4}
            title="토큰 받기"
            description="승인 후 토큰을 지갑으로 받으세요"
            icon="🎁"
          />
        </div>

        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-tokamak-50 to-airdrop-primary/10 rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              📋 자격 조건
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  ✓ 기본 조건
                </h4>
                <ul className="text-gray-700 space-y-1">
                  <li>• 유효한 지갑 주소 보유</li>
                  <li>• KYC 인증 완료</li>
                  <li>• 커뮤니티 활동 참여</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  ✓ 추가 혜택
                </h4>
                <ul className="text-gray-700 space-y-1">
                  <li>• 얼리 어답터 (2x 보너스)</li>
                  <li>• 개발자 활동 (3x 보너스)</li>
                  <li>• 추천 프로그램 참여</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
