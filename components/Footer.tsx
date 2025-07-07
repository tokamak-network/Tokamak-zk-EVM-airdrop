import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 브랜드 정보 */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-tokamak-500 to-airdrop-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold">Tokamak</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              차세대 ZK-EVM 기술을 기반으로 한 이더리움 레이어 2 솔루션입니다.
              더 빠르고 안전한 블록체인 경험을 제공합니다.
            </p>
          </div>

          {/* 제품 */}
          <div>
            <h4 className="font-semibold text-lg mb-4">제품</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  에어드랍 참여
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  참여 방법
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  자주 묻는 질문
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  백서
                </a>
              </li>
            </ul>
          </div>

          {/* 개발자 */}
          <div>
            <h4 className="font-semibold text-lg mb-4">개발자</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  도움말 센터
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  개발자 문서
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  커뮤니티
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  블로그
                </a>
              </li>
            </ul>
          </div>

          {/* 소셜 미디어 */}
          <div>
            <h4 className="font-semibold text-lg mb-4">소셜 미디어</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Telegram
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Medium
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2024 Tokamak Network. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              개인정보보호정책
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              서비스 약관
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              쿠키 정책
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
