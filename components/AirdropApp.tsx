"use client";

import { FormEvent, useEffect, useState } from "react";

import { faqItems } from "@/lib/site-content";
import {
  failureReasonMessages,
  type ApplicationStatus,
  type FailureReason,
} from "@/lib/status";

type Application = {
  id: string;
  qualifyingTxHash: string;
  resolvedL1Address: string | null;
  resolvedL2Address: string | null;
  status: ApplicationStatus;
  reason: string | null;
  failureReasons: FailureReason[];
  payoutTxHash: string | null;
  transferredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AirdropAppProps = {
  channel: string;
  initialApplications: Application[];
  initialApplicationTotal: number;
  remainingBudgetTon: number | null;
  rewardTon: number;
  totalBudgetTon: number;
};

type ApiResult = {
  application?: Application | null;
  applications?: Application[];
  created?: boolean;
  error?: string;
  page?: number;
  retryAfterSeconds?: number;
  total?: number;
};

type ParticipateMode = "steps" | "agent" | "prerequisites" | "criteria" | "faq";

type EligibilityResult = {
  eligible: boolean;
  reason:
    | "Transaction duplicate"
    | "Transaction ineligible"
    | "L2 address duplicate"
    | null;
};

type SubmitStatus = {
  guidance: string;
  title: string;
  tone: "error" | "success" | "warning";
};

class ApiRequestError extends Error {
  readonly retryAfterSeconds: number | null;
  readonly status: number;

  constructor(message: string, status: number, retryAfterSeconds: number | null) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

const statusPageSize = 10;

const statusClassNames: Record<ApplicationStatus, string> = {
  Pending: "Pending",
  Transferred: "Transferred",
  Failed: "Failed",
};

export function AirdropApp({
  channel,
  initialApplications,
  initialApplicationTotal,
  remainingBudgetTon,
  rewardTon,
  totalBudgetTon,
}: AirdropAppProps) {
  const [qualifyingTxHash, setQualifyingTxHash] = useState("");
  const [statusApplications, setStatusApplications] =
    useState(initialApplications);
  const [statusPage, setStatusPage] = useState(1);
  const [statusTotal, setStatusTotal] = useState(initialApplicationTotal);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [participateMode, setParticipateMode] =
    useState<ParticipateMode>("steps");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let frameId = 0;

    function syncScroll() {
      frameId = 0;
      setScrollY(window.scrollY);
    }

    function handleScroll() {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(syncScroll);
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  async function loadStatusPage(page: number) {
    setIsLoadingStatus(true);
    setStatusMessage(null);

    try {
      const response = await fetch(`/api/applications?page=${page}`);
      const result = (await response.json()) as ApiResult;

      if (
        !response.ok ||
        !Array.isArray(result.applications) ||
        typeof result.page !== "number" ||
        typeof result.total !== "number"
      ) {
        throw new Error(result.error ?? "Status table failed to load.");
      }

      setStatusApplications(result.applications);
      setStatusPage(result.page);
      setStatusTotal(result.total);
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Status table failed to load.",
      );
    } finally {
      setIsLoadingStatus(false);
    }
  }

  async function requestEligibility(txHash: string): Promise<EligibilityResult> {
    const response = await fetch("/api/applications/eligibility", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ qualifyingTxHash: txHash }),
    });
    const result = (await response.json()) as EligibilityResult & {
      error?: string;
      retryAfterSeconds?: number;
    };

    if (
      !response.ok ||
      typeof result.eligible !== "boolean" ||
      (result.reason !== null &&
        result.reason !== "Transaction duplicate" &&
        result.reason !== "Transaction ineligible" &&
        result.reason !== "L2 address duplicate")
    ) {
      throw new ApiRequestError(
        result.error ?? "Eligibility check failed.",
        response.status,
        getRetryAfterSeconds(response, result),
      );
    }

    return {
      eligible: result.eligible,
      reason: result.reason,
    };
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({
      guidance: "We are checking the transaction hash before accepting it.",
      title: "Checking eligibility",
      tone: "warning",
    });

    let eligibility: EligibilityResult;

    try {
      setIsCheckingEligibility(true);
      eligibility = await requestEligibility(qualifyingTxHash);
    } catch (error) {
      setSubmitStatus(
        isRateLimitError(error)
          ? buildRateLimitSubmitStatus(error)
          : {
              guidance:
                error instanceof Error
                  ? `${error.message} Check the transaction hash and try again.`
                  : "Check the transaction hash and try again.",
              title: "Eligibility check failed",
              tone: "error",
            },
      );
      setIsSubmitting(false);
      return;
    } finally {
      setIsCheckingEligibility(false);
    }

    if (!eligibility.eligible) {
      setSubmitStatus(buildIneligibleSubmitStatus(eligibility.reason));
      setIsSubmitting(false);
      return;
    }

    setSubmitStatus({
      guidance: "Submitting the transaction hash now.",
      title: "Eligibility passed",
      tone: "success",
    });

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qualifyingTxHash }),
      });
      const result = (await response.json()) as ApiResult;
      const application = result.application;

      if (!response.ok || !application) {
        throw new ApiRequestError(
          result.error ?? "Submission failed.",
          response.status,
          getRetryAfterSeconds(response, result),
        );
      }

      setSubmitStatus(
        result.created === false
          ? {
              guidance:
                "This transaction hash is already in the submission history. Check the Status table for its current result.",
              title: "Already submitted",
              tone: "warning",
            }
          : {
              guidance:
                "Your transaction hash was accepted. It will appear in the Status table as Pending until the worker reviews it.",
              title: "Application submitted",
              tone: "success",
            },
      );
      await loadStatusPage(1);
    } catch (error) {
      setSubmitStatus(
        isRateLimitError(error)
          ? buildRateLimitSubmitStatus(error)
          : {
              guidance:
                error instanceof Error
                  ? `${error.message} Try again later.`
                  : "Try again later.",
              title: "Submission failed",
              tone: "error",
            },
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="appShell">
      <div className="cosmicScene" aria-hidden="true">
        <div
          className="cosmicLayer farLayer"
          style={{ transform: `translate3d(0, ${scrollY * -0.06}px, 0)` }}
        />
        <div
          className="cosmicLayer midLayer"
          style={{ transform: `translate3d(0, ${scrollY * -0.16}px, 0)` }}
        >
          <span className="planet planetMint" />
          <span className="planet planetPink" />
          <span className="comet" />
        </div>
        <div
          className="cosmicLayer nearLayer"
          style={{ transform: `translate3d(0, ${scrollY * -0.34}px, 0)` }}
        >
          <span className="rocket" />
          <span className="tonCoin coinOne">TON</span>
          <span className="tonCoin coinTwo">TON</span>
          <span className="satellite" />
        </div>
      </div>

      <section className="heroBand">
        <div className="heroContent">
          <div className="brandLine">
            <span className="accentText">Tonnel</span>
          </div>
          <h1>
            TON AIRDROP ON <span className="accentText">TONNEL</span>
          </h1>
          <p>
            Make a valid private-state transfer on{" "}
            <span className="accentText">Tonnel</span>, submit the transaction
            hash, and earn 25 TON.
          </p>
        </div>
        <dl className="eventStats">
          <div>
            <dt>Reward</dt>
            <dd>
              <span className="metricValue">{rewardTon} TON</span>
              <span className="metricNote">per valid submission</span>
            </dd>
          </div>
          <div>
            <dt>Total reward budget</dt>
            <dd>
              <span className="metricValue">{totalBudgetTon} TON</span>
            </dd>
          </div>
          <div>
            <dt>Remaining</dt>
            <dd>
              <span className="metricValue">
                {remainingBudgetTon === null
                  ? "Sync pending"
                  : `${remainingBudgetTon} TON`}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="workArea" aria-label="Airdrop application">
        <section className="contentSection" aria-labelledby="how-to-participate">
          <div className="sectionHeader">
            <h2 id="how-to-participate">How To Participate</h2>
            <span className="sectionUpdated">Last updated: May 30, 2026</span>
          </div>
          <ParticipateModeToggle
            mode={participateMode}
            onChange={setParticipateMode}
          />
          {participateMode === "steps" ? (
            <ParticipationSteps channel={channel} />
          ) : null}
          {participateMode === "agent" ? (
            <AgentPromptGuide channel={channel} />
          ) : null}
          {participateMode === "prerequisites" ? <Prerequisites /> : null}
          {participateMode === "criteria" ? <WinnerCriteria /> : null}
          {participateMode === "faq" ? <Faq /> : null}
        </section>

        <section className="contentSection" aria-labelledby="submit">
          <h2 id="submit">Submit</h2>
          <form onSubmit={submitApplication} className="formStack">
            <label>
              Transaction hash that calls transfer notes in the private-state DApp
              <input
                value={qualifyingTxHash}
                onChange={(event) => {
                  setQualifyingTxHash(event.target.value);
                  setSubmitStatus(null);
                }}
                placeholder="Transfer notes transaction hash"
                autoComplete="off"
                required
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting || isCheckingEligibility}
            >
              {isCheckingEligibility
                ? "Checking eligibility..."
                : isSubmitting
                  ? "Submitting..."
                  : "Submit application"}
            </button>
          </form>
          {submitStatus ? <SubmitStatusCard status={submitStatus} /> : null}
        </section>

        <section className="contentSection" aria-labelledby="status">
          <h2 id="status">Submissions</h2>
          <StatusTable applications={statusApplications} />
          <StatusPagination
            isLoading={isLoadingStatus}
            onNext={() => void loadStatusPage(statusPage + 1)}
            onPrevious={() => void loadStatusPage(statusPage - 1)}
            page={statusPage}
            pageSize={statusPageSize}
            total={statusTotal}
          />
          {statusMessage ? <p className="message">{statusMessage}</p> : null}
        </section>

      </section>

      <footer className="siteFooter">
        <nav className="footerLinks" aria-label="External links">
          <a
            href="https://www.tokamak.network/"
            target="_blank"
            rel="noreferrer"
            aria-label="Tokamak Network official website"
            title="Tokamak Network"
          >
            <WebsiteIcon />
          </a>
          <a
            href="https://github.com/tokamak-network/Tokamak-zk-EVM-contracts"
            target="_blank"
            rel="noreferrer"
            aria-label="Tokamak zk-EVM contracts GitHub repository"
            title="Tokamak zk-EVM contracts"
          >
            <GithubIcon />
          </a>
          <a
            href="https://t.me/tonnel_ethereum"
            target="_blank"
            rel="noreferrer"
            aria-label="Tonnel Telegram"
            title="Tonnel Telegram"
          >
            <TelegramIcon />
          </a>
        </nav>
        <div className="footerFinePrint">
          <p>
            Never share your Ethereum wallet private key or any secrets with
            others, including us.
          </p>
        </div>
      </footer>
    </main>
  );
}

function WebsiteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.4 2.4 3.6 5.4 3.6 9s-1.2 6.6-3.6 9" />
      <path d="M12 3C9.6 5.4 8.4 8.4 8.4 12s1.2 6.6 3.6 9" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.8c-5.1 0-9.2 4.1-9.2 9.2 0 4 2.6 7.4 6.2 8.7.5.1.7-.2.7-.5v-1.7c-2.5.5-3-1.1-3-1.1-.4-1-1-1.3-1-1.3-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.2-2-.2-4.1-1-4.1-4.5 0-1 .4-1.8.9-2.5-.1-.2-.4-1.2.1-2.5 0 0 .8-.2 2.5.9.7-.2 1.5-.3 2.3-.3s1.6.1 2.3.3c1.7-1.1 2.5-.9 2.5-.9.5 1.3.2 2.3.1 2.5.6.7.9 1.5.9 2.5 0 3.5-2.1 4.2-4.1 4.5.3.3.6.8.6 1.7v2.5c0 .3.2.6.7.5 3.6-1.3 6.2-4.7 6.2-8.7 0-5.1-4.1-9.2-9.2-9.2Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.7 4.1 3.7 10.7c-1.2.5-1.2 1.1-.2 1.4l4.4 1.4 1.7 5.2c.2.6.3.8.7.8.3 0 .5-.1.8-.4l2.1-2 4.3 3.2c.8.4 1.3.2 1.5-.8l2.7-12.9c.3-1.2-.4-1.8-1-1.5ZM8.6 13.1l9.9-6.2c.5-.3.9-.1.5.2l-8 7.2-.3 3.2-1.5-4.6-.6.2Z" />
    </svg>
  );
}

function ParticipateModeToggle({
  mode,
  onChange,
}: {
  mode: ParticipateMode;
  onChange: (mode: ParticipateMode) => void;
}) {
  return (
    <div className="modeToggle" aria-label="Participation mode">
      <button
        type="button"
        aria-pressed={mode === "steps"}
        className={mode === "steps" ? "active" : ""}
        onClick={() => onChange("steps")}
      >
        Show steps
      </button>
      <button
        type="button"
        aria-pressed={mode === "agent"}
        className={mode === "agent" ? "active" : ""}
        onClick={() => onChange("agent")}
      >
        Use AI Agent
      </button>
      <button
        type="button"
        aria-pressed={mode === "prerequisites"}
        className={mode === "prerequisites" ? "active" : ""}
        onClick={() => onChange("prerequisites")}
      >
        Prerequisites
      </button>
      <button
        type="button"
        aria-pressed={mode === "criteria"}
        className={mode === "criteria" ? "active" : ""}
        onClick={() => onChange("criteria")}
      >
        Winner criteria
      </button>
      <button
        type="button"
        aria-pressed={mode === "faq"}
        className={mode === "faq" ? "active" : ""}
        onClick={() => onChange("faq")}
      >
        FAQ
      </button>
    </div>
  );
}

function ParticipationSteps({ channel }: { channel: string }) {
  return (
    <div className="participationPanel">
      <ol className="participationList">
        <li>
          Ask your AI agent how to install or update the latest{" "}
          <code className="shadedText">
            @tokamak-private-dapps/private-state-cli
          </code>
          .
        </li>
        <li>
          Ask your AI agent how to configure an Ethereum mainnet RPC URL. Ankr
          is recommended because channel and wallet recovery can be too slow on
          many other free RPC providers.
        </li>
        <li>
          Ask your AI agent how to prepare a MetaMask-funded burner account
          without pasting secrets into chat.
        </li>
        <li>
          Ask your AI agent how to join{" "}
          <code className="shadedText">{channel}</code> on Ethereum mainnet.
        </li>
        <li>
          Ask your AI agent how to make one real private-state transfer notes
          transaction on <span className="accentText">Tonnel</span>.
        </li>
        <li>
          Ask your AI agent to identify the Ethereum transaction hash for that
          transfer notes transaction. Do not submit a join, deposit, approval, or
          setup transaction hash.
        </li>
        <li>Submit the transfer notes transaction hash with this form.</li>
      </ol>
    </div>
  );
}

function AgentPromptGuide({ channel }: { channel: string }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const prompt = buildAgentPrompt(channel);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="agentPromptPanel">
      <p className="participationIntro">
        If you are not technical, copy this prompt into your own LLM agent.
      </p>
      <ul className="promptSafetyList">
        <li>Never paste your seed phrase or private key into chat.</li>
        <li>Use a burner MetaMask account instead of your main wallet.</li>
        <li>Submit only the transfer notes transaction hash.</li>
      </ul>
      <div className="promptToolbar">
        <span>Copy this into your LLM agent</span>
        <button type="button" onClick={() => void copyPrompt()}>
          {copyState === "copied"
            ? "Copied"
            : copyState === "failed"
              ? "Copy failed"
              : "Copy prompt"}
        </button>
      </div>
      <pre className="agentPromptBox">
        <code>{prompt}</code>
      </pre>
    </div>
  );
}

function buildAgentPrompt(channel: string): string {
  return `I want to participate in TON AIRDROP ON TONNEL at https://airdrop.tonnel.io. I am not a developer and I only know how to use MetaMask. Please act as my careful local technical assistant and guide me until I have one valid Ethereum transaction hash to submit on the airdrop page.

Event facts:
- Official page: https://airdrop.tonnel.io
- Reward: 25 TON per valid submission
- Channel name: \`${channel}\`
- Network: Ethereum mainnet only
- Required transaction: a real private-state \`transfer notes\` transaction on Tonnel
- The submitted hash must be the Ethereum transaction hash for the \`transfer notes\` transaction, not the join, deposit, approval, or setup transaction
- Duplicate Ethereum transaction hashes do not receive another reward
- Duplicate resolved Tonnel L2/channel addresses do not receive another reward

Safety rules:
- Never ask me to paste my seed phrase, private key, RPC API key, or any secret into this chat.
- Never print, upload, summarize, or store secrets in chat or logs.
- Do not put secrets directly into shell commands that may be saved in terminal history.
- Strongly prefer a new burner MetaMask account for this event. Do not use my main wallet unless I explicitly insist.
- If a private key is required, guide me to export only the burner account private key from MetaMask, save it into a restricted local file, and use that file with the CLI. Do not ask me to paste the key here.
- Before spending ETH gas, TON, or approving token allowance, explain exactly what transaction will be sent, what may be spent, and wait for my explicit confirmation.
- Use exact/minimal token approvals where possible. Do not approve unlimited allowance unless there is no supported alternative and I explicitly confirm.
- Do not execute any transaction while checking commands, help text, installation, balances, or dry-run output.

RPC rule:
- Recommend Ankr as the default Ethereum mainnet RPC provider.
- Reason: this workflow may require channel and wallet recovery, which can be impractically slow on many other free RPC providers. Use Ankr unless it is unavailable for me.
- Guide me to create or use an Ankr Ethereum mainnet RPC URL.
- If Ankr requires an API key, show me how to save the RPC URL locally without pasting the key into chat.
- Do not continue with a random public RPC if recovery or wallet sync becomes too slow; switch back to Ankr or tell me clearly what is blocking progress.

Interactive checklist:
1. Identify my operating system and whether you can run terminal commands on my computer. If you cannot run commands, give me exact copy/paste commands for my OS and wait for the result after each command.
2. Ask whether I have already submitted a hash, already joined \`${channel}\`, or already made a Tonnel private-state \`transfer notes\` transaction. If yes, help verify before spending anything new.
3. Check whether Node.js and npm are installed. If not, guide me through installing them for my OS, then verify with \`node --version\` and \`npm --version\`.
4. Install or update the latest CLI:
   \`npm install -g @tokamak-private-dapps/private-state-cli@latest\`
   Then run:
   \`private-state-cli install\`
   After installation, check the CLI version and run \`private-state-cli --help\`.
5. Help me get an Ankr Ethereum mainnet RPC URL. Use Ankr by default. Do not ask me to paste API keys into chat. Help me save the RPC URL locally and configure the CLI for Ethereum mainnet using current \`private-state-cli --help\` output.
6. Prepare a MetaMask-funded Ethereum mainnet burner account for local CLI use. If the CLI requires a private key, guide me to:
   - create a new MetaMask account for this event,
   - fund it only with the ETH and TON needed,
   - export only that account's private key,
   - save it into a restricted local file,
   - import or use it with the CLI's documented \`--private-key-file\` option.
   Never ask me to paste the private key into chat.
7. Check that the burner account has enough ETH for Ethereum mainnet gas and enough Tonnel-compatible TON on Ethereum mainnet for the 4 TON channel entry fee and the private-state transfer flow. If anything is missing, stop and tell me exactly what is missing.
8. Check whether the account is already joined to \`${channel}\`. If not, prepare the join transaction on Ethereum mainnet, show what will be spent, and wait for my confirmation before broadcasting.
9. Create a new local Tonnel/private-state wallet workspace unless I already have one. If recovery is needed, handle recovery secrets only locally and never through chat. Use the Ankr RPC URL for recovery.
10. Prepare one small valid private-state \`transfer notes\` transaction on Tonnel. If a recipient L2/channel address is required, use only an address I control or a CLI-supported self-transfer flow. Verify this before broadcasting.
11. Before broadcasting the \`transfer notes\` transaction, show me the network, channel, sender, recipient, estimated gas/TON effects, and confirm that this is the airdrop-eligible transaction type. Wait for my explicit confirmation.
12. After success, find the Ethereum transaction hash for that \`transfer notes\` transaction. Confirm it is a 66-character \`0x...\` hash and explicitly confirm it is not the join, deposit, approval, import, or setup hash.
13. Tell me to open https://airdrop.tonnel.io, paste that transaction hash into the Submit form, and check the status after submission.

At every step, explain what I should see, what can go wrong, and what to do next. If you are unsure about a CLI command, run \`private-state-cli --help\` or the relevant subcommand help first. Do not guess when money or secrets are involved.`;
}

function Prerequisites() {
  return (
    <div className="participationPanel">
      <p className="participationIntro">
        Your LLM will kindly explain everything, but I would like to summarize
        the requirements for participation for you.
      </p>
      <ul className="participationList">
        <li>
          <strong>Channel entry fee:</strong> 4 TON (partially refundable
          conditionally)
        </li>
        <li>
          <strong>Your EOA private key</strong> (not disclosed to anyone)
        </li>
        <li>
          <strong>Node RPC URL</strong> (Recommended: Ankr's free API)
        </li>
      </ul>
    </div>
  );
}

function WinnerCriteria() {
  return (
    <ul className="participationList">
      <li>
        Submit the transaction hash from a real private-state transfer notes
        transaction made in <span className="accentText">Tonnel</span>.
      </li>
      <li>
        The Ethereum wallet address that sent that transaction must have been
        joined to <span className="accentText">Tonnel</span> when the
        transaction happened.
      </li>
      <li>
        We send the reward to the <span className="accentText">Tonnel</span>{" "}
        channel address (L2 address) that was registered to that Ethereum wallet
        address at that time.
      </li>
      <li>
        A <span className="accentText">Tonnel</span> channel address can receive
        only one reward. A transaction hash can also be used only once.
      </li>
      <li>
        A second transaction from the same{" "}
        <span className="accentText">Tonnel</span> channel address will not
        receive another reward. The same transaction hash will not receive
        another reward, even if it is submitted with a different{" "}
        <span className="accentText">Tonnel</span> channel address.
      </li>
    </ul>
  );
}

function Faq() {
  return (
    <dl className="faqList">
      {faqItems.map((item) => (
        <div key={item.question}>
          <dt>{item.question}</dt>
          <dd>
            {item.answer}
            {item.links?.length ? (
              <>
                {" "}
                {item.links.map((link, index) => (
                  <span key={link.url}>
                    {index > 0 ? ", " : ""}
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  </span>
                ))}
                .
              </>
            ) : null}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function buildIneligibleSubmitStatus(
  reason: EligibilityResult["reason"],
): SubmitStatus {
  if (reason === "Transaction duplicate") {
    return {
      guidance:
        "This transaction hash has already been used. Submit a different private-state transfer notes transaction hash.",
      title: "Transaction duplicate",
      tone: "error",
    };
  }

  if (reason === "L2 address duplicate") {
    return {
      guidance:
        "The Tonnel channel address resolved from this transaction has already received a reward. Ask your AI agent to prepare a new eligible Tonnel participation and submit a new private-state transfer notes transaction hash.",
      title: "Tonnel channel address already rewarded",
      tone: "error",
    };
  }

  return {
    guidance:
      "This hash does not resolve to an eligible private-state transfer notes transaction on Tonnel. Ask your AI agent to make a private-state transfer notes transaction on Tonnel, then submit that Ethereum transaction hash.",
    title: "Transaction ineligible",
    tone: "error",
  };
}

function buildRateLimitSubmitStatus(error: ApiRequestError): SubmitStatus {
  const waitTime = formatRetryAfter(error.retryAfterSeconds);
  const isRegistrationLimit = error.message.includes("Registration");

  return {
    guidance: buildRateLimitGuidance(isRegistrationLimit, waitTime),
    title: isRegistrationLimit
      ? "Registration limit reached"
      : "Submission temporarily limited",
    tone: "warning",
  };
}

function buildRateLimitGuidance(
  isRegistrationLimit: boolean,
  waitTime: string | null,
): string {
  const prefix = isRegistrationLimit
    ? "You have registered too many submissions today."
    : "You are submitting too quickly.";

  if (!waitTime) {
    return `${prefix} Try again after the limit resets.`;
  }

  return `${prefix} Try again in about ${waitTime}, after the limit resets.`;
}

function formatRetryAfter(retryAfterSeconds: number | null): string | null {
  if (!retryAfterSeconds || retryAfterSeconds <= 0) {
    return null;
  }

  const totalMinutes = Math.max(Math.ceil(retryAfterSeconds / 60), 1);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  }

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }

  if (minutes > 0 && days === 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }

  return parts.join(" ");
}

function getRetryAfterSeconds(
  response: Response,
  result: { retryAfterSeconds?: number },
): number | null {
  if (
    typeof result.retryAfterSeconds === "number" &&
    Number.isFinite(result.retryAfterSeconds)
  ) {
    return Math.max(Math.ceil(result.retryAfterSeconds), 1);
  }

  const retryAfterHeader = Number(response.headers.get("Retry-After"));

  if (!Number.isFinite(retryAfterHeader) || retryAfterHeader <= 0) {
    return null;
  }

  return Math.ceil(retryAfterHeader);
}

function isRateLimitError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError && error.status === 429;
}

function SubmitStatusCard({ status }: { status: SubmitStatus }) {
  return (
    <div className={`submitStatus ${status.tone}`}>
      <strong>Status: {status.title}</strong>
      <span>{status.guidance}</span>
    </div>
  );
}

function StatusTable({ applications }: { applications: Application[] }) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  if (applications.length === 0) {
    return <p className="emptyState">No submissions yet.</p>;
  }

  return (
    <>
      <div className="statusTableWrap">
        <table className="statusTable">
          <colgroup>
            <col className="statusColHash" />
            <col className="statusColStatus" />
            <col className="statusColTime" />
            <col className="statusColPayout" />
          </colgroup>
          <thead>
            <tr>
              <th>Transaction hash</th>
              <th>Status</th>
              <th>Submitted time</th>
              <th>Payout</th>
            </tr>
          </thead>
          <tbody>
            {applications.slice(0, 10).map((application) => {
              const statusTitle = getStatusTitle(application);

              return (
                <tr key={application.id}>
                  <td
                    data-label="Transaction"
                    title={application.qualifyingTxHash}
                  >
                    <a
                      className="hashCell hashLink"
                      href={etherscanTxUrl(application.qualifyingTxHash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <span className="fileIcon" aria-hidden="true" />
                      <span>{shortenHash(application.qualifyingTxHash)}</span>
                    </a>
                  </td>
                  <td data-label="Status">
                    <span
                      aria-label={statusTitle}
                      className={`statusPill ${statusClassNames[application.status]}`}
                      onBlur={() => setTooltip(null)}
                      onFocus={(event) => {
                        if (statusTitle) {
                          setTooltip(
                            getTooltipStateFromElement(
                              event.currentTarget,
                              statusTitle,
                            ),
                          );
                        }
                      }}
                      onMouseEnter={(event) => {
                        if (statusTitle) {
                          setTooltip(
                            getTooltipStateFromPointer(
                              event.clientX,
                              event.clientY,
                              statusTitle,
                            ),
                          );
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      onMouseMove={(event) => {
                        if (statusTitle) {
                          setTooltip(
                            getTooltipStateFromPointer(
                              event.clientX,
                              event.clientY,
                              statusTitle,
                            ),
                          );
                        }
                      }}
                      tabIndex={statusTitle ? 0 : undefined}
                    >
                      <span className="statusDot" aria-hidden="true" />
                      {application.status}
                    </span>
                  </td>
                  <td data-label="Submitted">
                    {formatCreatedAt(application.createdAt)}
                  </td>
                  <td data-label="Payout" title={application.payoutTxHash ?? ""}>
                    {application.payoutTxHash ? (
                      <a
                        className="receiptText"
                        href={etherscanTxUrl(application.payoutTxHash)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {shortenHash(application.payoutTxHash)}
                      </a>
                    ) : (
                      <span className="mutedDash">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {tooltip ? (
        <div
          className="statusTooltip"
          role="tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      ) : null}
    </>
  );
}

function getStatusTitle(application: Application): string | undefined {
  if (application.status === "Transferred") {
    return undefined;
  }

  if (application.status === "Pending") {
    return getPendingStatusTitle();
  }

  const messages = application.failureReasons
    .map((reason) => failureReasonMessages[reason])
    .filter(Boolean);

  if (messages.length === 0) {
    return failureReasonMessages.internal_payout_error;
  }

  return messages.join("\n");
}

function getPendingStatusTitle(): string {
  return `Next scheduled payout check in about ${formatDurationUntilNextPayout()}.`;
}

function formatDurationUntilNextPayout(now = new Date()): string {
  const next = getNextPayoutTime(now);
  const totalMinutes = Math.max(
    1,
    Math.ceil((next.getTime() - now.getTime()) / 60_000),
  );
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function getNextPayoutTime(now: Date): Date {
  const scheduleHours = [0, 6, 12, 18];

  for (const hour of scheduleHours) {
    const candidate = new Date(now);
    candidate.setHours(hour, 0, 0, 0);

    if (candidate.getTime() > now.getTime()) {
      return candidate;
    }
  }

  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);

  return next;
}

function getTooltipStateFromPointer(x: number, y: number, text: string) {
  return {
    text,
    x: clampTooltipX(x + 14),
    y: Math.min(y + 18, window.innerHeight - 24),
  };
}

function getTooltipStateFromElement(element: HTMLElement, text: string) {
  const rect = element.getBoundingClientRect();

  return {
    text,
    x: clampTooltipX(rect.left + rect.width / 2),
    y: Math.min(rect.bottom + 10, window.innerHeight - 24),
  };
}

function clampTooltipX(x: number): number {
  return Math.min(Math.max(x, 16), Math.max(window.innerWidth - 340, 16));
}

function StatusPagination({
  isLoading,
  onNext,
  onPrevious,
  page,
  pageSize,
  total,
}: {
  isLoading: boolean;
  onNext: () => void;
  onPrevious: () => void;
  page: number;
  pageSize: number;
  total: number;
}) {
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="statusControls">
      <p>
        Showing {start}-{end} of {total}
      </p>
      <div>
        <button
          type="button"
          disabled={isLoading || page <= 1}
          onClick={onPrevious}
        >
          Previous
        </button>
        <span>
          Page {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={isLoading || page >= totalPages}
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function shortenHash(value: string): string {
  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

function etherscanTxUrl(txHash: string): string {
  return `https://etherscan.io/tx/${txHash}`;
}

function formatCreatedAt(value: string): string {
  return `${new Date(value).toISOString().slice(0, 16).replace("T", " ")} UTC`;
}
