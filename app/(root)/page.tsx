//TODO: use the loading state to update the balance

"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import ProcessingCard from "@/components/processing-card";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Wallet,
  Send,
  Droplet,
  FileSignature,
  RefreshCw,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CustomWalletConnectButton from "@/components/ui/CustomwalletConnectButton";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import GetBalance from "../hooks/getbalance";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "react-toastify";
import useVerifySignature from "../hooks/verifysignature";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import useAirDrop from "../hooks/airdrop";

const Component = () => {
  const [showCard, setShowCard] = useState(false);
  const [balance, setBalance] = useState("");
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("airdrop");
  const [airdropAmount, setAirdropAmount] = useState("1");
  const [walletAddress, setWalletAddress] = useState("");
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [reciverAddress, setReciverAddress] = useState("");
  const [amount, setAmount] = useState("");
  const { loading: airdroploading, airdrop } = useAirDrop();
  const { publicKey, sendTransaction, disconnect, signMessage } = useWallet();
  const { loading: verifyloading, verifySignature } = useVerifySignature();
  const { connection } = useConnection();
  const [showBalance, setShowBalance] = useState(true);

  // async function verifyUser() {
  //   setShowCard(true);
  //   const phrase = "Your are connecting your wallet";
  //   const message = new TextEncoder().encode(phrase);
  //   try {
  //     const signature = await signMessage?.(message);
  //     if (!signature) {
  //       throw new Error();
  //     }
  //     if (signature) {
  //       const status = await verifySignature(
  //         publicKey!,
  //         phrase,
  //         Buffer.from(signature).toString("base64"),
  //       );
  //       if (status !== 200) {
  //         throw new Error();
  //       }
  //     }
  //   } catch (error) {
  //     return;
  //   } finally {
  //     setShowCard(false);
  //   }
  // }
  //
  useEffect(() => {
    async function run(publicKey: PublicKey) {
      setConnected(true);
      setShowBalance(false);
      const newbal = await GetBalance(publicKey);
      setBalance(newbal);
      setShowBalance(true);
      setWalletAddress(truncateAddress(publicKey.toBase58()));
      setConnected(true);
    }
    if (publicKey) {
      run(publicKey);
    }
  }, [publicKey]);

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

  const sign = async () => {
    if (!message) {
      toast.error("Enter a Message to sign", {
        position: "bottom-right",
      });
      return;
    }
    setShowCard(true);
    const encodemessage = new TextEncoder().encode(message);
    const sign = await signMessage?.(encodemessage);

    if (sign) {
      const status = await verifySignature(
        publicKey!,
        message,
        Buffer.from(sign).toString("base64"),
      );
      if (status === 200) {
        setSignature(Buffer.from(sign).toString("base64"));
      }
    } else {
      setSignature("");
    }
  };

  async function makePayment(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setShowCard(true);
    const loadingTostid = toast.loading("Processing Payment...", {
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
        value: { blockhash, lastValidBlockHeight },
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
      });
      await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });
      toast.update(loadingTostid, {
        render: "Payment Successfull",
        type: "success",
        position: "bottom-right",
        isLoading: false,
        autoClose: 3000,
      });
      setShowBalance(false);
      const newBal = await GetBalance(publicKey!);
      setBalance(newBal);
      setShowBalance(true);
    } catch (error) {
      toast.update(loadingTostid, {
        render: "Transaction failed.Check bockChain before trying again",
        type: "error",
        position: "bottom-right",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setShowCard(false);
    }
  }
  const HandleAirdrop = async () => {
    if (publicKey) {
      const status = await airdrop(publicKey, airdropAmount);
      if (status === 200) {
        setShowBalance(false);
        const newBal = await GetBalance(publicKey!);
        setBalance(newBal);
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
      const newbal = await GetBalance(publicKey);
      setBalance(newbal);
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
    window.open(
      `https://explorer.solana.com/address/${publicKey?.toBase58()}`,
      "_blank",
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {showCard ? (
        <ProcessingCard message="Processing..." />
      ) : (
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader className="flex flex-col space-y-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-bold flex items-center">
                <Wallet className="mr-2" />
                Solana Wallet
              </CardTitle>
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
                    Sign
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
                          disabled={airdroploading}
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
                            onChange={(e) => setReciverAddress(e.target.value)}
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
                      <Input
                        placeholder="Enter message to sign"
                        className="mb-4"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                      <Button
                        className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
                        onClick={sign}
                        disabled={verifyloading}
                      >
                        Sign Message
                      </Button>
                      {signature ? (
                        <div className="mt-4 bg-gray-50 rounded-md p-4 border border-gray-200">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Signature:
                          </label>
                          <ScrollArea className="h-24 w-full rounded-md border border-gray-200 bg-white">
                            <div className="p-4">
                              <p className="text-sm text-gray-800 break-all font-mono leading-relaxed">
                                {signature}
                              </p>
                            </div>
                          </ScrollArea>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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
