/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  readonly VITE_FEEDBACK_ENDPOINT?: string;
  readonly VITE_HORIZON_URL?: string;
  readonly VITE_SOROBAN_RPC_URL?: string;
}
