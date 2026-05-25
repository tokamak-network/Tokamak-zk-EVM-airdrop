"use client";

import { FormEvent, useEffect, useState } from "react";

type ApplicationStatus =
  | "Pending"
  | "Transferred"
  | "Duplication"
  | "Invalid tx"
  | "Failed";

type Application = {
  id: string;
  qualifyingTxHash: string;
  resolvedL1Address: string | null;
  resolvedL2Address: string | null;
  status: ApplicationStatus;
  reason: string | null;
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
  total?: number;
};

type StatusMode = "history" | "eligibility";
type ParticipateMode = "steps" | "prerequisites" | "criteria";

type EligibilityResult = {
  eligible: boolean;
  reason:
    | "Transaction duplicate"
    | "Transaction ineligible"
    | "L2 address duplicate"
    | null;
};

const statusPageSize = 10;

const statusText: Record<ApplicationStatus, string> = {
  Pending: "Waiting for verification or transfer",
  Transferred: "Reward transfer completed",
  Duplication: "Duplicate application",
  "Invalid tx": "Submitted transaction is not eligible",
  Failed: "Application failed",
};

const statusClassNames: Record<ApplicationStatus, string> = {
  Pending: "Pending",
  Transferred: "Transferred",
  Duplication: "Duplication",
  "Invalid tx": "InvalidTx",
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
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [participateMode, setParticipateMode] =
    useState<ParticipateMode>("steps");
  const [statusMode, setStatusMode] = useState<StatusMode>("history");
  const [eligibilityTxHash, setEligibilityTxHash] = useState("");
  const [eligibilityResult, setEligibilityResult] =
    useState<EligibilityResult | null>(null);
  const [eligibilityMessage, setEligibilityMessage] = useState<string | null>(
    null,
  );
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

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

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
        throw new Error(result.error ?? "Submission failed.");
      }

      setSubmitMessage(
        result.created === false
          ? "This transaction hash has already been submitted."
          : "Application submitted.",
      );
      await loadStatusPage(1);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Submission failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function checkTransactionEligibility(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setIsCheckingEligibility(true);
    setEligibilityResult(null);
    setEligibilityMessage(null);

    try {
      const response = await fetch("/api/applications/eligibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qualifyingTxHash: eligibilityTxHash }),
      });
      const result = (await response.json()) as EligibilityResult & {
        error?: string;
      };

      if (
        !response.ok ||
        typeof result.eligible !== "boolean" ||
        (result.reason !== null &&
          result.reason !== "Transaction duplicate" &&
          result.reason !== "Transaction ineligible" &&
          result.reason !== "L2 address duplicate")
      ) {
        throw new Error(result.error ?? "Eligibility check failed.");
      }

      setEligibilityResult({
        eligible: result.eligible,
        reason: result.reason,
      });
    } catch (error) {
      setEligibilityMessage(
        error instanceof Error ? error.message : "Eligibility check failed.",
      );
    } finally {
      setIsCheckingEligibility(false);
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
            <dt>Budget cap</dt>
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
            <span className="sectionUpdated">Last updated: May 21, 2026</span>
          </div>
          <ParticipateModeToggle
            mode={participateMode}
            onChange={setParticipateMode}
          />
          {participateMode === "steps" ? (
            <ParticipationSteps channel={channel} />
          ) : null}
          {participateMode === "prerequisites" ? <Prerequisites /> : null}
          {participateMode === "criteria" ? <WinnerCriteria /> : null}
          {participateMode !== "criteria" ? (
            <p className="warning">
              Never share your Ethereum wallet private key or any secrets with
              others including us.
            </p>
          ) : null}
        </section>

        <section className="contentSection" aria-labelledby="submit">
          <h2 id="submit">Submit</h2>
          <form onSubmit={submitApplication} className="formStack">
            <label>
              Qualifying transaction hash
              <input
                value={qualifyingTxHash}
                onChange={(event) => setQualifyingTxHash(event.target.value)}
                placeholder="Transfer notes transaction hash"
                autoComplete="off"
                required
              />
            </label>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit application"}
            </button>
          </form>
          {submitMessage ? <p className="message">{submitMessage}</p> : null}
        </section>

        <section className="contentSection" aria-labelledby="status">
          <h2 id="status">Status</h2>
          <StatusModeToggle mode={statusMode} onChange={setStatusMode} />
          {statusMode === "history" ? (
            <>
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
            </>
          ) : (
            <EligibilityChecker
              eligibilityTxHash={eligibilityTxHash}
              isChecking={isCheckingEligibility}
              message={eligibilityMessage}
              onChange={setEligibilityTxHash}
              onSubmit={checkTransactionEligibility}
              result={eligibilityResult}
            />
          )}
        </section>

      </section>

      <footer className="siteFooter">
        <p>
          <span className="footerBrand">Tonnel</span> is the public name for{" "}
          <code className="shadedText">{channel}</code>, one of the Tokamak
          Private App Channels and a dedicated channel for the private-state
          DApp.
        </p>
        <p>
          The private-state DApp is one of the dApps that can run on Tokamak
          Private App Channels; it turns TON into proof-backed confidential
          notes inside <span className="accentText">Tonnel</span>, enabling
          channel-local transfers without exposing note ownership or transfer
          meaning in public contract state.
        </p>
        <p>
          To learn more, read{" "}
          <a
            href="https://github.com/tokamak-network/Tokamak-zk-EVM-contracts/blob/main/docs/index.md"
            target="_blank"
            rel="noreferrer"
          >
            docs
          </a>
          .
        </p>
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
            This site stores submitted transaction hashes, verification and
            payout records, and resolved participant addresses. It may also
            store hashed submission metadata and coarse location data for
            aggregate distribution and abuse analysis. Rewards are not
            guaranteed and depend on verification, duplicate checks, remaining
            budget, network availability, and operational review.
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
    <div className="statusModeToggle" aria-label="Participation mode">
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
    </div>
  );
}

function ParticipationSteps({ channel }: { channel: string }) {
  return (
    <ol className="participationList">
      <li>
        Ask your AI agents to install the latest version of{" "}
        <code className="shadedText">
          @tokamak-private-dapps/private-state-cli
        </code>
        .
      </li>
      <li>
        Ask your AI agents to join <code className="shadedText">{channel}</code>.
      </li>
      <li>
        Ask your AI agents to make one private-state transfer notes transaction
        on <span className="accentText">Tonnel</span>.
      </li>
      <li>Ask your AI agents for the transaction hash.</li>
      <li>Submit the transaction hash with this form.</li>
    </ol>
  );
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

function StatusModeToggle({
  mode,
  onChange,
}: {
  mode: StatusMode;
  onChange: (mode: StatusMode) => void;
}) {
  return (
    <div className="statusModeToggle" aria-label="Status mode">
      <button
        type="button"
        aria-pressed={mode === "history"}
        className={mode === "history" ? "active" : ""}
        onClick={() => onChange("history")}
      >
        Show history
      </button>
      <button
        type="button"
        aria-pressed={mode === "eligibility"}
        className={mode === "eligibility" ? "active" : ""}
        onClick={() => onChange("eligibility")}
      >
        Check eligibility
      </button>
    </div>
  );
}

function EligibilityChecker({
  eligibilityTxHash,
  isChecking,
  message,
  onChange,
  onSubmit,
  result,
}: {
  eligibilityTxHash: string;
  isChecking: boolean;
  message: string | null;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  result: EligibilityResult | null;
}) {
  return (
    <div className="eligibilityPanel">
      <form onSubmit={onSubmit} className="formStack">
        <label>
          Transaction hash
          <input
            value={eligibilityTxHash}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Transfer notes transaction hash"
            autoComplete="off"
            required
          />
        </label>
        <button type="submit" disabled={isChecking}>
          {isChecking ? "Checking..." : "Check eligibility"}
        </button>
      </form>
      {result ? <EligibilityResultCard result={result} /> : null}
      {message ? <p className="message">{message}</p> : null}
    </div>
  );
}

function EligibilityResultCard({ result }: { result: EligibilityResult }) {
  if (result.eligible) {
    return (
      <div className="eligibilityResult eligible">
        <strong>Eligible</strong>
        <span>This transaction currently satisfies the winner criteria.</span>
      </div>
    );
  }

  return (
    <div className="eligibilityResult ineligible">
      <strong>Not eligible</strong>
      <span>{result.reason}</span>
    </div>
  );
}

function StatusTable({ applications }: { applications: Application[] }) {
  if (applications.length === 0) {
    return <p className="emptyState">No submissions yet.</p>;
  }

  return (
    <div className="statusTableWrap">
      <table className="statusTable">
        <thead>
          <tr>
            <th>Transaction hash</th>
            <th>Status</th>
            <th>Submitted time</th>
            <th>Payout</th>
          </tr>
        </thead>
        <tbody>
          {applications.slice(0, 10).map((application) => (
            <tr key={application.id}>
              <td title={application.qualifyingTxHash}>
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
              <td>
                <span
                  className={`statusPill ${statusClassNames[application.status]}`}
                  title={statusText[application.status]}
                >
                  <span className="statusDot" aria-hidden="true" />
                  {application.status}
                </span>
              </td>
              <td>{formatCreatedAt(application.createdAt)}</td>
              <td title={application.payoutTxHash ?? ""}>
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
          ))}
        </tbody>
      </table>
    </div>
  );
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
