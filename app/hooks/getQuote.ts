import { TokenAddress } from "@/lib/token_address";
import axios, { AxiosRequestConfig } from "axios";

interface getQuoteInterface {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: string;
}
export interface getQuoteReturntype {
  quote: object;
  outAmount: string;
}
const getQuote = async ({
  inputMint,
  outputMint,
  amount,
  slippageBps,
}: getQuoteInterface) => {
  try {
    const inputMintDecimals = getDecimals(inputMint);
    if (inputMintDecimals === undefined) {
      return;
    }
    const swapAmount = Number(amount) * Math.pow(10, inputMintDecimals);

    const parmas = new URLSearchParams({
      inputMint: inputMint,
      outputMint: outputMint,
      amount: String(swapAmount),
      slippageBps: slippageBps || "0",
    }).toString();
    const config: AxiosRequestConfig = {
      method: "get",
      maxBodyLength: Infinity,
      url: `https://quote-api.jup.ag/v6/quote?${parmas}`,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const respone = await axios.request(config);
    const outMintDecimals = getDecimals(outputMint);
    if (outMintDecimals === undefined) {
      return;
    }
    return {
      outAmount: Number(respone.data.outAmount) / Math.pow(10, outMintDecimals),
      quote: respone.data,
    };
  } catch (error) {
    console.log(error);
    return;
  }
};

const getDecimals = (inputMint: string): number | undefined => {
  const token = Object.values(TokenAddress).find(
    (token) => token.address === inputMint,
  );
  return token?.decimals;
};

export default getQuote;
