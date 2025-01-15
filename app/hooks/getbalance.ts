import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";

const useGetBalance = () => {
  const { connection } = useConnection();

  const getBalance = async (publickey: PublicKey) => {
    try {
      const balance = await connection.getBalance(publickey);

      return balance / LAMPORTS_PER_SOL;
    } catch (error: unknown) {
      return;
    }
  };

  return { getBalance };
};

export { useGetBalance };
