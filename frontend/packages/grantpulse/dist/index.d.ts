import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from "@stellar/stellar-sdk/contract";
import type { u32, u64 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CDNCS5MQUHT2XAOITMC74U7SKKDHQ4WJMEDNLLKFSMESSOK3SSNNFMWV";
    };
};
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
export type DataKey = {
    tag: "Grant";
    values: readonly [string, string];
} | {
    tag: "Review";
    values: readonly [string, string, string];
} | {
    tag: "GrantCount";
    values: readonly [string];
} | {
    tag: "TotalGrants";
    values: void;
};
export interface Client {
    /**
     * Construct and simulate a get_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_grant: ({ owner, grant_id }: {
        owner: string;
        grant_id: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Grant>>;
    /**
     * Construct and simulate a create_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    create_grant: ({ owner, grant_id, title, requested_amount, milestone_count }: {
        owner: string;
        grant_id: string;
        title: string;
        requested_amount: u32;
        milestone_count: u32;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a get_progress transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_progress: ({ owner, grant_id }: {
        owner: string;
        grant_id: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a review_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    review_grant: ({ reviewer, owner, grant_id, approved }: {
        reviewer: string;
        owner: string;
        grant_id: string;
        approved: boolean;
    }, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>;
    /**
     * Construct and simulate a archive_grant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    archive_grant: ({ owner, grant_id }: {
        owner: string;
        grant_id: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>;
    /**
     * Construct and simulate a get_grant_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_grant_count: ({ owner }: {
        owner: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a get_total_grants transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_total_grants: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
    /**
     * Construct and simulate a complete_milestone transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    complete_milestone: ({ owner, grant_id, status }: {
        owner: string;
        grant_id: string;
        status: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u32>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        get_grant: (json: string) => AssembledTransaction<Grant>;
        create_grant: (json: string) => AssembledTransaction<number>;
        get_progress: (json: string) => AssembledTransaction<number>;
        review_grant: (json: string) => AssembledTransaction<boolean>;
        archive_grant: (json: string) => AssembledTransaction<boolean>;
        get_grant_count: (json: string) => AssembledTransaction<number>;
        get_total_grants: (json: string) => AssembledTransaction<number>;
        complete_milestone: (json: string) => AssembledTransaction<number>;
    };
}
