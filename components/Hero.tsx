import React from "react";

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-gray-50 to-white py-20 lg:py-32">
      <div className="container-max section-padding">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-tokamak-50 text-tokamak-700 text-sm font-medium mb-8">
            <span className="animate-pulse mr-2">🎉</span>
            Tokamak ZK-EVM 에어드랍 이벤트
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            차세대 ZK-EVM에서
            <br />
            <span className="gradient-text">토큰을 받아보세요</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            Tokamak Network의 혁신적인 ZK-EVM 기술을 경험하고 특별한 에어드랍
            이벤트에 참여하세요. 간단한 몇 단계로 토큰을 받을 수 있습니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="btn-primary text-lg px-8 py-4 animate-glow">
              에어드랍 참여하기
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              자세히 알아보기
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                10,000+
              </div>
              <div className="text-gray-700">참여자 수</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                1,000,000
              </div>
              <div className="text-gray-700">총 토큰 풀</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                7일
              </div>
              <div className="text-gray-700">남은 시간</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
