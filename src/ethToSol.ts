import {
  approveEth,
  attestFromEth,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
  createWrappedOnSolana,
  getEmitterAddressEth,
  getForeignAssetSolana,
  getSignedVAAWithRetry,
  hexToUint8Array,
  nativeToHexString,
  parseSequenceFromLogEth,
  postVaaSolana,
  postVaaSolanaWithRetry,
  redeemOnSolana,
  transferFromEth,
} from "@certusone/wormhole-sdk";
import {
  ETH_TOKEN_BRIDGE_ADDRESS,
  ETH_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOST,
  SOL_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  MAINNET_SOL_ENDPOINT,
  ETH_USD_ADDRESS,
  ETH_PUB_KEY,
  ETH_PV_KEY,
  MAINNET_ETH_ENDPOINT,
  SOL_USDC_PUB_KEY,
  SOL_PV_KEY,
  SOL_PUB_KEY,
  // ERC20_ADDRESS,
  // USDC_GOERLI_ADDRESS,
} from "./utils";

import blah from "./erc20.json";

import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Signer as SOLSigner,
} from "@solana/web3.js";
import { Contract, ethers, providers, Signer as ETHSigner, Transaction, Wallet } from "ethers";

import base58 from "bs58";

import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";

import { setDefaultWasm } from "@certusone/wormhole-sdk/lib/cjs/solana/wasm";
import { parseUnits } from "ethers/lib/utils";
// this fixes the unexpected token issue, the default wasm is intended for bundlers
setDefaultWasm("node");

type AttestParams = {
  connection: Connection; // Solana connection
  ethSigner: ETHSigner; // Ethereum wallet
  solSigner: SOLSigner;
  tokenAddress: string; // Ethereum token contract address
  solanaPayerAddress: string; // Solana payer address
};

type TransferParams = {
  connection: Connection;
  ethSigner: ETHSigner;
  solSigner: SOLSigner;
  tokenAddress: string;
  solanaPayerAddress: string;
  amount: number;
  recipientAddress: Uint8Array;
};

const ethToSolanaAttestation = async ({
  connection,
  ethSigner,
  solSigner,
  tokenAddress,
  solanaPayerAddress,
}: AttestParams) => {
  console.log("Starting");

  // Submit transaction - results in a Wormhole message being published
  const receipt = await attestFromEth(
    ETH_TOKEN_BRIDGE_ADDRESS,
    ethSigner,
    tokenAddress
  );
  console.log("Receipt:", receipt);
  console.log("Attested from ETH");
  // Get the sequence number and emitter address required to fetch the signedVAA of our message
  const sequence = parseSequenceFromLogEth(receipt, ETH_BRIDGE_ADDRESS);
  const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS);
  // Fetch the signedVAA from the Wormhole Network (this may require retries while you wait for confirmation)
  const { vaaBytes } = await getSignedVAAWithRetry(
    [WORMHOLE_RPC_HOST],
    CHAIN_ID_ETH,
    emitterAddress,
    sequence,
    {
      transport: NodeHttpTransport(), // This should only be needed when running in node.
    },
    1000, //retryTimeout
    1000 //Maximum retry attempts
  );
  console.log("Signed VAA With Retry");

  // On Solana, we have to post the signedVAA ourselves
  await postVaaSolanaWithRetry(
    connection,
    // Partially signing with a solana key pair
    async (transaction) => {
      transaction.partialSign(solSigner);
      return transaction;
    },
    SOL_BRIDGE_ADDRESS,
    solanaPayerAddress,
    Buffer.from(vaaBytes),
    5
  );
  console.log("Posted VAA Solana With Retry");

  // Finally, create the wrapped token
  const transaction = await createWrappedOnSolana(
    connection,
    SOL_BRIDGE_ADDRESS,
    SOL_TOKEN_BRIDGE_ADDRESS,
    solanaPayerAddress,
    Buffer.from(vaaBytes)
  );
  console.log("Created Wrapped Transaction");

  // Shitty documentation from Wormhole (Keeping for reference)
  //   const signed = await wallet.signTransaction(transaction);
  //   const txid = await connection.sendRawTransaction(signed.serialize());
  //   await connection.confirmTransaction(txid);

  const res = await sendAndConfirmTransaction(connection, transaction, [
    solSigner,
  ]);
  console.log("Sent and confirmed transaction");
  return res;
};

const ethToSolTransfer = async ({
  connection,
  ethSigner,
  solSigner,
  tokenAddress,
  solanaPayerAddress,
  amount,
  recipientAddress,
}: TransferParams) => {
  console.log("Starting transfer");

  // Submit transaction - results in a Wormhole message being published
  const receipt = await transferFromEth(
    ETH_TOKEN_BRIDGE_ADDRESS,
    ethSigner,
    tokenAddress,
    amount,
    CHAIN_ID_SOLANA,
    recipientAddress
  );
  console.log("Receipt:", receipt);
  console.log("Transfer eth receipt created.");

  // Get the sequence number and emitter address required to fetch the signedVAA of our message
  const sequence = parseSequenceFromLogEth(receipt, ETH_BRIDGE_ADDRESS);
  const emitterAddress = getEmitterAddressEth(ETH_TOKEN_BRIDGE_ADDRESS);
  // Fetch the signedVAA from the Wormhole Network (this may require retries while you wait for confirmation)
  const { vaaBytes } = await getSignedVAAWithRetry(
    [WORMHOLE_RPC_HOST],
    CHAIN_ID_ETH,
    emitterAddress,
    sequence,
    {
      transport: NodeHttpTransport(), //This should only be needed when running in node.
    },
    1000, //retryTimeout
    1000 //Maximum retry attempts
  );
  console.log("Signed VAA WIth Retry")

  // On Solana, we have to post the signedVAA ourselves
  await postVaaSolanaWithRetry(
    connection,
    async (transaction) => {
      transaction.partialSign(solSigner);
      return transaction;
    },
    SOL_BRIDGE_ADDRESS,
    solanaPayerAddress,
    Buffer.from(vaaBytes),
    5
  );
  console.log("Posted VAA WIth Retry")

  // Finally, redeem on Solana
  // const transaction = await redeemOnSolana(
  //   connection,
  //   SOL_BRIDGE_ADDRESS,
  //   SOL_TOKEN_BRIDGE_ADDRESS,
  //   solanaPayerAddress,
  //   Buffer.from(vaaBytes)
  // );
  // console.log("Redeemed on Solana")

  // Shitty documentation from Wormhole (Keeping for reference)
    // const signed = await (transaction);
    // const txid = await connection.sendRawTransaction(signed.serialize());
    // await connection.confirmTransaction(txid);
  // const res = sendAndConfirmTransaction(connection, transaction, [solSigner]);
  // console.log("Sent and confirmed tx!")
  // return res;

  // redeem tokens on solana
  const transaction = await redeemOnSolana(
    connection,
    SOL_BRIDGE_ADDRESS,
    SOL_TOKEN_BRIDGE_ADDRESS,
    solanaPayerAddress,
    Buffer.from(vaaBytes)
  );
  // sign, send, and confirm transaction
  transaction.partialSign(solSigner);
  const txid = await connection.sendRawTransaction(
    transaction.serialize()
  );
  await connection.confirmTransaction(txid);
};

const getBalance = async (options) => {
  const contract = new Contract(ETH_USD_ADDRESS, blah, options.provider);
  const balance = await contract.balanceOf(options.address);
  console.log("ERC20 Balance:", balance.toString());

  const etherBalance = await options.provider.getBalance(options.address);
  console.log("Ether Balance:", etherBalance.toString());
};

(async () => {
  const solConnection = new Connection(MAINNET_SOL_ENDPOINT, "confirmed");

  const ethProvider = new providers.JsonRpcProvider(
   MAINNET_ETH_ENDPOINT
  );
  const ethSigner: ETHSigner = new Wallet(ETH_PV_KEY, ethProvider);

  await getBalance({
    address: ETH_PUB_KEY,
    provider: ethProvider
  })

  const solSigner = {
    publicKey: new PublicKey(SOL_PUB_KEY),
    secretKey: Buffer.from(base58.decode(SOL_PV_KEY))
  };

  // Works!!
  // const attestRes = await ethToSolanaAttestation({
  //   connection: solConnection,
  //   ethSigner,
  //   solSigner,
  //   tokenAddress: ETH_USD_ADDRESS,
  //   solanaPayerAddress: solPubKey,
  // });
  // console.log("Attest response:", attestRes);
  console.log(ETH_USD_ADDRESS);
  const transactRes = await ethToSolTransfer({
    connection: solConnection,
    ethSigner,
    solSigner,
    tokenAddress: ETH_USD_ADDRESS,
    solanaPayerAddress: SOL_PUB_KEY,
    amount: 100, // GWEI Sending $20
    recipientAddress: base58.decode(SOL_PUB_KEY)
  });
  console.log("Transact response:", transactRes);
})();
