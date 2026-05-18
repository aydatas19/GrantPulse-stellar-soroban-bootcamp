import { signTransaction } from "@stellar/freighter-api";
import * as GrantPulse from "grantpulse";

export type Grant = GrantPulse.Grant;

export const RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";

export const CONTRACT_ID = GrantPulse.networks.testnet.contractId;
export const NETWORK_PASSPHRASE = GrantPulse.networks.testnet.networkPassphrase;

export function createGrantPulseClient(publicKey?: string) {
  return new GrantPulse.Client({
    ...GrantPulse.networks.testnet,
    rpcUrl: RPC_URL,
    publicKey,
    signTransaction: (
      xdr: string,
      options?: { networkPassphrase?: string; address?: string },
    ) =>
      signTransaction(xdr, {
        ...options,
        address: publicKey,
        networkPassphrase: NETWORK_PASSPHRASE,
      }),
  });
}

