export const siteUrl = "https://airdrop.tonigma.network";
export const siteTitle = "TON AIRDROP ON TONIGMA";
export const siteDescription =
  "Get 25 TON per valid private-state transfer on Tonigma. Submit your transaction hash and track reward status.";
export const channelName = "the-great-first-channel";
export const rewardTon = 25;
export const totalBudgetTon = 5000;

export type FaqItem = {
  answer: string;
  links?: Array<{
    label: string;
    url: string;
  }>;
  question: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "What is Tonigma?",
    answer:
      "Tonigma is the public name for the-great-first-channel, one of the Tokamak Private App Channels and a dedicated channel for the private-state DApp.",
  },
  {
    question: "What are Tokamak Private App Channels?",
    answer:
      "Tokamak Private App Channels are application-specific channels where DApps can run with proof-backed channel state while keeping Ethereum as the public settlement and custody layer.",
    links: [
      {
        label: "Tokamak Private App Channels docs",
        url: "https://github.com/tokamak-network/Tokamak-zk-EVM-contracts/blob/main/docs/index.md",
      },
    ],
  },
  {
    question: "What is the private-state DApp?",
    answer:
      "The private-state DApp turns TON into proof-backed confidential notes inside Tonigma, enabling channel-local transfers without exposing note ownership or transfer meaning in public contract state.",
  },
  {
    question: "What is the reward?",
    answer: "25 TON per valid private-state transfer submitted for verification.",
  },
  {
    question: "What is the total reward budget?",
    answer: "5,000 TON.",
  },
  {
    question: "What network does this campaign use?",
    answer: "Ethereum.",
  },
  {
    question: "What asset is TON?",
    answer:
      "TON means Tokamak Network Token. Tokamak Network docs describe TON as a token that can be purchased from centralized exchanges or swapped through decentralized exchanges; exchange tickers may vary, including TOKAMAK.",
    links: [
      {
        label: "TON asset docs",
        url: "https://docs.tokamak.network/home/information/get-ton",
      },
    ],
  },
  {
    question: "What should I submit?",
    answer:
      "Submit the Ethereum transaction hash from a valid private-state transfer notes transaction made on Tonigma.",
  },
  {
    question: "How is verification handled?",
    answer:
      "Verification uses Ethereum transaction hash submission and operational review. Rewards depend on transaction verification, duplicate checks, remaining budget, network availability, and operational review.",
  },
  {
    question: "What is the official campaign page?",
    answer: "The official campaign page is https://airdrop.tonigma.network.",
    links: [
      {
        label: "https://airdrop.tonigma.network",
        url: siteUrl,
      },
    ],
  },
  {
    question: "What data does this site store?",
    answer:
      "This site stores submitted transaction hashes, verification and payout records, and resolved participant addresses. It may also store hashed submission metadata and coarse location data for aggregate distribution and abuse analysis.",
  },
];
