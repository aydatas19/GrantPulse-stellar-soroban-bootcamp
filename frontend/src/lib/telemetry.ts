export type TelemetryStatus = "info" | "success" | "error";

export type TelemetryEvent = {
  id: string;
  createdAt: string;
  name: string;
  label: string;
  status: TelemetryStatus;
  wallet?: string;
  txHash?: string;
  grantId?: string;
  contractId?: string;
  details?: string;
};

export type FeedbackEntry = {
  id: string;
  createdAt: string;
  name?: string;
  email?: string;
  role: string;
  rating: number;
  comment: string;
  wallet?: string;
  blocker?: string;
  txHash?: string;
  txProofUrl?: string;
  completedTransaction?: boolean;
};

export type EvidenceSummary = {
  sessions: number;
  uniqueWallets: number;
  walletInteractions: number;
  proofHashes: number;
  feedbackCount: number;
  errorCount: number;
  latestEvent: string;
  analyticsMode: string;
  feedbackMode: string;
};

export type Level5GrowthSummary = {
  targetUsers: number;
  onboardedUsers: number;
  userProgress: number;
  activeUsageEvents: number;
  proofProgress: number;
  readinessScore: number;
  verifiedFeedback: number;
  namedFeedback: number;
  validWallets: number;
  validProofs: number;
  usersRemaining: number;
  proofsRemaining: number;
  averageRating: string;
};

export type FeedbackInsights = {
  topRole: string;
  blockers: number;
  lowRatings: number;
  promoters: number;
  followUps: number;
  latestBlocker: string;
};

export type TransactionProof = {
  raw: string;
  hash: string;
  url: string;
  valid: boolean;
};

const TELEMETRY_KEY = "grantpulse.level5.telemetry";
const FEEDBACK_KEY = "grantpulse.level5.feedback";
const EVENT_LIMIT = 400;
const FEEDBACK_LIMIT = 150;
const LEVEL5_USER_TARGET = 50;
const TESTNET_TX_URL = "https://stellar.expert/explorer/testnet/tx";
const WALLET_PATTERN = /^G[A-Z2-7]{55}$/;
const TX_HASH_PATTERN = /^[a-f0-9]{64}$/i;
const STELLAR_EXPERT_TX_PATTERN = /stellar\.expert\/explorer\/testnet\/tx\/([a-f0-9]{64})/i;

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function id() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  return safeParse<T[]>(window.localStorage.getItem(key), []);
}

function writeList<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function readReason(reason: unknown) {
  if (reason instanceof Error) return reason.message;
  if (typeof reason === "string") return reason;

  try {
    return JSON.stringify(reason);
  } catch {
    return "Unknown runtime failure";
  }
}

function configuredEndpoint(name: "VITE_ANALYTICS_ENDPOINT" | "VITE_FEEDBACK_ENDPOINT") {
  const value = import.meta.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

export function normalizeTransactionProof(value: string | undefined): TransactionProof {
  const raw = value?.trim() ?? "";
  const urlMatch = raw.match(STELLAR_EXPERT_TX_PATTERN);
  const hash = urlMatch?.[1] ?? (TX_HASH_PATTERN.test(raw) ? raw : "");
  const normalizedHash = hash.toLowerCase();

  return {
    raw,
    hash: normalizedHash,
    url: normalizedHash ? `${TESTNET_TX_URL}/${normalizedHash}` : "",
    valid: Boolean(normalizedHash),
  };
}

function validWallet(value: string | undefined) {
  return Boolean(value && WALLET_PATTERN.test(value));
}

function collectProofHashes(events: TelemetryEvent[], feedback: FeedbackEntry[]) {
  return new Set(
    [
      ...events.map((event) => normalizeTransactionProof(event.txHash).hash),
      ...feedback.map((entry) => normalizeTransactionProof(entry.txHash).hash),
    ].filter(Boolean),
  );
}

export function readTelemetryEvents() {
  return readList<TelemetryEvent>(TELEMETRY_KEY);
}

export function readFeedbackEntries() {
  return readList<FeedbackEntry>(FEEDBACK_KEY);
}

export function addTelemetryEvent(input: Omit<TelemetryEvent, "id" | "createdAt">) {
  const event: TelemetryEvent = {
    id: id(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  const events = [event, ...readTelemetryEvents()].slice(0, EVENT_LIMIT);
  writeList(TELEMETRY_KEY, events);
  return { event, events };
}

export function addFeedbackEntry(input: Omit<FeedbackEntry, "id" | "createdAt">) {
  const feedback: FeedbackEntry = {
    id: id(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  const entries = [feedback, ...readFeedbackEntries()].slice(0, FEEDBACK_LIMIT);
  writeList(FEEDBACK_KEY, entries);
  return { feedback, entries };
}

export async function forwardTelemetryEvent(event: TelemetryEvent) {
  const endpoint = configuredEndpoint("VITE_ANALYTICS_ENDPOINT");
  if (!endpoint) return false;

  const payload = JSON.stringify({
    source: "grantpulse",
    event,
  });

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const sent = navigator.sendBeacon(
      endpoint,
      new Blob([payload], { type: "application/json" }),
    );
    if (sent) return true;
  }

  await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: payload,
    keepalive: true,
  });
  return true;
}

export async function forwardFeedbackEntry(feedback: FeedbackEntry) {
  const endpoint = configuredEndpoint("VITE_FEEDBACK_ENDPOINT");
  if (!endpoint) return false;

  await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      source: "grantpulse",
      feedback,
    }),
  });
  return true;
}

export function summarizeEvidence(
  events: TelemetryEvent[],
  feedback: FeedbackEntry[],
): EvidenceSummary {
  const wallets = new Set(
    [...events.map((event) => event.wallet), ...feedback.map((entry) => entry.wallet)].filter(
      Boolean,
    ),
  );
  const walletInteractions = events.filter((event) => {
    if (event.status !== "success") return false;
    return (
      event.name.startsWith("wallet_") ||
      event.name.startsWith("contract_") ||
      event.name === "friendbot_funded"
    );
  }).length;
  const proofHashes = collectProofHashes(events, feedback).size;
  const errorCount = events.filter((event) => event.status === "error").length;
  const sessions = events.filter((event) => event.name === "session_started").length;
  const latestEvent = events[0]
    ? `${events[0].label} - ${new Date(events[0].createdAt).toLocaleString("en")}`
    : "No events yet";

  return {
    sessions,
    uniqueWallets: wallets.size,
    walletInteractions,
    proofHashes,
    feedbackCount: feedback.length,
    errorCount,
    latestEvent,
    analyticsMode: configuredEndpoint("VITE_ANALYTICS_ENDPOINT") ? "Endpoint" : "Local",
    feedbackMode: configuredEndpoint("VITE_FEEDBACK_ENDPOINT") ? "Endpoint" : "Local",
  };
}

export function summarizeLevel5(
  events: TelemetryEvent[],
  feedback: FeedbackEntry[],
): Level5GrowthSummary {
  const feedbackUsers = new Set(
    feedback
      .map((entry) => entry.email || entry.wallet || entry.name)
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase()),
  );
  const eventWallets = new Set(events.map((event) => event.wallet).filter(Boolean));
  const onboardedUsers = Math.max(feedbackUsers.size, eventWallets.size);
  const activeUsageEvents = events.filter((event) => {
    if (event.status !== "success") return false;
    return (
      event.name === "wallet_payment_sent" ||
      event.name === "friendbot_funded" ||
      event.name.startsWith("contract_")
    );
  }).length;
  const proofHashes = collectProofHashes(events, feedback).size;
  const validWallets = new Set(
    feedback.map((entry) => entry.wallet).filter((wallet) => validWallet(wallet)),
  ).size;
  const validProofs = feedback.filter((entry) => normalizeTransactionProof(entry.txHash).valid).length;
  const ratings = feedback
    .map((entry) => entry.rating)
    .filter((rating) => Number.isFinite(rating));
  const averageRating = ratings.length
    ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
    : "-";
  const userProgress = Math.min(100, Math.round((onboardedUsers / LEVEL5_USER_TARGET) * 100));
  const proofProgress = Math.min(100, Math.round((proofHashes / LEVEL5_USER_TARGET) * 100));
  const readinessScore = Math.round((userProgress + proofProgress) / 2);

  return {
    targetUsers: LEVEL5_USER_TARGET,
    onboardedUsers,
    userProgress,
    activeUsageEvents,
    proofProgress,
    readinessScore,
    verifiedFeedback: feedback.filter(
      (entry) => validWallet(entry.wallet) && normalizeTransactionProof(entry.txHash).valid,
    ).length,
    namedFeedback: feedback.filter((entry) => entry.name && entry.email).length,
    validWallets,
    validProofs,
    usersRemaining: Math.max(0, LEVEL5_USER_TARGET - onboardedUsers),
    proofsRemaining: Math.max(0, LEVEL5_USER_TARGET - proofHashes),
    averageRating,
  };
}

export function summarizeFeedbackInsights(feedback: FeedbackEntry[]): FeedbackInsights {
  const roleCounts = feedback.reduce<Record<string, number>>((counts, entry) => {
    counts[entry.role] = (counts[entry.role] ?? 0) + 1;
    return counts;
  }, {});
  const topRole =
    Object.entries(roleCounts).sort(([, left], [, right]) => right - left)[0]?.[0] ?? "-";
  const blockers = feedback.filter((entry) => entry.blocker?.trim()).length;
  const lowRatings = feedback.filter((entry) => entry.rating <= 6).length;
  const promoters = feedback.filter((entry) => entry.rating >= 9).length;
  const followUps = feedback.filter((entry) => entry.rating <= 6 || entry.blocker?.trim()).length;
  const latestBlocker =
    feedback.find((entry) => entry.blocker?.trim())?.blocker?.trim() ?? "No blockers logged";

  return {
    topRole,
    blockers,
    lowRatings,
    promoters,
    followUps,
    latestBlocker,
  };
}

function csvValue(value: unknown) {
  const text = value === undefined || value === null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildFeedbackCsv(feedback: FeedbackEntry[]) {
  const headers = [
    "submitted_at",
    "name",
    "email",
    "wallet_address",
    "role",
    "completed_testnet_transaction",
    "transaction_hash_or_url",
    "rating",
    "worked_well",
    "confusing_or_risky",
    "next_improvement",
    "anonymous_feedback_permission",
    "transaction_hash",
    "stellar_expert_url",
  ];
  const rows = feedback.map((entry) => {
    const proof = normalizeTransactionProof(entry.txHash);

    return [
      entry.createdAt,
      entry.name ?? "",
      entry.email ?? "",
      entry.wallet ?? "",
      entry.role,
      entry.completedTransaction === false ? "No" : "Yes",
      entry.txProofUrl || proof.raw || proof.url,
      entry.rating,
      entry.comment,
      entry.blocker ?? "",
      "",
      "Yes",
      proof.hash,
      proof.url,
    ];
  });

  return [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");
}

export function extractTransactionHash(sent: unknown) {
  if (!sent || typeof sent !== "object") return "";

  const candidates = [
    (sent as { sendTransactionResponse?: { hash?: string } }).sendTransactionResponse?.hash,
    (sent as { getTransactionResponse?: { txHash?: string; hash?: string } }).getTransactionResponse
      ?.txHash,
    (sent as { getTransactionResponse?: { txHash?: string; hash?: string } }).getTransactionResponse
      ?.hash,
  ];

  return candidates.find((candidate) => typeof candidate === "string" && candidate) ?? "";
}

export function buildEvidenceBundle(input: {
  contractId: string;
  explorerUrl: string;
  labUrl: string;
  liveDemoUrl: string;
  events: TelemetryEvent[];
  feedback: FeedbackEntry[];
}) {
  const summary = summarizeEvidence(input.events, input.feedback);
  const level5 = summarizeLevel5(input.events, input.feedback);

  return JSON.stringify(
    {
      project: "GrantPulse Stellar Level 5 Evidence",
      generatedAt: new Date().toISOString(),
      liveDemoUrl: input.liveDemoUrl,
      contractId: input.contractId,
      explorerUrl: input.explorerUrl,
      labUrl: input.labUrl,
      summary,
      level5,
      feedbackInsights: summarizeFeedbackInsights(input.feedback),
      events: input.events,
      feedback: input.feedback,
    },
    null,
    2,
  );
}

export function installRuntimeMonitoring(onChange: (events: TelemetryEvent[]) => void) {
  if (typeof window === "undefined") return () => undefined;

  const record = (label: string, details: string) => {
    const { event, events } = addTelemetryEvent({
      name: "runtime_error",
      label,
      status: "error",
      details,
    });
    void forwardTelemetryEvent(event);
    onChange(events);
  };

  const handleError = (event: ErrorEvent) => {
    record("Runtime error", event.message || "Unknown browser error");
  };
  const handleRejection = (event: PromiseRejectionEvent) => {
    record("Unhandled promise rejection", readReason(event.reason));
  };

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleRejection);

  return () => {
    window.removeEventListener("error", handleError);
    window.removeEventListener("unhandledrejection", handleRejection);
  };
}
