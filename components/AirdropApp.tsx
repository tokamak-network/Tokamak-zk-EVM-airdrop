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
  remainingBudgetTon: number;
  rewardTon: number;
  totalBudgetTon: number;
};

type ApiResult = {
  application?: Application | null;
  error?: string;
};

const statusText: Record<ApplicationStatus, string> = {
  Pending: "Waiting for verification or transfer",
  Transferred: "Reward transfer completed",
  Duplication: "Duplicate application",
  Failed: "Application failed",
};

export function AirdropApp({
  channel,
  remainingBudgetTon,
  rewardTon,
  totalBudgetTon,
}: AirdropAppProps) {
  const [qualifyingTxHash, setQualifyingTxHash] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const commandSnippet = `private-state-cli channel join --channel-name ${channel}
private-state-cli wallet transfer-notes --wallet <WALLET> --network mainnet --note-ids <NOTE_IDS> --recipients <RECIPIENTS> --amounts <AMOUNTS>
Use the transaction hash printed by wallet transfer-notes.`;

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

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    setStatusMessage(null);
    setApplication(null);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ qualifyingTxHash }),
      });
      const result = (await response.json()) as ApiResult;

      if (!response.ok || !result.application) {
        throw new Error(result.error ?? "Submission failed.");
      }

      setApplication(result.application);
      setStatusQuery(result.application.id);
      setSubmitMessage("Application submitted.");
    } catch (error) {
      setSubmitMessage(
        error instanceof Error ? error.message : "Submission failed.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function lookupStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLookingUp(true);
    setStatusMessage(null);
    setSubmitMessage(null);
    setApplication(null);

    try {
      const response = await fetch(
        `/api/applications/status?query=${encodeURIComponent(statusQuery)}`,
      );
      const result = (await response.json()) as ApiResult;

      if (!response.ok || !result.application) {
        throw new Error(result.error ?? "Application not found.");
      }

      setApplication(result.application);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Lookup failed.");
    } finally {
      setIsLookingUp(false);
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
            <li>Install the latest Tokamak private-state CLI package.</li>
            <li>
              Join Tonnel, the public name for <code>{channel}</code>.
            </li>
            <li>Create one transfer notes transaction in Tonnel.</li>
            <li>Submit only the transaction hash here.</li>
          </ol>
          <pre>{commandSnippet}</pre>
          <p className="warning">
            Never submit an EOA private key, seed phrase, or RPC secret to this
            site.
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
          <form onSubmit={lookupStatus} className="formStack">
            <label>
              Application ID, transaction hash, or resolved address
              <input
                value={statusQuery}
                onChange={(event) => setStatusQuery(event.target.value)}
                placeholder="Application ID, address, or tx hash"
                autoComplete="off"
                required
              />
            </label>
            <button type="submit" disabled={isLookingUp}>
              {isLookingUp ? "Checking..." : "Check status"}
            </button>
          </form>
          {statusMessage ? <p className="message">{statusMessage}</p> : null}
          {application ? <StatusResult application={application} /> : null}
        </section>

        <section className="contentSection" aria-labelledby="winner-criteria">
          <h2 id="winner-criteria">Winner Criteria</h2>
          <ul className="criteriaList">
            <li>
              The submitted transaction must be a valid private-state transfer
              notes transaction in Tonnel.
            </li>
            <li>
              The Ethereum wallet address that submitted the transaction must
              be a Tonnel channel participant at the transaction block.
            </li>
            <li>
              The reward is sent to the L2 address registered by that Ethereum
              wallet address for the matching participation epoch.
            </li>
            <li>
              A resolved L2 address and a qualifying transaction hash can each
              receive at most one reward.
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

function StatusResult({ application }: { application: Application }) {
  return (
    <section className="statusResult" aria-label="Application status">
      <div className="statusHeader">
        <span className={`statusPill ${application.status}`}>
          {application.status}
        </span>
        <p>{statusText[application.status]}</p>
      </div>
      <dl>
        <div>
          <dt>Application ID</dt>
          <dd>{application.id}</dd>
        </div>
        <div>
          <dt>Resolved L1 submitter</dt>
          <dd>{application.resolvedL1Address ?? "Pending verification"}</dd>
        </div>
        <div>
          <dt>Reward L2 address</dt>
          <dd>{application.resolvedL2Address ?? "Pending verification"}</dd>
        </div>
        <div>
          <dt>Qualifying transaction</dt>
          <dd>{application.qualifyingTxHash}</dd>
        </div>
        {application.payoutTxHash ? (
          <div>
            <dt>Payout transaction</dt>
            <dd>{application.payoutTxHash}</dd>
          </div>
        ) : null}
        {application.reason ? (
          <div>
            <dt>Reason</dt>
            <dd>{application.reason}</dd>
          </div>
        ) : null}
      </dl>
    </section>
  );
}
