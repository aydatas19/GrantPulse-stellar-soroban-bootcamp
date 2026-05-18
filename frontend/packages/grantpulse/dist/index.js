import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAQAAAAAAAAAAAAAABUdyYW50AAAAAAAADAAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAAAlhcHByb3ZhbHMAAAAAAAAEAAAAAAAAABRjb21wbGV0ZWRfbWlsZXN0b25lcwAAAAQAAAAAAAAACmNyZWF0ZWRfYXQAAAAAAAYAAAAAAAAACGdyYW50X2lkAAAAEAAAAAAAAAAPbWlsZXN0b25lX2NvdW50AAAAAAQAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAKcmVqZWN0aW9ucwAAAAAABAAAAAAAAAAQcmVxdWVzdGVkX2Ftb3VudAAAAAQAAAAAAAAABnN0YXR1cwAAAAAAEAAAAAAAAAAFdGl0bGUAAAAAAAAQAAAAAAAAAAp1cGRhdGVkX2F0AAAAAAAG",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAEAAAAAAAAABUdyYW50AAAAAAAAAgAAABMAAAAQAAAAAQAAAAAAAAAGUmV2aWV3AAAAAAADAAAAEwAAABAAAAATAAAAAQAAAAAAAAAKR3JhbnRDb3VudAAAAAAAAQAAABMAAAAAAAAAAAAAAAtUb3RhbEdyYW50cwA=",
            "AAAAAAAAAAAAAAAJZ2V0X2dyYW50AAAAAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAhncmFudF9pZAAAABAAAAABAAAH0AAAAAVHcmFudAAAAA==",
            "AAAAAAAAAAAAAAAMY3JlYXRlX2dyYW50AAAABQAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAhncmFudF9pZAAAABAAAAAAAAAABXRpdGxlAAAAAAAAEAAAAAAAAAAQcmVxdWVzdGVkX2Ftb3VudAAAAAQAAAAAAAAAD21pbGVzdG9uZV9jb3VudAAAAAAEAAAAAQAAAAQ=",
            "AAAAAAAAAAAAAAAMZ2V0X3Byb2dyZXNzAAAAAgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAAAAAAhncmFudF9pZAAAABAAAAABAAAABA==",
            "AAAAAAAAAAAAAAAMcmV2aWV3X2dyYW50AAAABAAAAAAAAAAIcmV2aWV3ZXIAAAATAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACGdyYW50X2lkAAAAEAAAAAAAAAAIYXBwcm92ZWQAAAABAAAAAQAAAAE=",
            "AAAAAAAAAAAAAAANYXJjaGl2ZV9ncmFudAAAAAAAAAIAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAIZ3JhbnRfaWQAAAAQAAAAAQAAAAE=",
            "AAAAAAAAAAAAAAAPZ2V0X2dyYW50X2NvdW50AAAAAAEAAAAAAAAABW93bmVyAAAAAAAAEwAAAAEAAAAE",
            "AAAAAAAAAAAAAAAQZ2V0X3RvdGFsX2dyYW50cwAAAAAAAAABAAAABA==",
            "AAAAAAAAAAAAAAASY29tcGxldGVfbWlsZXN0b25lAAAAAAADAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAACGdyYW50X2lkAAAAEAAAAAAAAAAGc3RhdHVzAAAAAAAQAAAAAQAAAAQ="]), options);
        this.options = options;
    }
    fromJSON = {
        get_grant: (this.txFromJSON),
        create_grant: (this.txFromJSON),
        get_progress: (this.txFromJSON),
        review_grant: (this.txFromJSON),
        archive_grant: (this.txFromJSON),
        get_grant_count: (this.txFromJSON),
        get_total_grants: (this.txFromJSON),
        complete_milestone: (this.txFromJSON)
    };
}
