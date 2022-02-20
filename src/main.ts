import {
  attestFromEth,
  attestFromSolana,
  CHAIN_ID_ETH,
  createWrappedOnEth,
  createWrappedOnSolana,
  getEmitterAddressEth,
  getEmitterAddressSolana,
  getSignedVAA,
  parseSequenceFromLogEth,
  parseSequenceFromLogSolana,
  postVaaSolana,
  redeemOnEth,
  redeemOnSolana,
  transferFromEth,
  transferFromSolana,
} from "@certusone/wormhole-sdk";

import { ETH_TOKEN_BRIDGE_ADDRESS, ETH_BRIDGE_ADDRESS, WORMHOLE_RPC_HOST, SOL_BRIDGE_ADDRESS, SOL_TOKEN_BRIDGE_ADDRESS } from "./utils";



// const solanaToEthAttestation = async () => {
//   // Submit transaction - results in a Wormhole message being published
//   const transaction = await attestFromSolana(
//     connection,
//     SOL_BRIDGE_ADDRESS,
//     SOL_TOKEN_BRIDGE_ADDRESS,
//     payerAddress,
//     mintAddress
//   );
//   const signed = await wallet.signTransaction(transaction);
//   const txid = await connection.sendRawTransaction(signed.serialize());
//   await connection.confirmTransaction(txid);
//   // Get the sequence number and emitter address required to fetch the signedVAA of our message
//   const info = await connection.getTransaction(txid);
//   const sequence = parseSequenceFromLogSolana(info);
//   const emitterAddress = await getEmitterAddressSolana(
//     SOL_TOKEN_BRIDGE_ADDRESS
//   );
//   // Fetch the signedVAA from the Wormhole Network (this may require retries while you wait for confirmation)
//   const { signedVAA } = await getSignedVAA(
//     WORMHOLE_RPC_HOST,
//     CHAIN_ID_SOLANA,
//     emitterAddress,
//     sequence
//   );
//   // Create the wrapped token on Ethereum
//   await createWrappedOnEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, signedVAA);
// };

// const solToEthTransfer = async () => {
//   // Submit transaction - results in a Wormhole message being published
//   const transaction = await transferFromSolana(
//     connection,
//     SOL_BRIDGE_ADDRESS,
//     SOL_TOKEN_BRIDGE_ADDRESS,
//     payerAddress,
//     fromAddress,
//     mintAddress,
//     amount,
//     targetAddress,
//     CHAIN_ID_ETH,
//     originAddress,
//     originChain
//   );
//   const signed = await wallet.signTransaction(transaction);
//   const txid = await connection.sendRawTransaction(signed.serialize());
//   await connection.confirmTransaction(txid);
//   // Get the sequence number and emitter address required to fetch the signedVAA of our message
//   const info = await connection.getTransaction(txid);
//   const sequence = parseSequenceFromLogSolana(info);
//   const emitterAddress = await getEmitterAddressSolana(
//     SOL_TOKEN_BRIDGE_ADDRESS
//   );
//   // Fetch the signedVAA from the Wormhole Network (this may require retries while you wait for confirmation)
//   const { signedVAA } = await getSignedVAA(
//     WORMHOLE_RPC_HOST,
//     CHAIN_ID_SOLANA,
//     emitterAddress,
//     sequence
//   );
//   // Redeem on Ethereum
//   await redeemOnEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, signedVAA);
// };


