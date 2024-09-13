import { PublicKey } from "@solana/web3.js";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

const useVerifySignature = () => {
  const [loading, setLoading] = useState(false);

  const verifySignature = async (
    publicKey: PublicKey,
    message: string,
    signedMessage: string,
  ) => {
    setLoading(true);
    const loadingToastId = toast.loading("Verifying Signature", {
      position: "bottom-right",
    });
    try {
      const response = await axios.post(
        "https://wallet-backend.kesartechnologies.software/signmessage",
        {
          publickey: publicKey,
          message: message,
          signedMessage: signedMessage,
        },
      );
      toast.update(loadingToastId, {
        render: response.data.message,
        type: "success",
        position: "bottom-right",
        isLoading: false,
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
          position: "bottom-right",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return error.response.status;
      } else {
        toast.update(loadingToastId, {
          render: "Unexpect Error",
          position: "bottom-right",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return { status: 500 };
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, verifySignature };
};

export default useVerifySignature;
