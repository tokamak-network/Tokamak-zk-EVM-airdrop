"use client";

import React, { useState } from "react";
import { LINKS } from "@/constants";

interface SocialVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const SocialVerificationModal: React.FC<SocialVerificationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [hasCompleted, setHasCompleted] = useState(false);

  const handleYesClick = () => {
    setHasCompleted(true);
    // Automatically open the Google Form in a new tab
    window.open(LINKS.SUBMIT_PROOF, "_blank");
  };

  const handleConfirm = () => {
    if (hasCompleted) {
      onConfirm();
      onClose();
    }
  };

  const socialChannels = [
    {
      id: "twitter",
      name: "X (Twitter)",
      description: "Follow @Tokamak_Network and like the announcement",
      link: "https://x.com/Tokamak_Network/status/1968136880236662937",
      color: "#4fc3f7"
    },
    {
      id: "medium", 
      name: "Medium",
      description: "Follow our Medium and clap for the article",
      link: "https://medium.com/tokamak-network/tokamak-giving-away-4-500-ton-tokens-heres-how-to-get-yours-73c4d181a802",
      color: "#29b6f6"
    },
    {
      id: "youtube",
      name: "YouTube", 
      description: "Subscribe to our channel and like the post",
      link: "https://www.youtube.com/post/Ugkxc9_t2jAsYyt-7dj2tUIkzHtt-00nP9gp",
      color: "#619EC9"
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#0a1930] to-[#1a2347] border-2 border-[#4fc3f7]/30"
        style={{ 
          borderRadius: '12px',
          boxShadow: '0 0 40px rgba(79, 195, 247, 0.3)'
        }}
      >
        {/* Cosmic Background Elements */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 text-white text-xs sm:text-sm animate-pulse">✦</div>
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white text-xs animate-pulse" style={{animationDelay: '1s'}}>+</div>
        <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white text-xs animate-pulse" style={{animationDelay: '2s'}}>⚙</div>
        
        {/* Header */}
        <div className="relative p-4 sm:p-8 pb-3 sm:pb-6">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 text-[#619EC9] hover:text-white transition-colors text-lg sm:text-xl touch-manipulation"
          >
            ✕
          </button>
          
          <div className="text-center pr-10 sm:pr-0">
            <h2 
              className="text-white text-2xl sm:text-3xl mb-2 sm:mb-3"
              style={{
                fontFamily: '"Jersey 10"',
                letterSpacing: '1.5px',
                textShadow: '2px 2px 0px #1a2347'
              }}
            >
              Social Quest
            </h2>
            <p 
              className="text-[#619EC9] text-xs sm:text-sm leading-relaxed"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              Complete ONE social task to be eligible for the airdrop
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="px-4 sm:px-8 pb-4 sm:pb-8">
          <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
            {socialChannels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => window.open(channel.link, "_blank")}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-white/5 active:bg-white/10 transition-colors rounded-lg border border-transparent hover:border-[#4fc3f7]/20 text-left touch-manipulation"
              >
                <div className="flex-1 min-w-0">
                  <h3 
                    className="text-white font-semibold mb-1 text-sm sm:text-base"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    {channel.name}
                  </h3>
                  <p 
                    className="text-[#619EC9] text-xs leading-relaxed pr-2"
                    style={{ fontFamily: '"IBM Plex Mono"' }}
                  >
                    {channel.description}
                  </p>
                </div>
                <div 
                  className="text-xs sm:text-sm font-semibold hover:underline flex-shrink-0"
                  style={{ color: channel.color, fontFamily: '"IBM Plex Mono"' }}
                >
                  Open →
                </div>
              </button>
            ))}
          </div>

          {/* Confirmation Question */}
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-white/5 rounded-lg border border-[#4fc3f7]/20">
            <p 
              className="text-white text-xs sm:text-sm mb-3 sm:mb-4 text-center leading-relaxed"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              Have you completed at least one of the social tasks above?
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button
                onClick={handleYesClick}
                className={`px-4 sm:px-6 py-2 sm:py-2 rounded-lg transition-all text-xs sm:text-sm font-semibold touch-manipulation ${
                  hasCompleted
                    ? 'bg-[#4fc3f7] text-black'
                    : 'bg-transparent border border-[#619EC9] text-[#619EC9] hover:border-[#4fc3f7] hover:text-[#4fc3f7] active:bg-white/5'
                }`}
                style={{ fontFamily: '"IBM Plex Mono"' }}
              >
                Yes, I completed one
              </button>
              <button
                onClick={() => setHasCompleted(false)}
                className={`px-4 sm:px-6 py-2 sm:py-2 rounded-lg transition-all text-xs sm:text-sm font-semibold touch-manipulation ${
                  !hasCompleted
                    ? 'bg-[#619EC9] text-black'
                    : 'bg-transparent border border-[#619EC9] text-[#619EC9] hover:border-[#4fc3f7] hover:text-[#4fc3f7] active:bg-white/5'
                }`}
                style={{ fontFamily: '"IBM Plex Mono"' }}
              >
                Not yet
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-3 bg-transparent border border-[#619EC9] text-[#619EC9] hover:border-[#4fc3f7] hover:text-[#4fc3f7] active:bg-white/5 transition-colors rounded-lg text-sm sm:text-base touch-manipulation"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!hasCompleted}
              className={`flex-1 px-4 sm:px-6 py-3 rounded-lg transition-all text-sm sm:text-base touch-manipulation ${
                hasCompleted
                  ? 'bg-[#4fc3f7] hover:bg-[#29b6f6] active:bg-[#1e88e5] text-black font-semibold'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              {hasCompleted ? 'Close & Continue' : 'Submit Proof'}
            </button>
          </div>

          {/* Helper Text */}
          <p 
            className="text-center text-[#619EC9]/70 text-xs sm:text-xs mt-3 sm:mt-4 leading-relaxed px-2"
            style={{ fontFamily: '"IBM Plex Mono"' }}
          >
            {hasCompleted 
              ? '✓ Form opened in new tab - complete it to submit your proof' 
              : '⚠️ Please complete at least one social task to be eligible'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialVerificationModal;
