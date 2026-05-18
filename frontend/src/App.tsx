import {
  Archive,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ExternalLink,
  FileCheck2,
  Loader2,
  RefreshCw,
  Rocket,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  Wallet,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
} from "@stellar/freighter-api";
import {
  CONTRACT_ID,
  createGrantPulseClient,
  NETWORK_PASSPHRASE,
} from "./lib/grantpulse";
import type { Grant } from "./lib/grantpulse";

const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;
const labUrl = `https://lab.stellar.org/r/testnet/contract/${CONTRACT_ID}`;

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function readError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}

function isAccountMissing(error: unknown) {
  return readError(error).toLowerCase().includes("account not found");
}

async function fundTestnetAccount(publicKey: string) {
  const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!response.ok) {
    throw new Error("Testnet funding failed. Please try Friendbot manually.");
  }
}

function formatDate(timestamp: number | bigint) {
  const seconds = Number(timestamp);
  if (!seconds) return "-";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(seconds * 1000));
}

function numberValue(value: string, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export default function App() {
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("TESTNET");
  const [grantId, setGrantId] = useState("grant-001");
  const [title, setTitle] = useState("Stellar Learning Kit");
  const [requestedAmount, setRequestedAmount] = useState("2500");
  const [milestoneCount, setMilestoneCount] = useState("3");
  const [nextStatus, setNextStatus] = useState("Prototype submitted");
  const [lookupOwner, setLookupOwner] = useState("");
  const [lookupGrantId, setLookupGrantId] = useState("grant-001");
  const [grantCount, setGrantCount] = useState(0);
  const [totalGrants, setTotalGrants] = useState(0);
  const [activeGrant, setActiveGrant] = useState<Grant | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Connect Freighter to start");
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const connected = Boolean(address);
  const walletLabel = connected ? shortAddress(address) : "Not connected";
  const client = useMemo(() => createGrantPulseClient(address), [address]);
  const canWrite = connected && !isBusy;
  const grantActive = Boolean(activeGrant?.active);
  const ownerDisplay = activeGrant?.owner ? shortAddress(activeGrant.owner) : "-";
  const progressWidth = `${Math.min(progress, 100)}%`;

  const refreshStats = useCallback(
    async (walletAddress = address) => {
      const networkDetails = await getNetworkDetails();
      if ("error" in networkDetails && networkDetails.error) {
        throw new Error(String(networkDetails.error));
      }
      if (networkDetails.networkPassphrase !== NETWORK_PASSPHRASE) {
        throw new Error("Please switch Freighter to Testnet and connect again.");
      }

      setNetwork(networkDetails.network ?? "TESTNET");

      const readClient = createGrantPulseClient(walletAddress);
      const totalTx = await readClient.get_total_grants();
      setTotalGrants(Number(totalTx.result));

      if (walletAddress) {
        const countTx = await readClient.get_grant_count({ owner: walletAddress });
        setGrantCount(Number(countTx.result));
      }
    },
    [address],
  );

  async function connectWallet() {
    setIsBusy(true);
    setError("");

    try {
      const freighter = await isConnected();
      if ("error" in freighter && freighter.error) {
        throw new Error(String(freighter.error));
      }
      if (!freighter.isConnected) {
        throw new Error("Freighter extension was not found.");
      }

      const access = await requestAccess();
      if ("error" in access && access.error) {
        throw new Error(String(access.error));
      }

      const walletAddress = access.address || (await getAddress()).address;
      if (!walletAddress) {
        throw new Error("Wallet access was not granted.");
      }

      setAddress(walletAddress);
      setLookupOwner(walletAddress);

      try {
        await refreshStats(walletAddress);
      } catch (refreshError) {
        if (!isAccountMissing(refreshError)) throw refreshError;

        setStatus("Funding Testnet wallet");
        await fundTestnetAccount(walletAddress);
        await refreshStats(walletAddress);
      }

      setStatus("Wallet connected");
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Wallet connection failed");
    } finally {
      setIsBusy(false);
    }
  }

  async function createGrant() {
    if (!address) return;

    setIsBusy(true);
    setError("");
    setStatus("Creating grant record");

    try {
      const cleanGrantId = grantId.trim() || "grant-untitled";
      const tx = await client.create_grant({
        owner: address,
        grant_id: cleanGrantId,
        title: title.trim() || "Untitled Grant",
        requested_amount: numberValue(requestedAmount, 1000),
        milestone_count: numberValue(milestoneCount, 1),
      });
      const sent = await tx.signAndSend();

      setGrantCount(Number(sent.result));
      setLookupOwner(address);
      setLookupGrantId(cleanGrantId);
      await readGrant(address, cleanGrantId);
      await refreshStats(address);
      setStatus("Grant record created");
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Grant could not be created");
    } finally {
      setIsBusy(false);
    }
  }

  async function completeMilestone() {
    if (!address) return;

    setIsBusy(true);
    setError("");
    setStatus("Saving milestone");

    try {
      const cleanGrantId = grantId.trim() || "grant-untitled";
      const tx = await client.complete_milestone({
        owner: address,
        grant_id: cleanGrantId,
        status: nextStatus.trim() || "Milestone updated",
      });
      const sent = await tx.signAndSend();

      if (Number(sent.result) === 0) {
        setStatus("No active grant found");
      } else {
        setStatus(`Milestone ${Number(sent.result)} saved`);
      }

      setLookupOwner(address);
      setLookupGrantId(cleanGrantId);
      await readGrant(address, cleanGrantId);
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Milestone could not be saved");
    } finally {
      setIsBusy(false);
    }
  }

  async function reviewGrant(approved: boolean) {
    if (!address) return;

    const owner = lookupOwner || address;
    const id = lookupGrantId || grantId;

    setIsBusy(true);
    setError("");
    setStatus(approved ? "Approving grant" : "Rejecting grant");

    try {
      const tx = await client.review_grant({
        reviewer: address,
        owner,
        grant_id: id,
        approved,
      });
      const sent = await tx.signAndSend();

      setStatus(
        Boolean(sent.result)
          ? approved
            ? "Reviewer approval saved"
            : "Reviewer rejection saved"
          : "Review was not accepted",
      );
      await readGrant(owner, id);
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Review could not be saved");
    } finally {
      setIsBusy(false);
    }
  }

  async function archiveGrant() {
    if (!address) return;

    setIsBusy(true);
    setError("");
    setStatus("Archiving grant");

    try {
      const cleanGrantId = grantId.trim() || "grant-untitled";
      const tx = await client.archive_grant({
        owner: address,
        grant_id: cleanGrantId,
      });
      const sent = await tx.signAndSend();

      setStatus(Boolean(sent.result) ? "Grant archived" : "No active grant found");
      setLookupOwner(address);
      setLookupGrantId(cleanGrantId);
      await readGrant(address, cleanGrantId);
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Grant could not be archived");
    } finally {
      setIsBusy(false);
    }
  }

  async function readGrant(owner = lookupOwner, id = lookupGrantId) {
    if (!owner || !id) {
      setError("Owner address and grant ID are required.");
      return;
    }

    setIsBusy(true);
    setError("");

    try {
      await refreshStats(address || owner);
      const readClient = createGrantPulseClient(address || owner);
      const [grantTx, progressTx] = await Promise.all([
        readClient.get_grant({ owner, grant_id: id }),
        readClient.get_progress({ owner, grant_id: id }),
      ]);

      setActiveGrant(grantTx.result);
      setProgress(Number(progressTx.result));
      setStatus(grantTx.result.active ? "Grant verified" : "Grant inactive or missing");
    } catch (nextError) {
      setError(readError(nextError));
      setStatus("Grant lookup failed");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="brandMark">
            <Rocket size={25} />
          </div>
          <div>
            <p>Stellar Soroban</p>
            <h1>GrantPulse</h1>
          </div>
        </div>

        <div className="actions">
          <a href={explorerUrl} target="_blank" rel="noreferrer" title="Explorer">
            <ExternalLink size={18} />
          </a>
          <a href={labUrl} target="_blank" rel="noreferrer" title="Stellar Lab">
            <ShieldCheck size={18} />
          </a>
          <button onClick={connectWallet} disabled={isBusy} title="Connect wallet">
            {isBusy ? <Loader2 className="spin" size={18} /> : <Wallet size={18} />}
            <span>{connected ? walletLabel : "Connect"}</span>
          </button>
        </div>
      </header>

      <section className="scoreboard">
        <div>
          <span>Network</span>
          <strong>{network}</strong>
        </div>
        <div>
          <span>My Grants</span>
          <strong>{grantCount}</strong>
        </div>
        <div>
          <span>Total Grants</span>
          <strong>{totalGrants}</strong>
        </div>
        <div>
          <span>Progress</span>
          <strong>{progress}%</strong>
        </div>
      </section>

      <section className="workspace">
        <form className="panel composer" onSubmit={(event) => event.preventDefault()}>
          <div className="panelTitle">
            <CircleDollarSign size={21} />
            <h2>Create Grant</h2>
          </div>

          <div className="fieldGrid">
            <label>
              <span>Grant ID</span>
              <input value={grantId} onChange={(event) => setGrantId(event.target.value)} />
            </label>
            <label>
              <span>Requested Amount</span>
              <input
                inputMode="numeric"
                value={requestedAmount}
                onChange={(event) => setRequestedAmount(event.target.value)}
              />
            </label>
          </div>

          <label>
            <span>Project Title</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} />
          </label>

          <div className="fieldGrid">
            <label>
              <span>Milestones</span>
              <input
                inputMode="numeric"
                value={milestoneCount}
                onChange={(event) => setMilestoneCount(event.target.value)}
              />
            </label>
            <label>
              <span>Next Status</span>
              <input
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value)}
              />
            </label>
          </div>

          <div className="buttonRow">
            <button onClick={createGrant} disabled={!canWrite} title="Create grant">
              <FileCheck2 size={18} />
              <span>Create</span>
            </button>
            <button onClick={completeMilestone} disabled={!canWrite} title="Save milestone">
              <BadgeCheck size={18} />
              <span>Milestone</span>
            </button>
            <button onClick={archiveGrant} disabled={!canWrite} title="Archive grant">
              <Archive size={18} />
              <span>Archive</span>
            </button>
          </div>
        </form>

        <section className="panel verifier">
          <div className="panelTitle">
            <BarChart3 size={21} />
            <h2>Verify Grant</h2>
          </div>

          <label>
            <span>Owner Address</span>
            <input
              value={lookupOwner}
              onChange={(event) => setLookupOwner(event.target.value)}
            />
          </label>

          <label>
            <span>Grant ID</span>
            <input
              value={lookupGrantId}
              onChange={(event) => setLookupGrantId(event.target.value)}
            />
          </label>

          <div className="reviewRow">
            <button onClick={() => readGrant()} disabled={isBusy} title="Refresh grant">
              {isBusy ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
              <span>Refresh</span>
            </button>
            <button onClick={() => reviewGrant(true)} disabled={!canWrite} title="Approve grant">
              <ThumbsUp size={18} />
              <span>Approve</span>
            </button>
            <button onClick={() => reviewGrant(false)} disabled={!canWrite} title="Reject grant">
              <ThumbsDown size={18} />
              <span>Reject</span>
            </button>
          </div>
        </section>
      </section>

      <section className="grantCard">
        <div className="grantHeader">
          <div>
            <span>{activeGrant?.grant_id ?? "No grant selected"}</span>
            <h2>{activeGrant?.title ?? "Waiting for lookup"}</h2>
          </div>
          <strong className={grantActive ? "active" : "inactive"}>
            {grantActive ? "Active" : "Inactive"}
          </strong>
        </div>

        <div className="progressTrack">
          <div style={{ width: progressWidth }} />
        </div>

        <div className="grantStats">
          <div>
            <span>Owner</span>
            <strong>{ownerDisplay}</strong>
          </div>
          <div>
            <span>Requested</span>
            <strong>{activeGrant ? Number(activeGrant.requested_amount) : 0}</strong>
          </div>
          <div>
            <span>Milestones</span>
            <strong>
              {activeGrant ? Number(activeGrant.completed_milestones) : 0}/
              {activeGrant ? Number(activeGrant.milestone_count) : 0}
            </strong>
          </div>
          <div>
            <span>Approvals</span>
            <strong>{activeGrant ? Number(activeGrant.approvals) : 0}</strong>
          </div>
          <div>
            <span>Rejections</span>
            <strong>{activeGrant ? Number(activeGrant.rejections) : 0}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{activeGrant?.status ?? "-"}</strong>
          </div>
        </div>

        <div className="dates">
          <span>Created: {activeGrant ? formatDate(activeGrant.created_at) : "-"}</span>
          <span>Updated: {activeGrant ? formatDate(activeGrant.updated_at) : "-"}</span>
        </div>
      </section>

      <footer className={error ? "notice error" : "notice"}>
        {error ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
        <span>{error || status}</span>
      </footer>
    </main>
  );
}

