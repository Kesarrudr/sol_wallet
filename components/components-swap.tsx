"use client";

import getQuote from "@/app/hooks/getQuote";
import useSendSwapTransaction from "@/app/hooks/sendSwapTranscation";
import { useNetwork } from "@/app/NetworkContext";
import { WalletAdapterNetwork } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TokenAddress } from "@/lib/token_address";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowDownUp, Clock, ExternalLink, AlertCircle } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";

export function SwapComponent() {
  const [sellAmount, setSellAmount] = useState<string>("");
  const [buyAmount, setBuyAmount] = useState<string>("");
  const [sellToken, setSellToken] = useState<string>(TokenAddress.USD.symbol);
  const [buyToken, setBuyToken] = useState<string>(
    TokenAddress["WRAPPED SOL"].symbol,
  );
  const [buyTokenAddress, setBuyTokenAddress] = useState<string>(
    TokenAddress["WRAPPED SOL"].address,
  );
  const [sellTokenAddress, setSellTokenAddress] = useState<string>(
    TokenAddress.USD.address,
  );
  const [quote, setQuote] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [transactionFailed, setTransactionFailed] = useState<boolean>(false);

  const { publicKey } = useWallet();
  const { sendSwapTransaction } = useSendSwapTransaction();
  const { network } = useNetwork();

  const fetchQuote = async (
    amount: string,
    inputMint: string,
    outMint: string,
  ) => {
    if (amount === "" || amount === "0") return;
    try {
      const result = await getQuote({
        inputMint,
        outputMint: outMint,
        amount,
      });

      if (result) {
        const { outAmount, quote: latestQuote } = result;
        return { outAmount: String(outAmount), quote: latestQuote };
      }
    } catch (error) {
      console.log("Error while fetching Quote", error);
      return;
    }
  };

  const handleSwap = async () => {
    if (publicKey) {
      try {
        setTransactionFailed(false);
        const txHash = await sendSwapTransaction(quote, publicKey.toString());
        if (txHash === undefined) {
          setTransactionFailed(true);
          return;
        }
        setTransactionHash(txHash);
      } catch (error) {
        console.error("Swap Failed", error);
        setTransactionFailed(true);
      }
    } else {
      console.error("Public key is not available.");
      setTransactionFailed(true);
    }
  };

  useEffect(() => {}, [sellTokenAddress, buyTokenAddress]);

  return (
    <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
      <Tabs defaultValue="swap" className="w-full">
        <TabsContent value="swap" className="mt-4">
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <Label
                htmlFor="sell"
                className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300"
              >
                <span>You&apos;re Selling</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Select value={sellToken} onValueChange={setSellToken}>
                  <SelectTrigger className="w-[120px] bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Select token">
                      {sellToken && (
                        <div className="flex items-center gap-2">
                          <Image
                            src={
                              Object.values(TokenAddress).find(
                                (t) => t.symbol === sellToken,
                              )?.logoURI || "/placeholder.svg"
                            }
                            alt={sellToken}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <span className="font-medium">{sellToken}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {Object.values(TokenAddress).map((token) => (
                      <SelectItem
                        key={token.symbol}
                        value={token.symbol}
                        disabled={token.address === buyTokenAddress}
                        onClick={() => {
                          setSellTokenAddress(token.address);
                          setSellAmount("");
                          setBuyAmount("");
                        }}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center justify-between w-full py-1">
                          <div className="flex items-center gap-2">
                            <Image
                              src={token.logoURI || "/placeholder.svg"}
                              alt={token.symbol}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {token.symbol}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {token.name}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {token.address.slice(0, 6)}...
                                {token.address.slice(-4)}
                              </span>
                            </div>
                          </div>
                          {token.tags?.includes("verified") && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full ml-2">
                              Verified
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="sell"
                  type="number"
                  placeholder="0.00"
                  value={sellAmount}
                  onChange={async (e) => {
                    setSellAmount(e.target.value);
                    try {
                      setIsLoading(true);
                      const result = await fetchQuote(
                        e.target.value,
                        sellTokenAddress,
                        buyTokenAddress,
                      );
                      if (result === undefined) {
                        setBuyAmount("");
                        setQuote("");
                        return;
                      }
                      setBuyAmount(result.outAmount);
                      setQuote(result.quote);
                    } catch (error) {
                      setBuyAmount("");
                      setQuote("");
                    } finally {
                      if (e.target.value === "") {
                        setBuyAmount("");
                      }
                      setIsLoading(false);
                    }
                  }}
                  className="flex-grow bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSellToken(buyToken);
                  setBuyToken(sellToken);
                  setSellAmount(buyAmount);
                  setBuyAmount(sellAmount);
                  setSellTokenAddress(buyTokenAddress);
                  setBuyTokenAddress(sellTokenAddress);
                  setSellAmount("");
                  setBuyAmount("");
                }}
                className="rounded-full hover:bg-purple-100 dark:hover:bg-gray-700"
              >
                <ArrowDownUp className="h-4 w-4 text-purple-500" />
              </Button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <Label
                htmlFor="buy"
                className="text-sm font-medium mb-2 block text-gray-700 dark:text-gray-300"
              >
                <span>You&apos;re Buying</span>
              </Label>
              <div className="flex items-center space-x-2">
                <Select value={buyToken} onValueChange={setBuyToken}>
                  <SelectTrigger className="w-[120px] bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-700">
                    <SelectValue placeholder="Select token">
                      {buyToken && (
                        <div className="flex items-center gap-2">
                          <Image
                            src={
                              Object.values(TokenAddress).find(
                                (t) => t.symbol === buyToken,
                              )?.logoURI || "/placeholder.svg"
                            }
                            alt={buyToken}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <span className="font-medium">{buyToken}</span>
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {Object.values(TokenAddress).map((token) => (
                      <SelectItem
                        key={token.symbol}
                        value={token.symbol}
                        disabled={token.address === sellTokenAddress}
                        onClick={() => {
                          setBuyTokenAddress(token.address);
                          setBuyAmount("");
                          setSellAmount("");
                        }}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <div className="flex items-center justify-between w-full py-1">
                          <div className="flex items-center gap-2">
                            <Image
                              src={token.logoURI || "/placeholder.svg"}
                              alt={token.symbol}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <div className="flex flex-col items-start">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {token.symbol}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {token.name}
                              </span>
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {token.address.slice(0, 6)}...
                                {token.address.slice(-4)}
                              </span>
                            </div>
                          </div>
                          {token.tags?.includes("verified") && (
                            <span className="text-xs bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-full ml-2">
                              Verified
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="buy"
                  type="number"
                  placeholder="0.00"
                  value={buyAmount}
                  onChange={async (e) => {
                    setBuyAmount(e.target.value);
                    try {
                      setIsLoading(true);
                      const result = await fetchQuote(
                        e.target.value,
                        buyTokenAddress,
                        sellTokenAddress,
                      );
                      if (result === undefined) {
                        setSellAmount("");
                        setQuote("");
                        return;
                      }
                      setSellAmount(result.outAmount);
                      setQuote(result.quote);
                    } catch (error) {
                      setSellAmount("");
                      setQuote("");
                    } finally {
                      if (e.target.value === "") {
                        setBuyAmount("");
                      }
                      setIsLoading(false);
                    }
                  }}
                  className="flex-grow bg-white dark:bg-gray-600 border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>
            <Button
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              onClick={handleSwap}
              disabled={
                isLoading || network != WalletAdapterNetwork.Mainnet
                  ? true
                  : false
              }
            >
              Swap
            </Button>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>Token Permission</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {transactionHash && (
        <Card className="mt-4 bg-gray-50 dark:bg-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Transaction Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transaction Hash: {transactionHash.slice(0, 8)}...
              {transactionHash.slice(-8)}
            </p>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full text-purple-500 hover:bg-purple-100 dark:hover:bg-gray-600"
              onClick={() =>
                window.open(
                  `https://explorer.solana.com/tx/${transactionHash}`,
                  "_blank",
                )
              }
            >
              View on Explorer <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {transactionFailed && (
        <Card className="mt-4 bg-red-50 dark:bg-red-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-700 dark:text-red-300">
              Transaction Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">
                Your transaction has failed. Please try again{" "}
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              className="w-full text-red-500 hover:bg-red-100 dark:hover:bg-red-800"
              onClick={() => setTransactionFailed(false)}
            >
              Dismiss
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
