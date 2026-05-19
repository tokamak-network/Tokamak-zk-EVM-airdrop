"use client";

import { FormEvent, useState } from "react";

type ApplicationStatus = "Pending" | "Transferred" | "Duplication" | "Failed";

type Application = {
  id: string;
  l2Address: string;
  qualifyingTxHash: string;
  status: ApplicationStatus;
  reason: string | null;
  payoutTxHash: string | null;
  createdAt: string;
  updatedAt: string;
};

type AirdropAppProps = {
  channel: string;
  rewardTon: number;
  totalBudgetTon: number;
  initialPanel?: "submit" | "status";
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
  rewardTon,
  totalBudgetTon,
  initialPanel = "submit",
}: AirdropAppProps) {
  const [activePanel, setActivePanel] = useState(initialPanel);
  const [l2Address, setL2Address] = useState("");
  const [qualifyingTxHash, setQualifyingTxHash] = useState("");
  const [statusQuery, setStatusQuery] = useState("");
  const [application, setApplication] = useState<Application | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const commandSnippet = `private-state-cli join ${channel}
private-state-cli transfer-notes --channel ${channel}
private-state-cli address`;

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setApplication(null);

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ l2Address, qualifyingTxHash }),
      });
      const result = (await response.json()) as ApiResult;

      if (!response.ok || !result.application) {
        throw new Error(result.error ?? "Submission failed.");
      }

      setApplication(result.application);
      setStatusQuery(result.application.id);
      setMessage("Application submitted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function lookupStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLookingUp(true);
    setMessage(null);
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
      setMessage(error instanceof Error ? error.message : "Lookup failed.");
    } finally {
      setIsLookingUp(false);
    }
  }

  return (
    <main className="appShell">
      <section className="heroBand">
        <div className="heroContent">
          <div className="brandLine">
            <span>Tonnel</span>
          </div>
          <h1>TON AIRDROP ON TONNEL</h1>
          <p>
            Submit an L2 account and a valid private-state transaction in the
            Tonnel channel to receive TON rewards.
          </p>
        </div>
        <dl className="eventStats">
          <div>
            <dt>Reward</dt>
            <dd>{rewardTon} TON</dd>
          </div>
          <div>
            <dt>Budget cap</dt>
            <dd>{totalBudgetTon} TON</dd>
          </div>
          <div>
            <dt>Limit</dt>
            <dd>Once per L2 account</dd>
          </div>
        </dl>
      </section>

      <section className="workArea" aria-label="Airdrop application">
        <div className="instructions">
          <h2>Before submitting</h2>
          <ol>
            <li>Install the latest Tokamak private-state CLI package.</li>
            <li>
              Join Tonnel, the public name for <code>{channel}</code>.
            </li>
            <li>Create one transfer notes transaction in Tonnel.</li>
            <li>Submit only your L2 address and transaction hash here.</li>
          </ol>
          <pre>{commandSnippet}</pre>
          <p className="warning">
            Never submit an EOA private key, seed phrase, or RPC secret to this
            site.
          </p>
        </div>

        <div className="panel">
          <div className="tabs" role="tablist" aria-label="Airdrop forms">
            <button
              type="button"
              role="tab"
              aria-selected={activePanel === "submit"}
              className={activePanel === "submit" ? "active" : ""}
              onClick={() => setActivePanel("submit")}
            >
              Submit
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activePanel === "status"}
              className={activePanel === "status" ? "active" : ""}
              onClick={() => setActivePanel("status")}
            >
              Status
            </button>
          </div>

          {activePanel === "submit" ? (
            <form onSubmit={submitApplication} className="formStack">
              <label>
                L2 address
                <input
                  value={l2Address}
                  onChange={(event) => setL2Address(event.target.value)}
                  placeholder="L2 address"
                  autoComplete="off"
                  required
                />
              </label>
              <label>
                Qualifying transaction hash
                <input
                  value={qualifyingTxHash}
                  onChange={(event) =>
                    setQualifyingTxHash(event.target.value)
                  }
                  placeholder="Transfer notes transaction hash"
                  autoComplete="off"
                  required
                />
              </label>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit application"}
              </button>
            </form>
          ) : (
            <form onSubmit={lookupStatus} className="formStack">
              <label>
                Application ID, L2 address, or transaction hash
                <input
                  value={statusQuery}
                  onChange={(event) => setStatusQuery(event.target.value)}
                  placeholder="Application ID, L2 address, or tx hash"
                  autoComplete="off"
                  required
                />
              </label>
              <button type="submit" disabled={isLookingUp}>
                {isLookingUp ? "Checking..." : "Check status"}
              </button>
            </form>
          )}

          {message ? <p className="message">{message}</p> : null}
          {application ? <StatusResult application={application} /> : null}
        </div>
      </section>

      <footer className="siteFooter">
        <p>
          Tonnel is the public name for <code>{channel}</code>, one of the
          Tokamak Private App Channels. private-state is one of the dApps
          running in this channel. To learn more, read{" "}
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
          <dt>L2 address</dt>
          <dd>{application.l2Address}</dd>
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
