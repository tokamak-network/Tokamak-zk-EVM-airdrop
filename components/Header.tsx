import React from "react";
import CarouselItemImage from "@/assets/header/carousel-item.svg";
import LogoImage from "@/assets/header/logo.svg";
import Image from "next/image";
import { Lines } from "./common/lines";

const Banner = () => {
  return (
    <div className="relative h-[144px] bg-gradient-to-r from-[#7AC8FF] to-[#159CFC] overflow-hidden">
      {/* 무한 스크롤 컨테이너 */}
      <div className="absolute inset-0 flex items-center">
        <div className="flex animate-scroll-right">
          {/* 첫 번째 그룹 */}
          <div className="flex items-center gap-x-[80px] whitespace-nowrap px-[80px]">
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
          </div>

          {/* 두 번째 그룹 (동일한 내용 반복) */}
          <div className="flex items-center gap-x-[80px] whitespace-nowrap px-[80px]">
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
            <Image
              src={CarouselItemImage}
              alt="logo"
              className="flex-shrink-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Navigation = () => {
  return (
    <div className="h-[80px] flex items-center pl-[40px] border-t-[2px] border-b-[2px] border-[#111111] gap-x-[112px]">
      <Image src={LogoImage} alt="logo" />
      <div className="flex gap-x-[72px] font-[500]">
        <span style={{ cursor: "pointer" }}>Overview</span>
        <span style={{ cursor: "pointer" }}>Quests</span>
        <span style={{ cursor: "pointer" }}>Proof</span>
        <span style={{ cursor: "pointer" }}>FAQ</span>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  return (
    <header>
      <Lines />
      <Banner />
      <Navigation />
    </header>
  );
};

export default Header;
