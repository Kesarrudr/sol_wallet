import { PublicKey } from "@solana/web3.js";
import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

const GetBalance = async (publickey: PublicKey) => {
  const loadingToastId = toast.loading("Updating Balance....", {
    position: "bottom-right",
  });
  try {
    const respose = await axios.post(
      "https://wallet-backend.kesartechnologies.software/balance",
      {
        publickey: publickey.toBase58(),
      },
    );

    toast.update(loadingToastId, {
      render: "Balance Updated",
      type: "success",
      position: "bottom-right",
      isLoading: false,
      autoClose: 3000,
    });

    return respose.data.message;
  } catch (error: unknown) {
    if (error instanceof AxiosError && error.response && error.response.data) {
      toast.error(`${error.response.data.message}`, {
        position: "bottom-right",
      });
      toast.update(loadingToastId, {
        render: `${error.response.data.message}`,
        type: "error",
        position: "bottom-right",
        isLoading: false,
        autoClose: 3000,
      });
    } else {
      toast.update(loadingToastId, {
        render: "Unexpected Error",
        type: "error",
        position: "bottom-right",
        isLoading: false,
        autoClose: 3000,
      });
    }
  } finally {
  }
};

export default GetBalance;
