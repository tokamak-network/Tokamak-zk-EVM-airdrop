import Image from "next/image";
import CTA_1 from "../../assets/hero/buttons/CTA.svg";
import CTA_2 from "../../assets/hero/buttons/CTA-2.svg";
import CTA_3 from "../../assets/hero/buttons/CTA-3.svg";
import CTA_4 from "../../assets/hero/buttons/CTA-4.svg";
import CTA_2_MOBILE from "../../assets/hero/buttons/CTA-2-mobile.svg";

export const GrabTONButton = () => {
  return (
    <div className="flex items-center gap-10 max-800:flex-col max-800:gap-4">
      <Image
        src={CTA_3}
        alt="start now"
        style={{ cursor: "pointer" }}
        draggable={false}
      />

      {/* 데스크탑용 CTA_2 (1360px 이상에서 표시) */}
      <Image
        src={CTA_2}
        alt="start now"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="hidden desktop:block"
      />

      {/* 모바일용 CTA_2_MOBILE (1359px 이하에서 표시) */}
      <Image
        src={CTA_2_MOBILE}
        alt="start now"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="block desktop:hidden"
      />
    </div>
  );
};

export default function Buttons() {
  return (
    <div className="flex items-center gap-10 max-800:flex-col max-800:gap-4">
      {/* 데스크탑용 CTA_1 (1360px 이상에서 표시) */}
      <Image
        src={CTA_1}
        alt="start now"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="hidden desktop:block"
      />

      {/* 모바일용 CTA_4 (1359px 이하에서 표시) */}
      <Image
        src={CTA_4}
        alt="start now"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="block desktop:hidden"
      />

      {/* 데스크탑용 CTA_2 (1360px 이상에서 표시) */}
      <Image
        src={CTA_2}
        alt="start now"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="hidden desktop:block"
      />

      {/* 모바일용 CTA_2_MOBILE (1359px 이하에서 표시) */}
      <Image
        src={CTA_2_MOBILE}
        alt="start now"
        style={{ cursor: "pointer" }}
        draggable={false}
        className="block desktop:hidden"
      />
    </div>
  );
}
