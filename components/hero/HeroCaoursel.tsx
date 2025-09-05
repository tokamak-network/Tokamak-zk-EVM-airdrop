import { Lines } from "../common/lines";

export const HeroCaoursel = () => {
  return (
    <div className="w-full relative overflow-hidden">
      <Lines height={8}></Lines>
      <div className="absolute inset-0 flex items-center">
        <div className="flex animate-scroll-left h-[24px] items-center">
          {Array.from({ length: 20 }, (_, index) => (
            <span
              key={index}
              className="whitespace-nowrap"
              style={{
                color: "#FFF716",
                textShadow: "0px 1px 0px #002C4B",
                WebkitTextStrokeWidth: "1px",
                WebkitTextStrokeColor: "#002C4B",
                fontFamily: '"Jersey 10"',
                fontSize: "30px",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: "normal",
                letterSpacing: "0.3px",
                marginRight: "88px",
              }}
            >
              Claim up to 150 TON.
            </span>
          ))}
          {Array.from({ length: 20 }, (_, index) => (
            <span
              key={`duplicate-${index}`}
              className="whitespace-nowrap"
              style={{
                color: "#FFF716",
                textShadow: "0px 1px 0px #002C4B",
                WebkitTextStrokeWidth: "1px",
                WebkitTextStrokeColor: "#002C4B",
                fontFamily: '"Jersey 10"',
                fontSize: "30px",
                fontStyle: "normal",
                fontWeight: "400",
                lineHeight: "normal",
                letterSpacing: "0.3px",
                marginRight: "88px",
              }}
            >
              Claim up to 150 TON.
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
