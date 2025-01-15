import { PublicKey } from "@solana/web3.js";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

const useAirDrop = () => {
  const [loading, setLoading] = useState(false);

  const airdrop = async (publicKey: PublicKey, amount: string) => {
    const check = isNumeric(amount);

    if (!check) {
      toast.error("Enter a valid Number", {
        position: "bottom-right",
      });
      return;
    }
    const loadingToastId = toast.loading("AirDroping Sol", {
      position: "bottom-right",
    });
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8989/airdrop", {
        publickey: publicKey.toBase58(),
        airdropamount: amount,
      });
      toast.update(loadingToastId, {
        render: response.data.message,
        type: "success",
        isLoading: false,
        position: "bottom-right",
        autoClose: 3000,
      });
      return response.status;
    } catch (error: unknown) {
      if (
        error instanceof AxiosError &&
        error.response &&
        error.response.data
      ) {
        toast.update(loadingToastId, {
          render: `${error.response.data.message}`,
          type: "error",
          isLoading: false,
          position: "bottom-right",
          autoClose: 3000,
        });
      } else {
        toast.update(loadingToastId, {
          render: "UpExpected Error",
          type: "error",
          isLoading: false,
          position: "bottom-right",
          autoClose: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, airdrop };
};

export default useAirDrop;

function isNumeric(n: string) {
  return !isNaN(parseFloat(n)) && isFinite(Number(n));
}
