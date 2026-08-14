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
  role: string;
  rating: number;
  comment: string;
  wallet?: string;
  blocker?: string;
  txHash?: string;
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

const TELEMETRY_KEY = "grantpulse.level4.telemetry";
const FEEDBACK_KEY = "grantpulse.level4.feedback";
const EVENT_LIMIT = 120;
const FEEDBACK_LIMIT = 60;

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
  const proofHashes = events.filter((event) => event.txHash).length;
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

  return JSON.stringify(
    {
      project: "GrantPulse Stellar Level 4 Evidence",
      generatedAt: new Date().toISOString(),
      liveDemoUrl: input.liveDemoUrl,
      contractId: input.contractId,
      explorerUrl: input.explorerUrl,
      labUrl: input.labUrl,
      summary,
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
