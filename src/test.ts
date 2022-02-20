import { getForeignAssetSolana, CHAIN_ID_ETH, hexToUint8Array, nativeToHexString, approveEth, transferFromEth, CHAIN_ID_SOLANA, parseSequenceFromLogEth, getEmitterAddressEth, getSignedVAAWithRetry, postVaaSolana, getIsTransferCompletedSolana, redeemOnSolana } from "@certusone/wormhole-sdk";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Transaction, ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ETH_TOKEN_BRIDGE_ADDRESS } from "./utils";

const solanaSend = async () => {
// create a keypair for Solana
const connection = new Connection(SOLANA_HOST, "confirmed");
const keypair = Keypair.fromSecretKey(SOLANA_PRIVATE_KEY);
const payerAddress = keypair.publicKey.toString();
// determine destination address - an associated token account
const solanaMintKey = new PublicKey(
  (await getForeignAssetSolana(
    connection,
    SOLANA_TOKEN_BRIDGE_ADDRESS,
    CHAIN_ID_ETH,
    hexToUint8Array(nativeToHexString(TEST_ERC20, CHAIN_ID_ETH) || "")
  )) || ""
);
const recipient = await Token.getAssociatedTokenAddress(
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  solanaMintKey,
  keypair.publicKey
);
// create the associated token account if it doesn't exist
const associatedAddressInfo = await connection.getAccountInfo(
  recipient
);
if (!associatedAddressInfo) {
  const transaction = new Transaction().add(
    await Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      solanaMintKey,
      recipient,
      keypair.publicKey, // owner
      keypair.publicKey // payer
    )
  );
  const { blockhash } = await connection.getRecentBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = keypair.publicKey;
  // sign, send, and confirm transaction
  transaction.partialSign(keypair);
  const txid = await connection.sendRawTransaction(
    transaction.serialize()
  );
  await connection.confirmTransaction(txid);
}
// create a signer for Eth
const provider = new ethers.providers.WebSocketProvider(ETH_NODE_URL);
const signer = new ethers.Wallet(ETH_PRIVATE_KEY, provider);
const amount = parseUnits("1", 18);
// approve the bridge to spend tokens
await approveEth(
  ETH_TOKEN_BRIDGE_ADDRESS,
  TEST_ERC20,
  signer,
  amount
);
// transfer tokens
const receipt = await transferFromEth(
  ETH_TOKEN_BRIDGE_ADDRESS,
  signer,
  TEST_ERC20,
  amount,
  CHAIN_ID_SOLANA,
  hexToUint8Array(
    nativeToHexString(recipient.toString(), CHAIN_ID_SOLANA) || ""
  )
);
// get the sequence from the logs (needed to fetch the vaa)
const sequence = parseSequenceFromLogEth(
  receipt,
  ETH_CORE_BRIDGE_ADDRESS
);
const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS);
// poll until the guardian(s) witness and sign the vaa
const { vaaBytes: signedVAA } = await getSignedVAAWithRetry(
  WORMHOLE_RPC_HOSTS,
  CHAIN_ID_ETH,
  emitterAddress,
  sequence,
  {
    transport: NodeHttpTransport(),
  }
);
// post vaa to Solana
await postVaaSolana(
  connection,
  async (transaction) => {
    transaction.partialSign(keypair);
    return transaction;
  },
  SOLANA_CORE_BRIDGE_ADDRESS,
  payerAddress,
  Buffer.from(signedVAA)
);


provider.destroy();
}
          