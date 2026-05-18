import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDNCS5MQUHT2XAOITMC74U7SKKDHQ4WJMEDNLLKFSMESSOK3SSNNFMWV",
  }
} as const


export interface Grant {
  active: boolean;
  approvals: u32;
  completed_milestones: u32;
  created_at: u64;
  grant_id: string;
  milestone_count: u32;
  owner: string;
  rejections: u32;
  requested_amount: u32;
  status: string;
  title: string;
  updated_at: u64;
}

export type DataKey = {tag: "Grant", values: readonly [string, string]} | {tag: "Review", values: readonly [string, string, string]} | {tag: "GrantCount", values: readonly [string]} | {tag: "TotalGrants", values: void};

export interface Client {
  /**
   * Construct and simulate a get_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_grant: ({owner, grant_id}: {owner: string, grant_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<Grant>>

  /**
   * Construct and simulate a create_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_grant: ({owner, grant_id, title, requested_amount, milestone_count}: {owner: string, grant_id: string, title: string, requested_amount: u32, milestone_count: u32}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_progress transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_progress: ({owner, grant_id}: {owner: string, grant_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a review_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  review_grant: ({reviewer, owner, grant_id, approved}: {reviewer: string, owner: string, grant_id: string, approved: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a archive_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  archive_grant: ({owner, grant_id}: {owner: string, grant_id: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_grant_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_grant_count: ({owner}: {owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_total_grants transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_total_grants: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a complete_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  complete_milestone: ({owner, grant_id, status}: {owner: string, grant_id: string, status: string}, options?: MethodOptions) => Promise<AssembledTransaction<u32>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABUdyYW50AAAAAAAADAAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAAAlhcHByb3ZhbHMAAAAAAAAEAAAAAAAAABRjb21wbGV0ZWRfbWlsZXN0b25lcwAAAAQAAAAAAAAACmNyZWF0ZWRfYXQAAAAAAAYAAAAAAAAACGdyYW50X2lkAAAAEAAAAAAAAAAPbWlsZXN0b25lX2NvdW50AAAAAAQAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAKcmVqZWN0aW9ucwAAAAAABAAAAAAAAAAQcmVxdWVzdGVkX2Ftb3VudAAAAAQAAAAAAAAABnN0YXR1cwAAAAAAEAAAAAAAAAAFdGl0bGUAAAAAAAAQAAAAAAAAAAp1cGRhdGVkX2F0AAAAAAAG",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAEAAAAAAAAABUdyYW50AAAAAAAAAgAAABMAAAAQAAAAAQAAAAAAAAAGUmV2aWV3AAAAAAADAAAAEwAAABAAAAATAAAAAQAAAAAAAAAKR3JhbnRDb3VudAAAAAAAAQAAABMAAAAAAAAAAAAAAAtUb3RhbEdyYW50cwA=",
        "AAAAAAAAAAAAAAAJZ2V0X2dyYW50AAAAAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAhncmFudF9pZAAAABAAAAABAAAH0AAAAAVHcmFudAAAAA==",
        "AAAAAAAAAAAAAAAMY3JlYXRlX2dyYW50AAAABQAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAhncmFudF9pZAAAABAAAAAAAAAABXRpdGxlAAAAAAAAEAAAAAAAAAAQcmVxdWVzdGVkX2Ftb3VudAAAAAQAAAAAAAAAD21pbGVzdG9uZV9jb3VudAAAAAAEAAAAAQAAAAQ=",
        "AAAAAAAAAAAAAAAMZ2V0X3Byb2dyZXNzAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAhncmFudF9pZAAAABAAAAABAAAABA==",
        "AAAAAAAAAAAAAAAMcmV2aWV3X2dyYW50AAAABAAAAAAAAAAIcmV2aWV3ZXIAAAATAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACGdyYW50X2lkAAAAEAAAAAAAAAAIYXBwcm92ZWQAAAABAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAANYXJjaGl2ZV9ncmFudAAAAAAAAAIAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAIZ3JhbnRfaWQAAAAQAAAAAQAAAAE=",
        "AAAAAAAAAAAAAAAPZ2V0X2dyYW50X2NvdW50AAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAAE",
        "AAAAAAAAAAAAAAAQZ2V0X3RvdGFsX2dyYW50cwAAAAAAAAABAAAABA==",
        "AAAAAAAAAAAAAAASY29tcGxldGVfbWlsZXN0b25lAAAAAAADAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACGdyYW50X2lkAAAAEAAAAAAAAAAGc3RhdHVzAAAAAAAQAAAAAQAAAAQ=" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_grant: this.txFromJSON<Grant>,
        create_grant: this.txFromJSON<u32>,
        get_progress: this.txFromJSON<u32>,
        review_grant: this.txFromJSON<boolean>,
        archive_grant: this.txFromJSON<boolean>,
        get_grant_count: this.txFromJSON<u32>,
        get_total_grants: this.txFromJSON<u32>,
        complete_milestone: this.txFromJSON<u32>
  }
}