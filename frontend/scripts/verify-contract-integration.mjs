import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(frontendRoot, path), "utf8");

const app = read("src/App.tsx");
const contractClient = read("src/lib/grantpulse.ts");
const generatedBinding = read("packages/grantpulse/src/index.ts");
const packageJson = JSON.parse(read("package.json"));
const generatedPackageJson = JSON.parse(read("packages/grantpulse/package.json"));

const failures = [];
const check = (label, ok) => {
  if (!ok) failures.push(label);
};
const includesAll = (source, values) => values.every((value) => source.includes(value));

check(
  "frontend package depends on @stellar/stellar-sdk",
  Boolean(packageJson.dependencies?.["@stellar/stellar-sdk"]),
);
check(
  "generated binding package depends on @stellar/stellar-sdk",
  Boolean(generatedPackageJson.dependencies?.["@stellar/stellar-sdk"]),
);
check(
  "frontend package uses the generated grantpulse binding as a local dependency",
  packageJson.dependencies?.grantpulse === "file:packages/grantpulse",
);
check(
  "contract client imports generated GrantPulse binding",
  contractClient.includes('import * as GrantPulse from "grantpulse";'),
);
check(
  "contract client wires Freighter signing into generated client",
  includesAll(contractClient, [
    "signTransaction",
    "new GrantPulse.Client",
    "NETWORK_PASSPHRASE",
    "publicKey",
  ]),
);
check(
  "generated binding exports deployed testnet contract ID",
  includesAll(generatedBinding, [
    "networks",
    "testnet",
    "CDNCS5MQUHT2XAOITMC74U7SKKDHQ4WJMEDNLLKFSMESSOK3SSNNFMWV",
  ]),
);

const contractMethods = {
  create_grant: "client.create_grant",
  complete_milestone: "client.complete_milestone",
  review_grant: "client.review_grant",
  archive_grant: "client.archive_grant",
  get_grant: "readClient.get_grant",
  get_progress: "readClient.get_progress",
  get_grant_count: "readClient.get_grant_count",
  get_total_grants: "readClient.get_total_grants",
};

for (const [method, appReference] of Object.entries(contractMethods)) {
  check(`generated binding exposes ${method}`, generatedBinding.includes(`${method}:`));
  check(`React UI calls ${method}`, app.includes(appReference));
}

check(
  "React UI uses Stellar SDK payment and account primitives",
  includesAll(app, [
    "Horizon.Server",
    "TransactionBuilder",
    "Operation.payment",
    "Operation.createAccount",
    "Asset.native()",
    "StrKey.isValidEd25519PublicKey",
    "submitTransaction",
  ]),
);
check(
  "React UI records wallet and contract transaction hashes for evidence export",
  includesAll(app, [
    "extractTransactionHash",
    "wallet_payment_sent",
    "contract_create_grant",
    "contract_complete_milestone",
    "contract_review_approved",
    "contract_archive_grant",
  ]),
);

if (failures.length) {
  console.error("GrantPulse integration verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `GrantPulse integration verification passed: ${Object.keys(contractMethods).length} contract methods, generated binding, Freighter signing, Stellar SDK payment flow, and evidence telemetry are wired.`,
);
