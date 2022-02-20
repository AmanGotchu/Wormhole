import { getForeignAssetSolana, CHAIN_ID_ETH, hexToUint8Array, nativeToHexString, approveEth, transferFromEth, CHAIN_ID_SOLANA, parseSequenceFromLogEth, getEmitterAddressEth, getSignedVAAWithRetry, postVaaSolana, getIsTransferCompletedSolana, redeemOnSolana } from "@certusone/wormhole-sdk";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, Keypair, PublicKey, Transaction as SolTransaction } from "@solana/web3.js";
import { ethers } from "ethers";
import { base58, parseUnits } from "ethers/lib/utils";
import { ETH_BRIDGE_ADDRESS, ETH_PV_KEY, ETH_TOKEN_BRIDGE_ADDRESS, ETH_USD_ADDRESS, MAINNET_ETH_ENDPOINT, MAINNET_SOL_ENDPOINT, SOL_BRIDGE_ADDRESS, SOL_ETHUSDC_ADDRESS, SOL_PUB_KEY, SOL_PV_KEY, SOL_TOKEN_BRIDGE_ADDRESS, WORMHOLE_RPC_HOST } from "./utils";

const solanaSend = async () => {
// create a keypair for Solana
const connection = new Connection(MAINNET_SOL_ENDPOINT, "confirmed");
const keypair = Keypair.fromSecretKey(Buffer.from(base58.decode(SOL_PV_KEY)))

const payerAddress = keypair.publicKey.toString();
// determine destination address - an associated token account
const solanaMintKey = new PublicKey(
  (await getForeignAssetSolana(
    connection,
    SOL_TOKEN_BRIDGE_ADDRESS,
    CHAIN_ID_ETH,
    hexToUint8Array(nativeToHexString(ETH_USD_ADDRESS, CHAIN_ID_ETH) || "")
  )) || ""
);
const recipient = await getAssociatedTokenAddress(
  new PublicKey(SOL_ETHUSDC_ADDRESS),
  new PublicKey(SOL_PUB_KEY),
);
// create the associated token account if it doesn't exist
const associatedAddressInfo = await connection.getAccountInfo(
  recipient
);
if (!associatedAddressInfo) {
    console.log("No associated address info");

  const transaction = new SolTransaction().add(
    await createAssociatedTokenAccountInstruction(
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
} else {
    console.log("Associated address info found!");
}
// create a signer for Eth
const provider = new ethers.providers.WebSocketProvider(MAINNET_ETH_ENDPOINT);
const signer = new ethers.Wallet(ETH_PV_KEY, provider);
const amount = parseUnits("1", 18);
// approve the bridge to spend tokens
await approveEth(
  ETH_TOKEN_BRIDGE_ADDRESS,
  ETH_USD_ADDRESS,
  signer,
  amount
);
// transfer tokens
const receipt = await transferFromEth(
  ETH_TOKEN_BRIDGE_ADDRESS,
  signer,
  ETH_USD_ADDRESS,
  amount,
  CHAIN_ID_SOLANA,
  hexToUint8Array(
    nativeToHexString(recipient.toString(), CHAIN_ID_SOLANA) || ""
  )
);

// get the sequence from the logs (needed to fetch the vaa)
const sequence = parseSequenceFromLogEth(
  receipt,
  ETH_BRIDGE_ADDRESS
);
const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS);
// poll until the guardian(s) witness and sign the vaa
const { vaaBytes: signedVAA } = await getSignedVAAWithRetry(
    [WORMHOLE_RPC_HOST],
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
  SOL_BRIDGE_ADDRESS,
  payerAddress,
  Buffer.from(signedVAA)
);

provider.destroy();
}
          
(async () => {
    await solanaSend();
})