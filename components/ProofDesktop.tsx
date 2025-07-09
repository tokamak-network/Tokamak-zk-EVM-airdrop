import React from "react";
import Image from "next/image";
import PipeTopImage from "@/assets/FAQ/pipe-top.png";
import ProofDashboardImage from "@/assets/FAQ/proof-dashboard.png";

const ProofDesktop = () => {
  return (
    <div className="">
      <div className="absolute top-[-154px] left-[146px]">
        <Image className="" src={PipeTopImage} alt="piep_top" />
      </div>
      <div className="absolute top-[37px] left-[-30px]">
        <Image
          src={ProofDashboardImage}
          alt="ProofDashboardImage"
          className="w-[720px] h-[827px]"
        />
      </div>
    </div>
  );
};

export default ProofDesktop;
