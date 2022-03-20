// import { attestFromSolana, parseSequenceFromLogSolana, getEmitterAddressSolana, getSignedVAA, CHAIN_ID_SOLANA, createWrappedOnEth, transferFromSolana, CHAIN_ID_ETH, redeemOnEth, getSignedVAAWithRetry } from "@certusone/wormhole-sdk";
// import { Connection, PublicKey, sendAndConfirmTransaction,
//     Signer as SOLSigner,} from "@solana/web3.js";
// import base58 from "bs58";
// import { SOL_BRIDGE_ADDRESS, SOL_TOKEN_BRIDGE_ADDRESS, WORMHOLE_RPC_HOST, ETH_TOKEN_BRIDGE_ADDRESS, MAINNET_SOL_ENDPOINT, ETH_PV_KEY, MAINNET_ETH_ENDPOINT, ETH_PUB_KEY, SOL_ETHUSDC_ADDRESS, SOL_PUB_KEY, SOL_PV_KEY } from "./utils";
// import { providers, Signer as ETHSigner, Wallet } from "ethers";

// import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";

// import { setDefaultWasm } from "@certusone/wormhole-sdk/lib/cjs/solana/wasm";
// // this fixes the unexpected token issue, the default wasm is intended for bundlers
// setDefaultWasm("node");

// const solToEthAttest = async ({ connection, payerAddress, mintAddress, ethSigner, solSigner }) => {
//   // Submit transaction - results in a Wormhole message being published
//   const transaction = await attestFromSolana(
//     connection,
//     SOL_BRIDGE_ADDRESS,
//     SOL_TOKEN_BRIDGE_ADDRESS,
//     payerAddress,
//     mintAddress
//   );
//   console.log("Attest tx made");

//   const txid = await sendAndConfirmTransaction(connection, transaction, [
//     solSigner,
//   ]);
//   console.log("TX ID:", txid)
// ;
//   // Get the sequence number and emitter address required to fetch the signedVAA of our message
//   const info = await connection.getTransaction(txid);
//   const sequence = parseSequenceFromLogSolana(info);
//   const emitterAddress = await getEmitterAddressSolana(
//     SOL_TOKEN_BRIDGE_ADDRESS
//   );
//   // Fetch the signedVAA from the Wormhole Network (this may require retries while you wait for confirmation)
//   const { vaaBytes } = await getSignedVAAWithRetry(
//     [WORMHOLE_RPC_HOST],
//     CHAIN_ID_SOLANA,
//     emitterAddress,
//     sequence,
//     {
//         transport: NodeHttpTransport(), // This should only be needed when running in node.
//       },
//   );
//   console.log("Signed VAA");

//   // Create the wrapped token on Ethereum
//   const res = await createWrappedOnEth(ETH_TOKEN_BRIDGE_ADDRESS, ethSigner, vaaBytes);
//   console.log("Wrapped eth res:", res);
//   return res;
// };

// const solToEthTransfer = async ({ connection, payerAddress, fromAddress, mintAddress, amount, targetAddress, signer }) => {
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
//     CHAIN_ID_ETH
//   );
//   console.log("Transfer from solana tx constructed.")

//   const txid = await connection.sendAndConfirmTransaction(transaction);
//   console.log("TX ID:", txid);

//   // Get the sequence number and emitter address required to fetch the signedVAA of our message
//   const info = await connection.getTransaction(txid);
//   const sequence = parseSequenceFromLogSolana(info);
//   const emitterAddress = await getEmitterAddressSolana(
//     SOL_TOKEN_BRIDGE_ADDRESS
//   );
//   // Fetch the signedVAA from the Wormhole Network (this may require retries while you wait for confirmation)
//   const { vaaBytes } = await getSignedVAAWithRetry(
//     [WORMHOLE_RPC_HOST],
//     CHAIN_ID_SOLANA,
//     emitterAddress,
//     sequence,
//     {
//         transport: NodeHttpTransport(), //This should only be needed when running in node.
//       },
//       1000, //retryTimeout
//       1000 //Maximum retry attempts
//   );
//   console.log("Signed VAA")

//   // Redeem on Ethereum
//   const res = await redeemOnEth(ETH_TOKEN_BRIDGE_ADDRESS, signer, vaaBytes);
//   console.log("Redemption:", res);
//   return res;
// };

// (async () => {
//     const connection = new Connection(MAINNET_SOL_ENDPOINT, "confirmed");

//     // Solana Key Pair
//     const payerAddress = SOL_PUB_KEY; // publickey string
//     const solSigner = {
//         publicKey: new PublicKey(SOL_PUB_KEY),
//         secretKey: Buffer.from(base58.decode(SOL_PV_KEY))
//     }

//     const ethProvider = new providers.JsonRpcProvider(
//         MAINNET_ETH_ENDPOINT
//        );
//     const ethSigner: ETHSigner = new Wallet(ETH_PV_KEY, ethProvider);

//     const res = await solToEthAttest({
//         connection,
//         payerAddress,
//         mintAddress: SOL_ETHUSDC_ADDRESS,
//         solSigner,
//         ethSigner
//     })

//     // const fromAddress = SOL_PUB_KEY;
//     // const amount = 5;
//     // const targetAddress = ETH_PUB_KEY;
//     // const transactionRes = await solToEthTransfer({ 
//     //     connection, 
//     //     payerAddress, 
//     //     fromAddress, 
//     //     mintAddress: SOL_ETHUSDC_ADDRESS,
//     //     amount, 
//     //     targetAddress, 
//     //     signer: ethSigner
//     // })
//     // console.log(transactionRes);
// })()