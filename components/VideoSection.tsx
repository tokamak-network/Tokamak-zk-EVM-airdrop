"use client";

import React from "react";

const VideoSection: React.FC = () => {
  return (
    <section 
      id="how-it-works"
      className="w-full py-20 bg-gradient-to-b from-[#1a2347] to-[#0a1930]"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 
            className="text-white text-4xl md:text-5xl lg:text-6xl mb-6"
            style={{
              fontFamily: '"Jersey 10"',
              letterSpacing: '2.4px',
              textShadow: '2px 2px 0px #1a2347',
            }}
          >
            How It Works
          </h2>
          <p 
            className="text-[#619EC9] text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            style={{
              fontFamily: '"IBM Plex Mono"',
            }}
          >
            Watch how our desktop app transforms any transaction into a ZK proof with just a transaction hash. No coding or advanced math required!
          </p>
        </div>

        {/* Video Container */}
        <div className="relative max-w-4xl mx-auto">
          {/* Decorative border */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#4fc3f7] to-[#619EC9] rounded-xl opacity-20 blur-sm"></div>
          
          {/* Video wrapper with responsive aspect ratio */}
          <div className="relative bg-[#00223B] rounded-lg border-2 border-[#4fc3f7] overflow-hidden shadow-2xl">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src="https://www.youtube.com/embed/PdbzobSY-ME?si=a3kLDcL0eAjuCL-S&amp;controls=1&amp;disablekb=1&amp;rel=0&amp;showinfo=0&amp;iv_load_policy=3&amp;modestbranding=1"
                title="Tokamak ZK-EVM Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default VideoSection;
