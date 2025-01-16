"use client";
import { SwapComponent } from "@/components/components-swap";
import ProcessingCard from "@/components/processing-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomWalletConnectButton from "@/components/ui/CustomwalletConnectButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Update with your actual import paths
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WalletAdapterNetwork } from "../types";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Droplet,
  ExternalLink,
  FileSignature,
  Globe,
  Loader2,
  RefreshCw,
  Send,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import useAirDrop from "../hooks/airdrop";
import { useGetBalance } from "../hooks/getbalance";
import useVerifySignature from "../hooks/verifysignature";
import { useNetwork } from "../NetworkContext";

const Component = () => {
  const [showCard, setShowCard] = useState(false);
  const [balance, setBalance] = useState("");
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("airdrop");
  const [airdropAmount, setAirdropAmount] = useState("1");
  const [walletAddress, setWalletAddress] = useState("");
  const [reciverAddress, setReciverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const { loading: airdroploading, airdrop } = useAirDrop();
  const { publicKey, sendTransaction, disconnect } = useWallet();
  const [currentPublicKey, setCurrentPublicKey] = useState(publicKey);
  const { loading: verifyloading } = useVerifySignature();
  const { connection } = useConnection();
  const [showBalance, setShowBalance] = useState(true);
  const { network, setNetwork } = useNetwork();
  const { getBalance } = useGetBalance();

  const [transactionHash, setTransactionHash] = useState("");
  const [transactionStatus, setTransactionStatus] = useState<
    | "idle"
    | "processing"
    | "confirmed"
    | "finalized"
    | "error"
    | "not confirmed"
  >("idle");
  const run = useCallback(
    async (key: PublicKey) => {
      if (key) {
        setConnected(true);
        setShowBalance(false);
        const balance = await getBalance(key);
        // const balance = await connection.getBalance(key);

        setBalance(String(balance));
        setShowBalance(true);
        setWalletAddress(truncateAddress(key.toBase58()));
      }
    },
    [getBalance],
  );

  useEffect(() => {
    if (publicKey && publicKey !== currentPublicKey) {
      run(publicKey);
      setCurrentPublicKey(publicKey);
    }
  }, [publicKey, run, currentPublicKey]);

  useEffect(() => {
    if (airdroploading || verifyloading) {
      setShowCard(true);
    } else {
      setShowCard(false);
    }
  }, [airdroploading, verifyloading]);

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  // const sign = async () => {
  //   if (!message) {
  //     toast.error("Enter a Message to sign", {
  //       position: "bottom-right",
  //     });
  //     return;
  //   }
  //   setShowCard(true);
  //   const encodemessage = new TextEncoder().encode(message);
  //   const sign = await signMessage?.(encodemessage);
  //
  //   if (sign) {
  //     const status = await verifySignature(
  //       publicKey!,
  //       message,
  //       Buffer.from(sign).toString("base64"),
  //     );
  //     if (status === 200) {
  //       setSignature(Buffer.from(sign).toString("base64"));
  //     }
  //   } else {
  //     setSignature("");
  //   }
  // };
  //
  async function makePayment(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowCard(true);
    setTransactionStatus("processing");
    const loadingToastId = toast.loading("Processing Payment...", {
      position: "bottom-right",
    });
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey!,
          toPubkey: new PublicKey(reciverAddress),
          lamports: Number(amount) * LAMPORTS_PER_SOL,
        }),
      );
      const {
        context: { slot: minContextSlot },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
      });
      setTransactionHash(signature);

      const { value } = await connection.getSignatureStatus(signature);

      if (value === null) {
        setTransactionStatus("not confirmed");
        toast.update(loadingToastId, {
          render:
            "Transaction can't be confirmed. Check blockchain before trying again",
          type: "warning",
          isLoading: false,
          autoClose: 5000,
        });
      } else if (value.err) {
        setTransactionStatus("error");
        toast.update(loadingToastId, {
          render: "Payment not Successful",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      } else {
        if (value.confirmationStatus === "processed") {
          setTransactionStatus("processing");
          toast.update(loadingToastId, {
            render: "Payment is Processed",
            type: "info",
            isLoading: false,
            autoClose: 3000,
          });
        } else if (
          value.confirmationStatus === "confirmed" ||
          value.confirmationStatus === "finalized"
        ) {
          setTransactionStatus(value.confirmationStatus);
          toast.update(loadingToastId, {
            render: "Payment Successful",
            type: "success",
            isLoading: false,
            autoClose: 3000,
          });
        }
      }

      setShowBalance(false);
      const newBal = await getBalance(publicKey!);
      setBalance(String(newBal));
      setReciverAddress("");
      setAmount("");
      setShowBalance(true);
    } catch (error) {
      console.error("Transaction error:", error);
      setTransactionStatus("error");
      toast.update(loadingToastId, {
        render: "Transaction failed.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setShowCard(false);
      setReciverAddress("");
      setAmount("");
    }
  }

  const HandleAirdrop = async () => {
    if (publicKey) {
      const status = await airdrop(publicKey, airdropAmount);
      if (status === 200) {
        setShowBalance(false);
        const newBal = await getBalance(publicKey);
        if (newBal === undefined) {
          return;
        }
        setBalance(String(newBal));
        setShowBalance(true);
      }
    }
  };

  function handleDisconnect() {
    setShowCard(true);
    disconnect();
    setConnected(false);
    setShowCard(false);
  }

  const handleRefreshBalance = async () => {
    if (publicKey) {
      setShowBalance(false);
      const newbal = await getBalance(publicKey);
      if (newbal === undefined) {
        return;
      }
      setBalance(String(newbal));
      setShowBalance(true);
    }
  };

  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58());
    }
    toast.success("Wallet Address Copied", {
      position: "bottom-right",
    });
  };

  const handleViewOnExplorer = () => {
    if (network == WalletAdapterNetwork.Mainnet) {
      window.open(
        `https://explorer.solana.com/address/${publicKey?.toBase58()}`,
        "_blank",
      );
    } else if (network == WalletAdapterNetwork.Devnet) {
      window.open(
        `https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`,
        "_blank",
      );
    }
  };

  const handleNetworkChange = async (newNetwork: WalletAdapterNetwork) => {
    setNetwork(newNetwork);
    if (publicKey) {
      setShowBalance(false);
      const newbal = await getBalance(publicKey);
      if (newbal === undefined) {
        setBalance("*");
        return;
      }
      setBalance(String(newbal));
      setShowBalance(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {showCard ? (
        <ProcessingCard message="Processing..." network={network} />
      ) : (
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="flex flex-col space-y-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Wallet className="mr-2" />
                Solana Wallet
              </CardTitle>
              <div className="flex items-center space-x-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white text-purple-500 hover:bg-gray-200"
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      {network === WalletAdapterNetwork.Devnet
                        ? "Devnet"
                        : "Mainnet"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() =>
                        handleNetworkChange(WalletAdapterNetwork.Mainnet)
                      }
                    >
                      Mainnet
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        handleNetworkChange(WalletAdapterNetwork.Devnet)
                      }
                    >
                      Devnet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {connected ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <WalletMultiButton
                    style={{
                      background: "white",
                      color: "black",
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                )}
              </div>
            </div>
            {connected && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">{walletAddress}</p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleCopyAddress}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy address</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleViewOnExplorer}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>View on Explorer</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="text-lg font-bold">
                    {balance && showBalance ? `${balance} SOL` : "Updating..."}
                  </p>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleRefreshBalance}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Refresh balance</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6">
            {connected ? (
              <>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 gap-4 bg-gray-100 p-1 rounded-md">
                    <TabsTrigger
                      value="airdrop"
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                    >
                      <Droplet className="w-4 h-4 mr-2" />
                      AirDrop
                    </TabsTrigger>
                    <TabsTrigger
                      value="send"
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </TabsTrigger>
                    <TabsTrigger
                      value="sign"
                      className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
                    >
                      <FileSignature className="w-4 h-4 mr-2" />
                      Swap
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="airdrop" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex space-x-2 mb-4">
                          <Input
                            type="number"
                            placeholder="Request for 1 (SOL)"
                            onChange={(e) => setAirdropAmount(e.target.value)}
                            className="flex-grow"
                          />
                          <Button
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                            onClick={() => HandleAirdrop()}
                            disabled={
                              airdroploading ||
                              network === WalletAdapterNetwork.Mainnet
                            }
                          >
                            Request Airdrop
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="send" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <form className="space-y-4">
                          <div>
                            <Label htmlFor="recipient">Recipient Address</Label>
                            <Input
                              id="recipient"
                              placeholder="Enter Solana address"
                              className="mt-1"
                              value={reciverAddress}
                              onChange={(e) =>
                                setReciverAddress(e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="amount">Amount (SOL)</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="0.00"
                              className="mt-1"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                            />
                          </div>
                          <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                            onClick={makePayment}
                          >
                            Send SOL
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="sign" className="mt-4">
                    <Card>
                      <CardContent className="pt-6">
                        <SwapComponent />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {transactionStatus !== "idle" && (
                  <Card className="mt-4 bg-gray-50 dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold">
                        Transaction Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {transactionStatus === "processing" && (
                        <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <p>Processing transaction...</p>
                        </div>
                      )}
                      {transactionStatus === "confirmed" && (
                        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <p>Transaction confirmed</p>
                        </div>
                      )}
                      {transactionStatus === "finalized" && (
                        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-5 h-5" />
                          <p>Transaction finalized</p>
                        </div>
                      )}
                      {transactionStatus === "error" && (
                        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                          <AlertCircle className="w-5 h-5" />
                          <p>Transaction failed</p>
                        </div>
                      )}
                      {transactionStatus === "not confirmed" && (
                        <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                          <AlertCircle className="w-5 h-5" />
                          <p>
                            Transaction can&apos;t be confirmed. Check Before
                            trying again
                          </p>
                        </div>
                      )}
                      {transactionHash && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Transaction Hash: {transactionHash.slice(0, 8)}...
                            {transactionHash.slice(-8)}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() =>
                              window.open(
                                `https://explorer.solana.com/tx/${transactionHash}?cluster=${network === WalletAdapterNetwork.Devnet ? "devnet" : "mainnet"}`,
                                "_blank",
                              )
                            }
                          >
                            View on Explorer
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <CustomWalletConnectButton />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Component;
