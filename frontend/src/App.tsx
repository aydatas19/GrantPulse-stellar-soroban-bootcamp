import {
  Activity,
  Archive,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Coins,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileCheck2,
  LogOut,
  Loader2,
  MessageSquare,
  RefreshCw,
  Rocket,
  Send,
  ShieldCheck,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  UserPlus,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";
import {
  Asset,
  BASE_FEE,
  Horizon,
  Networks,
  Operation,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import {
  CONTRACT_ID,
  createGrantPulseClient,
  NETWORK_PASSPHRASE,
} from "./lib/grantpulse";
import type { Grant } from "./lib/grantpulse";
import {
  addFeedbackEntry,
  addTelemetryEvent,
  buildFeedbackCsv,
  buildEvidenceBundle,
  extractTransactionHash,
  forwardFeedbackEntry,
  forwardTelemetryEvent,
  installRuntimeMonitoring,
  normalizeTransactionProof,
  readFeedbackEntries,
  readTelemetryEvents,
  summarizeEvidence,
  summarizeFeedbackInsights,
  summarizeLevel5,
} from "./lib/telemetry";
import type { FeedbackEntry, TelemetryEvent } from "./lib/telemetry";

const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${CONTRACT_ID}`;
const labUrl = `https://lab.stellar.org/r/testnet/contract/${CONTRACT_ID}`;
const liveDemoUrl = "https://aydatas19.github.io/GrantPulse-stellar-soroban-bootcamp/";
const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

type PaymentResult = {
  status: "idle" | "success" | "error";
  message: string;
  hash?: string;
  amount?: string;
  destination?: string;
  operation?: string;
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function readError(error: unknown) {
  if (typeof error === "object" && error !== null) {
    if ("response" in error) {
      const response = (error as {
        response?: {
          data?: {
            title?: string;
            detail?: string;
            extras?: { result_codes?: unknown };
          };
        };
      }).response;
      const title = response?.data?.title;
      const detail = response?.data?.detail;
      const resultCodes = response?.data?.extras?.result_codes
        ? JSON.stringify(response.data.extras.result_codes)
        : "";
      const horizonMessage = [title, detail, resultCodes].filter(Boolean).join(" ");
      if (horizonMessage) return horizonMessage;
    }
    if ("message" in error) return String((error as { message: unknown }).message);
    if ("error" in error) return readError((error as { error: unknown }).error);
  }
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unexpected error.";
}

function isAccountMissing(error: unknown) {
  const message = readError(error).toLowerCase();
  return message.includes("account not found") || message.includes("404");
}

async function fundTestnetAccount(publicKey: string) {
  const response = await fetch(`https://friendbot.stellar.org?addr=${publicKey}`);
  if (!response.ok) {
    throw new Error("Testnet funding failed. Please try Friendbot manually.");
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function formatXlmBalance(balance: string) {
  const amount = Number(balance);
  if (!Number.isFinite(amount)) return balance;
  return amount.toLocaleString("en", {
    maximumFractionDigits: 7,
    minimumFractionDigits: 0,
  });
}

function normalizeXlmAmount(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,7})?$/.test(normalized)) {
    throw new Error("Enter a valid XLM amount with up to 7 decimals.");
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("XLM amount must be greater than 0.");
  }

  return amount.toFixed(7);
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
  const [xlmBalance, setXlmBalance] = useState("");
  const [paymentDestination, setPaymentDestination] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("1");
  const [paymentResult, setPaymentResult] = useState<PaymentResult>({
    status: "idle",
    message: "No testnet payment yet",
  });
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
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>(() =>
    readTelemetryEvents(),
  );
  const [feedbackEntries, setFeedbackEntries] = useState<FeedbackEntry[]>(() =>
    readFeedbackEntries(),
  );
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackEmail, setFeedbackEmail] = useState("");
  const [feedbackWallet, setFeedbackWallet] = useState("");
  const [feedbackRole, setFeedbackRole] = useState("Builder");
  const [feedbackRating, setFeedbackRating] = useState("8");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackBlocker, setFeedbackBlocker] = useState("");
  const [feedbackTxHash, setFeedbackTxHash] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("No feedback yet");

  const connected = Boolean(address);
  const walletLabel = connected ? shortAddress(address) : "Not connected";
  const balanceDisplay = connected
    ? xlmBalance
      ? `${formatXlmBalance(xlmBalance)} XLM`
      : "Loading"
    : "-";
  const txExplorerUrl = paymentResult.hash
    ? `https://stellar.expert/explorer/testnet/tx/${paymentResult.hash}`
    : "";
  const horizonServer = useMemo(() => new Horizon.Server(HORIZON_URL), []);
  const client = useMemo(() => createGrantPulseClient(address), [address]);
  const canWrite = connected && !isBusy;
  const grantActive = Boolean(activeGrant?.active);
  const ownerDisplay = activeGrant?.owner ? shortAddress(activeGrant.owner) : "-";
  const progressWidth = `${Math.min(progress, 100)}%`;
  const evidenceSummary = useMemo(
    () => summarizeEvidence(telemetryEvents, feedbackEntries),
    [feedbackEntries, telemetryEvents],
  );
  const level5Summary = useMemo(
    () => summarizeLevel5(telemetryEvents, feedbackEntries),
    [feedbackEntries, telemetryEvents],
  );
  const userTargetWidth = `${level5Summary.userProgress}%`;
  const proofTargetWidth = `${level5Summary.proofProgress}%`;
  const readinessWidth = `${level5Summary.readinessScore}%`;
  const recentEvents = telemetryEvents.slice(0, 5);
  const feedbackInsights = useMemo(
    () => summarizeFeedbackInsights(feedbackEntries),
    [feedbackEntries],
  );
  const txProof = useMemo(
    () => normalizeTransactionProof(feedbackTxHash),
    [feedbackTxHash],
  );
  const txProofStatus = feedbackTxHash.trim()
    ? txProof.valid
      ? "Valid Testnet proof"
      : "Invalid proof"
    : "Proof required";
  const validationSteps = useMemo(
    () => [
      {
        label: "Wallet",
        done: connected,
      },
      {
        label: "On-chain write",
        done: telemetryEvents.some(
          (event) => event.status === "success" && event.name.startsWith("contract_"),
        ),
      },
      {
        label: "Feedback",
        done: level5Summary.namedFeedback > 0,
      },
      {
        label: "50 users",
        done: level5Summary.onboardedUsers >= level5Summary.targetUsers,
      },
      {
        label: "50 proofs",
        done: evidenceSummary.proofHashes >= level5Summary.targetUsers,
      },
    ],
    [
      connected,
      evidenceSummary.proofHashes,
      level5Summary.namedFeedback,
      level5Summary.onboardedUsers,
      level5Summary.targetUsers,
      telemetryEvents,
    ],
  );

  const recordEvent = useCallback(
    (input: Omit<TelemetryEvent, "id" | "createdAt">) => {
      const { event, events } = addTelemetryEvent({
        contractId: CONTRACT_ID,
        wallet: address || undefined,
        ...input,
      });
      setTelemetryEvents(events);
      void forwardTelemetryEvent(event).catch(() => undefined);
      return event;
    },
    [address],
  );

  useEffect(() => {
    const { event, events } = addTelemetryEvent({
      contractId: CONTRACT_ID,
      name: "session_started",
      label: "Session started",
      status: "info",
      details: "GrantPulse frontend opened",
    });
    setTelemetryEvents(events);
    void forwardTelemetryEvent(event).catch(() => undefined);

    return installRuntimeMonitoring(setTelemetryEvents);
  }, []);

  const ensureTestnet = useCallback(async () => {
    const networkDetails = await getNetworkDetails();
    if ("error" in networkDetails && networkDetails.error) {
      throw new Error(String(networkDetails.error));
    }
    if (networkDetails.networkPassphrase !== NETWORK_PASSPHRASE) {
      throw new Error("Please switch Freighter to Testnet and connect again.");
    }

    setNetwork(networkDetails.network ?? "TESTNET");
  }, []);

  const refreshBalance = useCallback(
    async (walletAddress = address) => {
      if (!walletAddress) {
        setXlmBalance("");
        return "";
      }

      const account = await horizonServer.loadAccount(walletAddress);
      const nativeBalance = account.balances.find(
        (balance) => balance.asset_type === "native",
      );

      if (!nativeBalance) {
        throw new Error("No native XLM balance found for this wallet.");
      }

      setXlmBalance(nativeBalance.balance);
      return nativeBalance.balance;
    },
    [address, horizonServer],
  );

  const refreshStats = useCallback(
    async (walletAddress = address) => {
      await ensureTestnet();

      const readClient = createGrantPulseClient(walletAddress);
      const totalTx = await readClient.get_total_grants();
      setTotalGrants(Number(totalTx.result));

      if (walletAddress) {
        const countTx = await readClient.get_grant_count({ owner: walletAddress });
        setGrantCount(Number(countTx.result));
      }
    },
    [address, ensureTestnet],
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
        await sleep(1600);
        await refreshStats(walletAddress);
      }

      await refreshBalance(walletAddress);
      setPaymentResult({
        status: "idle",
        message: "Wallet connected and ready for a testnet payment",
      });
      setStatus("Wallet connected");
      recordEvent({
        name: "wallet_connected",
        label: "Wallet connected",
        status: "success",
        wallet: walletAddress,
        details: "Freighter access granted on Stellar Testnet",
      });
    } catch (nextError) {
      const message = readError(nextError);
      setAddress("");
      setLookupOwner("");
      setXlmBalance("");
      setError(message);
      setStatus("Wallet connection failed");
      recordEvent({
        name: "wallet_connect_failed",
        label: "Wallet connect failed",
        status: "error",
        details: message,
      });
    } finally {
      setIsBusy(false);
    }
  }

  function disconnectWallet() {
    const previousAddress = address;
    setAddress("");
    setLookupOwner("");
    setGrantCount(0);
    setXlmBalance("");
    setPaymentResult({
      status: "idle",
      message: "Wallet disconnected",
    });
    setError("");
    setStatus("Wallet disconnected");
    recordEvent({
      name: "wallet_disconnected",
      label: "Wallet disconnected",
      status: "info",
      wallet: previousAddress || undefined,
    });
  }

  async function refreshWalletBalance() {
    if (!address) return;

    setIsBusy(true);
    setError("");
    setStatus("Refreshing XLM balance");

    try {
      await ensureTestnet();
      await refreshBalance(address);
      setStatus("XLM balance refreshed");
      recordEvent({
        name: "wallet_balance_refreshed",
        label: "Balance refreshed",
        status: "success",
      });
    } catch (nextError) {
      const message = readError(nextError);
      setError(message);
      setStatus("Balance refresh failed");
      recordEvent({
        name: "wallet_balance_refresh_failed",
        label: "Balance refresh failed",
        status: "error",
        details: message,
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function fundConnectedWallet() {
    if (!address) return;

    setIsBusy(true);
    setError("");
    setStatus("Requesting testnet XLM");

    try {
      await ensureTestnet();
      await fundTestnetAccount(address);
      await sleep(1600);
      await refreshBalance(address);
      await refreshStats(address);
      setStatus("Testnet wallet funded");
      recordEvent({
        name: "friendbot_funded",
        label: "Friendbot funded wallet",
        status: "success",
      });
    } catch (nextError) {
      const message = readError(nextError);
      setError(message);
      setStatus("Testnet funding failed");
      recordEvent({
        name: "friendbot_funding_failed",
        label: "Friendbot funding failed",
        status: "error",
        details: message,
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function sendXlmPayment() {
    if (!address) return;

    setIsBusy(true);
    setError("");
    setStatus("Preparing XLM transaction");

    try {
      await ensureTestnet();

      const destination = paymentDestination.trim();
      if (!StrKey.isValidEd25519PublicKey(destination)) {
        throw new Error("Enter a valid Stellar public key for the recipient.");
      }
      if (destination === address) {
        throw new Error("Use a different Testnet account as the recipient.");
      }

      const amount = normalizeXlmAmount(paymentAmount);
      const sourceAccount = await horizonServer.loadAccount(address);

      let recipientExists = true;
      try {
        await horizonServer.loadAccount(destination);
      } catch (lookupError) {
        if (!isAccountMissing(lookupError)) throw lookupError;
        recipientExists = false;
      }
      if (!recipientExists && Number(amount) < 1) {
        throw new Error("Send at least 1 XLM when the recipient account does not exist yet.");
      }

      const operation = recipientExists
        ? Operation.payment({
            destination,
            asset: Asset.native(),
            amount,
          })
        : Operation.createAccount({
            destination,
            startingBalance: amount,
          });
      const operationLabel = recipientExists ? "Payment sent" : "Account funded";
      const transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(operation)
        .setTimeout(180)
        .build();

      const signed = await signTransaction(transaction.toXDR(), {
        address,
        networkPassphrase: NETWORK_PASSPHRASE,
      });
      if ("error" in signed && signed.error) {
        throw new Error(String(signed.error));
      }

      const signedTransaction = TransactionBuilder.fromXDR(
        signed.signedTxXdr,
        NETWORK_PASSPHRASE,
      );
      const submitted = await horizonServer.submitTransaction(signedTransaction, {
        skipMemoRequiredCheck: true,
      });

      await refreshBalance(address);
      setPaymentResult({
        status: "success",
        message: `${operationLabel} on Stellar Testnet`,
        hash: submitted.hash,
        amount,
        destination,
        operation: operationLabel,
      });
      setStatus("XLM transaction succeeded");
      recordEvent({
        name: "wallet_payment_sent",
        label: operationLabel,
        status: "success",
        txHash: submitted.hash,
        details: `${amount} XLM to ${shortAddress(destination)}`,
      });
    } catch (nextError) {
      const message = readError(nextError);
      setError(message);
      setPaymentResult({
        status: "error",
        message,
      });
      setStatus("XLM transaction failed");
      recordEvent({
        name: "wallet_payment_failed",
        label: "XLM transaction failed",
        status: "error",
        details: message,
      });
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
      const txHash = extractTransactionHash(sent);

      setGrantCount(Number(sent.result));
      setLookupOwner(address);
      setLookupGrantId(cleanGrantId);
      await readGrant(address, cleanGrantId);
      await refreshStats(address);
      setStatus("Grant record created");
      recordEvent({
        name: "contract_create_grant",
        label: "Grant created",
        status: "success",
        grantId: cleanGrantId,
        txHash,
        details: `${title.trim() || "Untitled Grant"} requested ${numberValue(
          requestedAmount,
          1000,
        )}`,
      });
    } catch (nextError) {
      const message = readError(nextError);
      setError(message);
      setStatus("Grant could not be created");
      recordEvent({
        name: "contract_create_grant_failed",
        label: "Grant create failed",
        status: "error",
        grantId: grantId.trim() || "grant-untitled",
        details: message,
      });
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
      const savedMilestone = Number(sent.result);
      const txHash = extractTransactionHash(sent);

      if (savedMilestone === 0) {
        setStatus("No active grant found");
      } else {
        setStatus(`Milestone ${savedMilestone} saved`);
      }

      setLookupOwner(address);
      setLookupGrantId(cleanGrantId);
      await readGrant(address, cleanGrantId);
      recordEvent({
        name: "contract_complete_milestone",
        label: savedMilestone === 0 ? "Milestone skipped" : "Milestone saved",
        status: savedMilestone === 0 ? "info" : "success",
        grantId: cleanGrantId,
        txHash,
        details: nextStatus.trim() || "Milestone updated",
      });
    } catch (nextError) {
      const message = readError(nextError);
      setError(message);
      setStatus("Milestone could not be saved");
      recordEvent({
        name: "contract_complete_milestone_failed",
        label: "Milestone failed",
        status: "error",
        grantId: grantId.trim() || "grant-untitled",
        details: message,
      });
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
      const accepted = Boolean(sent.result);
      const txHash = extractTransactionHash(sent);

      setStatus(
        accepted
          ? approved
            ? "Reviewer approval saved"
            : "Reviewer rejection saved"
          : "Review was not accepted",
      );
      await readGrant(owner, id);
      recordEvent({
        name: approved ? "contract_review_approved" : "contract_review_rejected",
        label: accepted ? (approved ? "Review approved" : "Review rejected") : "Review skipped",
        status: accepted ? "success" : "info",
        grantId: id,
        txHash,
        details: `Owner ${shortAddress(owner)}`,
      });
    } catch (nextError) {
      const message = readError(nextError);
      setError(message);
      setStatus("Review could not be saved");
      recordEvent({
        name: "contract_review_failed",
        label: "Review failed",
        status: "error",
        grantId: id,
        details: message,
      });
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
      const archived = Boolean(sent.result);
      const txHash = extractTransactionHash(sent);

      setStatus(archived ? "Grant archived" : "No active grant found");
      setLookupOwner(address);
      setLookupGrantId(cleanGrantId);
      await readGrant(address, cleanGrantId);
      recordEvent({
        name: "contract_archive_grant",
        label: archived ? "Grant archived" : "Archive skipped",
        status: archived ? "success" : "info",
        grantId: cleanGrantId,
        txHash,
      });
    } catch (nextError) {
      const message = readError(nextError);
      setError(message);
      setStatus("Grant could not be archived");
      recordEvent({
        name: "contract_archive_grant_failed",
        label: "Archive failed",
        status: "error",
        grantId: grantId.trim() || "grant-untitled",
        details: message,
      });
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
      const message = readError(nextError);
      setError(message);
      setStatus("Grant lookup failed");
      recordEvent({
        name: "grant_lookup_failed",
        label: "Grant lookup failed",
        status: "error",
        grantId: id,
        details: message,
      });
    } finally {
      setIsBusy(false);
    }
  }

  async function submitFeedback() {
    const name = feedbackName.trim();
    const email = feedbackEmail.trim();
    const wallet = address || feedbackWallet.trim();
    const comment = feedbackComment.trim();
    if (!name) {
      setFeedbackStatus("Tester name is required");
      return;
    }
    if (!email) {
      setFeedbackStatus("Email is required");
      return;
    }
    if (!wallet) {
      setFeedbackStatus("Wallet address is required");
      return;
    }
    if (!StrKey.isValidEd25519PublicKey(wallet)) {
      setFeedbackStatus("Enter a valid Stellar wallet address");
      return;
    }
    if (!comment) {
      setFeedbackStatus("Feedback comment is required");
      return;
    }
    if (!txProof.valid) {
      setFeedbackStatus("Transaction hash or Stellar Expert Testnet URL is required");
      return;
    }

    setIsBusy(true);
    setError("");

    const rating = Math.min(10, Math.max(1, Number(feedbackRating) || 8));
    const { feedback, entries } = addFeedbackEntry({
      name,
      email,
      role: feedbackRole,
      rating,
      comment,
      blocker: feedbackBlocker.trim() || undefined,
      txHash: txProof.hash,
      txProofUrl: txProof.url,
      completedTransaction: true,
      wallet,
    });

    setFeedbackEntries(entries);
    setFeedbackName("");
    setFeedbackEmail("");
    setFeedbackWallet("");
    setFeedbackComment("");
    setFeedbackBlocker("");
    setFeedbackTxHash("");

    try {
      recordEvent({
        name: "feedback_submitted",
        label: "Feedback submitted",
        status: "success",
        txHash: txProof.hash,
        wallet,
        details: `${feedbackRole} rating ${rating}/10 from ${name}`,
      });
      const forwarded = await forwardFeedbackEntry(feedback);
      setFeedbackStatus(forwarded ? "Feedback sent" : "Feedback saved locally");
    } catch (nextError) {
      const message = readError(nextError);
      setError(message);
      setFeedbackStatus("Feedback saved locally; sync failed");
      recordEvent({
        name: "feedback_sync_failed",
        label: "Feedback sync failed",
        status: "error",
        details: message,
      });
    } finally {
      setIsBusy(false);
    }
  }

  function exportEvidence() {
    const payload = buildEvidenceBundle({
      contractId: CONTRACT_ID,
      explorerUrl,
      labUrl,
      liveDemoUrl,
      events: telemetryEvents,
      feedback: feedbackEntries,
    });
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grantpulse-level5-evidence-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    recordEvent({
      name: "evidence_exported",
      label: "Evidence exported",
      status: "success",
      details: `${telemetryEvents.length} events and ${feedbackEntries.length} feedback entries`,
    });
    setFeedbackStatus("Evidence exported");
  }

  function exportFeedbackCsv() {
    const payload = buildFeedbackCsv(feedbackEntries);
    const blob = new Blob([payload], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `grantpulse-level5-feedback-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    recordEvent({
      name: "level5_feedback_csv_exported",
      label: "Feedback CSV exported",
      status: "success",
      details: `${feedbackEntries.length} feedback entries`,
    });
    setFeedbackStatus("CSV exported");
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
          {connected ? (
            <>
              <button
                onClick={refreshWalletBalance}
                disabled={isBusy}
                title="Refresh XLM balance"
              >
                {isBusy ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
                <span>{walletLabel}</span>
              </button>
              <button onClick={disconnectWallet} disabled={isBusy} title="Disconnect wallet">
                <LogOut size={18} />
                <span>Disconnect</span>
              </button>
            </>
          ) : (
            <button onClick={connectWallet} disabled={isBusy} title="Connect wallet">
              {isBusy ? <Loader2 className="spin" size={18} /> : <Wallet size={18} />}
              <span>Connect</span>
            </button>
          )}
        </div>
      </header>

      <section className="scoreboard">
        <div>
          <span>Network</span>
          <strong>{network}</strong>
        </div>
        <div>
          <span>Wallet</span>
          <strong>{walletLabel}</strong>
        </div>
        <div>
          <span>XLM Balance</span>
          <strong>{balanceDisplay}</strong>
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

      <section className="panel walletPanel">
        <div className="panelTitle">
          <Wallet size={21} />
          <h2>Wallet Options</h2>
        </div>

        <div className="walletOptions">
          <button
            className={connected ? "walletOption connected" : "walletOption"}
            onClick={connected ? refreshWalletBalance : connectWallet}
            disabled={isBusy}
            title="Freighter wallet"
          >
            {isBusy ? <Loader2 className="spin" size={18} /> : <Wallet size={18} />}
            <strong>Freighter</strong>
            <span>{connected ? walletLabel : "Available"}</span>
            {connected ? <CheckCircle2 size={18} /> : <ExternalLink size={18} />}
          </button>
        </div>
      </section>

      <section className="panel paymentPanel">
        <div className="panelTitle">
          <Coins size={21} />
          <h2>Level 1 XLM Payment</h2>
        </div>

        <div className="paymentMeta">
          <div>
            <span>Connected Wallet</span>
            <strong>{walletLabel}</strong>
          </div>
          <div>
            <span>Available XLM</span>
            <strong>{balanceDisplay}</strong>
          </div>
        </div>

        <div className="paymentGrid">
          <label>
            <span>Recipient Testnet Address</span>
            <input
              value={paymentDestination}
              onChange={(event) => setPaymentDestination(event.target.value)}
              placeholder="G..."
            />
          </label>
          <label>
            <span>Amount XLM</span>
            <input
              inputMode="decimal"
              value={paymentAmount}
              onChange={(event) => setPaymentAmount(event.target.value)}
            />
          </label>
        </div>

        <div className="paymentActions">
          <button onClick={sendXlmPayment} disabled={!canWrite} title="Send testnet XLM">
            <Send size={18} />
            <span>Send XLM</span>
          </button>
          <button
            onClick={refreshWalletBalance}
            disabled={!connected || isBusy}
            title="Refresh XLM balance"
          >
            <RefreshCw size={18} />
            <span>Refresh Balance</span>
          </button>
          <button
            onClick={fundConnectedWallet}
            disabled={!connected || isBusy}
            title="Fund wallet with Friendbot"
          >
            <Coins size={18} />
            <span>Fund Testnet</span>
          </button>
        </div>

        <div className={`txResult ${paymentResult.status}`}>
          {paymentResult.status === "success" ? (
            <CheckCircle2 size={18} />
          ) : paymentResult.status === "error" ? (
            <XCircle size={18} />
          ) : (
            <Wallet size={18} />
          )}
          <div>
            <span>{paymentResult.operation ?? "Transaction Result"}</span>
            <strong>{paymentResult.message}</strong>
            {paymentResult.hash ? (
              <a href={txExplorerUrl} target="_blank" rel="noreferrer">
                {paymentResult.hash}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section className="level5Grid">
        <section className="panel validationPanel">
          <div className="panelTitle">
            <Target size={21} />
            <h2>Level 5 Growth Proof</h2>
          </div>

          <div className="metricStrip">
            <div>
              <span>Test Users</span>
              <strong>
                {level5Summary.onboardedUsers}/{level5Summary.targetUsers}
              </strong>
            </div>
            <div>
              <span>Tx Proofs</span>
              <strong>
                {evidenceSummary.proofHashes}/{level5Summary.targetUsers}
              </strong>
            </div>
            <div>
              <span>Usage</span>
              <strong>{level5Summary.activeUsageEvents}</strong>
            </div>
            <div>
              <span>Avg Rating</span>
              <strong>{level5Summary.averageRating}</strong>
            </div>
            <div>
              <span>Errors</span>
              <strong>{evidenceSummary.errorCount}</strong>
            </div>
          </div>

          <div className="targetStack">
            <div>
              <span>User onboarding</span>
              <strong>{level5Summary.userProgress}%</strong>
              <div className="targetTrack">
                <div style={{ width: userTargetWidth }} />
              </div>
            </div>
            <div>
              <span>Transaction proof</span>
              <strong>{level5Summary.proofProgress}%</strong>
              <div className="targetTrack">
                <div style={{ width: proofTargetWidth }} />
              </div>
            </div>
            <div>
              <span>Submission readiness</span>
              <strong>{level5Summary.readinessScore}%</strong>
              <div className="targetTrack readinessTrack">
                <div style={{ width: readinessWidth }} />
              </div>
            </div>
          </div>

          <div className="readinessGrid">
            <div>
              <span>Users Left</span>
              <strong>{level5Summary.usersRemaining}</strong>
            </div>
            <div>
              <span>Proofs Left</span>
              <strong>{level5Summary.proofsRemaining}</strong>
            </div>
            <div>
              <span>Valid Wallets</span>
              <strong>{level5Summary.validWallets}</strong>
            </div>
            <div>
              <span>Verified Rows</span>
              <strong>{level5Summary.verifiedFeedback}</strong>
            </div>
          </div>

          <div className="launchList">
            {validationSteps.map((step) => (
              <div className={step.done ? "done" : ""} key={step.label}>
                {step.done ? <CheckCircle2 size={17} /> : <Activity size={17} />}
                <span>{step.label}</span>
              </div>
            ))}
          </div>

          <div className="eventList">
            <div className="eventListHeader">
              <Activity size={17} />
              <span>
                Analytics {evidenceSummary.analyticsMode} / Feedback{" "}
                {evidenceSummary.feedbackMode}
              </span>
            </div>
            {recentEvents.length ? (
              recentEvents.map((event) => (
                <div className={`eventRow ${event.status}`} key={event.id}>
                  <span>{new Date(event.createdAt).toLocaleTimeString("en")}</span>
                  <strong>{event.label}</strong>
                  <em>{event.txHash ? shortAddress(event.txHash) : event.grantId || "-"}</em>
                </div>
              ))
            ) : (
              <div className="eventRow">
                <span>-</span>
                <strong>No events yet</strong>
                <em>-</em>
              </div>
            )}
          </div>
        </section>

        <section className="panel feedbackPanel">
          <div className="panelTitle">
            <UserPlus size={21} />
            <h2>User Onboarding Feedback</h2>
          </div>

          <div className="fieldGrid">
            <label>
              <span>Name</span>
              <input
                value={feedbackName}
                onChange={(event) => setFeedbackName(event.target.value)}
                placeholder="Tester name"
              />
            </label>
            <label>
              <span>Email</span>
              <input
                type="email"
                value={feedbackEmail}
                onChange={(event) => setFeedbackEmail(event.target.value)}
                placeholder="tester@example.com"
              />
            </label>
          </div>

          <label>
            <span>Wallet Address</span>
            <input
              disabled={connected}
              value={connected ? address : feedbackWallet}
              onChange={(event) => setFeedbackWallet(event.target.value)}
              placeholder="G..."
            />
          </label>

          <div className="fieldGrid">
            <label>
              <span>Role</span>
              <select value={feedbackRole} onChange={(event) => setFeedbackRole(event.target.value)}>
                <option>Builder</option>
                <option>Reviewer</option>
                <option>Founder</option>
                <option>Tester</option>
              </select>
            </label>
            <label>
              <span>Rating {feedbackRating}/10</span>
              <input
                max="10"
                min="1"
                type="range"
                value={feedbackRating}
                onChange={(event) => setFeedbackRating(event.target.value)}
              />
            </label>
          </div>

          <label>
            <span>Feedback</span>
            <textarea
              value={feedbackComment}
              onChange={(event) => setFeedbackComment(event.target.value)}
              placeholder="What worked, what felt unclear, what should change?"
            />
          </label>

          <label>
            <span>Blocker</span>
            <input
              value={feedbackBlocker}
              onChange={(event) => setFeedbackBlocker(event.target.value)}
              placeholder="Optional"
            />
          </label>

          <label>
            <span>Wallet Tx Hash Or URL</span>
            <input
              value={feedbackTxHash}
              onChange={(event) => setFeedbackTxHash(event.target.value)}
              placeholder="Hash or Stellar Expert Testnet URL"
            />
          </label>

          <div className={txProof.valid ? "proofHint valid" : "proofHint"}>
            {txProof.valid ? <CheckCircle2 size={17} /> : <ShieldCheck size={17} />}
            <span>{txProofStatus}</span>
          </div>

          <div className="feedbackActions">
            <button onClick={submitFeedback} disabled={isBusy} title="Submit feedback">
              {isBusy ? <Loader2 className="spin" size={18} /> : <MessageSquare size={18} />}
              <span>Submit</span>
            </button>
            <button onClick={exportFeedbackCsv} title="Export feedback CSV">
              <FileSpreadsheet size={18} />
              <span>Export CSV</span>
            </button>
            <button onClick={exportEvidence} title="Export evidence JSON">
              <Download size={18} />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="feedbackSummary">
            <div>
              <Users size={17} />
              <span>{level5Summary.namedFeedback} named entries</span>
            </div>
            <div>
              <Star size={17} />
              <span>{feedbackEntries.length} ratings / {feedbackStatus}</span>
            </div>
            <div>
              <FileSpreadsheet size={17} />
              <span>{level5Summary.verifiedFeedback} feedback rows with tx hash</span>
            </div>
            <div>
              <Target size={17} />
              <span>{feedbackInsights.topRole} top tester role</span>
            </div>
            <div>
              <XCircle size={17} />
              <span>{feedbackInsights.followUps} follow-up rows</span>
            </div>
            <div>
              <Star size={17} />
              <span>{feedbackInsights.promoters} high ratings / {feedbackInsights.lowRatings} low</span>
            </div>
            <div>
              <ClipboardCheck size={17} />
              <span>{evidenceSummary.latestEvent}</span>
            </div>
            <div>
              <MessageSquare size={17} />
              <span>{feedbackInsights.latestBlocker}</span>
            </div>
          </div>
        </section>
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
