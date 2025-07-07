import Image from "next/image";
import CTA_1 from "../../assets/hero/buttons/CTA.svg";
import CTA_2 from "../../assets/hero/buttons/CTA-2.svg";

export default function Buttons() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
      <Image
        src={CTA_1}
        alt="start now"
        style={{ cursor: "pointer" }}
        draggable={false}
      />
      <Image
        src={CTA_2}
        alt="start now"
        style={{ cursor: "pointer" }}
        draggable={false}
      />
    </div>
  );
}
