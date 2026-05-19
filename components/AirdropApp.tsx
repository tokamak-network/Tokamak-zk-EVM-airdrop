"use client";

import { FormEvent, useEffect, useState } from "react";

type ApplicationStatus = "Pending" | "Transferred" | "Duplication" | "Failed";

type Application = {
  id: string;
  qualifyingTxHash: string;
  resolvedL1Address: string | null;
  resolvedL2Address: string | null;
  status: ApplicationStatus;
  reason: string | null;
  payoutTxHash: string | null;
  createdAt: string;
  updatedAt: string;
};

type AirdropAppProps = {
  channel: string;
  initialApplications: Application[];
  initialApplicationTotal: number;
  remainingBudgetTon: number;
  rewardTon: number;
  totalBudgetTon: number;
};

type ApiResult = {
  application?: Application | null;
  applications?: Application[];
  error?: string;
  page?: number;
  total?: number;
};

const statusPageSize = 10;

const statusText: Record<ApplicationStatus, string> = {
  Pending: "Waiting for verification or transfer",
  Transferred: "Reward transfer completed",
  Duplication: "Duplicate application",
  Failed: "Application failed",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
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

      setSubmitMessage("Application submitted.");
      await loadStatusPage(1);
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Submission failed.",
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
            <span>Tonnel</span>
          </div>
          <h1>TON AIRDROP ON TONNEL</h1>
          <p>
            Submit a valid private-state transaction from a Tonnel participant
            account to receive TON rewards.
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
              <span className="metricValue">{remainingBudgetTon} TON</span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="workArea" aria-label="Airdrop application">
        <section className="contentSection" aria-labelledby="how-to-participate">
          <h2 id="how-to-participate">How To Participate</h2>
          <ol>
            <li>
              Ask your AI agents to install the latest version of{" "}
              <code className="shadedText">
                @tokamak-private-dapps/private-state-cli
              </code>
              .
            </li>
            <li>
              Ask your AI agents to join{" "}
              <code className="shadedText">{channel}</code>.
            </li>
            <li>
              Ask your AI agents to make one private-state transfer notes
              transaction on <span className="accentText">Tonnel</span>.
            </li>
            <li>Ask your AI agents for the transaction hash.</li>
            <li>Submit the transaction hash with this form.</li>
          </ol>
          <p className="warning">
            Never share your Ethereum wallet private key or any secrets with
            others including us.
          </p>
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

        <section className="contentSection" aria-labelledby="winner-criteria">
          <h2 id="winner-criteria">Winner Criteria</h2>
          <ul className="criteriaList">
            <li>
              Submit the transaction hash from a real private-state transfer
              notes transaction made in Tonnel.
            </li>
            <li>
              The Ethereum wallet address that sent that transaction must have
              been joined to Tonnel when the transaction happened.
            </li>
            <li>
              We send the reward to the Tonnel channel address (L2 address)
              that was registered to that Ethereum wallet address at that time.
            </li>
            <li>
              A Tonnel channel address can receive only one reward. A
              transaction hash can also be used only once.
            </li>
            <li>
              A second transaction from the same Tonnel channel address will not
              receive another reward. The same transaction hash will not receive
              another reward, even if it is submitted with a different Tonnel
              channel address.
            </li>
          </ul>
        </section>
      </section>

      <footer className="siteFooter">
        <p>
          <span className="footerBrand">Tonnel</span> is the public name for{" "}
          <code>{channel}</code>, one of the Tokamak Private App Channels and a
          dedicated channel for the private-state DApp.
        </p>
        <p>
          The private-state DApp is one of the dApps that can run on Tokamak
          Private App Channels; it turns TON into proof-backed confidential
          notes inside Tonnel, enabling channel-local transfers without exposing
          note ownership or transfer meaning in public contract state.
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
      </footer>
    </main>
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
            <th>Tonnel channel address</th>
            <th>Status</th>
            <th>Created time</th>
            <th>Payout</th>
          </tr>
        </thead>
        <tbody>
          {applications.slice(0, 10).map((application) => (
            <tr key={application.id}>
              <td title={application.qualifyingTxHash}>
                <span className="hashCell">
                  <span className="fileIcon" aria-hidden="true" />
                  <span>{shortenHash(application.qualifyingTxHash)}</span>
                </span>
              </td>
              <td title={application.resolvedL2Address ?? ""}>
                {application.resolvedL2Address
                  ? shortenHash(application.resolvedL2Address)
                  : "Pending verification"}
              </td>
              <td>
                <span
                  className={`statusPill ${application.status}`}
                  title={statusText[application.status]}
                >
                  <span className="statusDot" aria-hidden="true" />
                  {application.status}
                </span>
              </td>
              <td>{formatCreatedAt(application.createdAt)}</td>
              <td title={application.payoutTxHash ?? ""}>
                {application.payoutTxHash ? (
                  <span className="receiptText">
                    {shortenHash(application.payoutTxHash)}
                  </span>
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

function formatCreatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    timeZone: "Asia/Seoul",
    year: "numeric",
  }).format(new Date(value));
}
