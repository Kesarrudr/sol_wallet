import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import axios from "axios";

// Custom hook for sending a swap transaction
const useSendSwapTransaction = () => {
  const { signTransaction } = useWallet();
  const { connection } = useConnection();

  const sendSwapTransaction = async (quote: string, publicKey: string) => {
    if (!signTransaction) {
      console.error("Wallet not connected or signTransaction not available.");
      return;
    }

    try {
      // Step 1: Request the swap transaction from the Jupiter API
      const response = await axios.post(
        "https://quote-api.jup.ag/v6/swap",
        {
          quoteResponse: quote,
          userPublicKey: publicKey,
          wrapAndUnwrapSol: true,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      const transactionData = response.data.swapTransaction;

      const transactionBuffer = Buffer.from(transactionData, "base64");
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      await signTransaction(transaction);

      const latestBlockHash = await connection.getLatestBlockhash();

      const rawTransaction = transaction.serialize();
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
      });

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: txid,
      });

      return txid;
    } catch (error) {
      console.error(
        "Error during swap transaction:",
        // error?.response?.data || error.message,
      );
    }
  };

  return { sendSwapTransaction };
};

export default useSendSwapTransaction;
