'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Send, Droplet, FileSignature, Coins, RefreshCw, Copy, ExternalLink, Globe } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ProcessingCardProps {
  message?: string
  network: string
}

function ProcessingCard({ message = "Processing request...", network }: ProcessingCardProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className={`text-white text-center py-2 font-semibold ${network === 'devnet' ? 'bg-yellow-500' : 'bg-green-500'}`}>
          {network === 'devnet' ? 'Devnet' : 'Mainnet'} Environment
        </div>
        <div className="p-6 flex flex-col items-center justify-center min-h-[200px] bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-purple-500" />
            <p className="text-lg font-medium text-gray-700">{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SolanaWalletComponent() {
  const [balance, setBalance] = useState(5.123456)
  const [connected, setConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('airdrop')
  const [airdropAmount, setAirdropAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingMessage, setProcessingMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [message, setMessage] = useState('')
  const [network, setNetwork] = useState('devnet')

  const handleConnect = async () => {
    setIsProcessing(true)
    setProcessingMessage("Connecting wallet...")
    // Simulate wallet connection
    await new Promise(resolve => setTimeout(resolve, 2000))
    setConnected(true)
    setWalletAddress('7J5e7RsdTvvkqRpE5bj3Ej3dYTqAWxVCwgWLFhsSwKC3PX')
    setIsProcessing(false)
  }

  const handleDisconnect = () => {
    setConnected(false)
    setBalance(0)
    setWalletAddress('')
  }

  const handleAirdrop = async () => {
    setIsProcessing(true)
    setProcessingMessage("Processing airdrop...")
    // Simulate airdrop
    await new Promise(resolve => setTimeout(resolve, 2000))
    const amount = parseFloat(airdropAmount)
    if (!isNaN(amount) && amount > 0) {
      setBalance(prevBalance => prevBalance + amount)
      setAirdropAmount('')
    }
    setIsProcessing(false)
  }

  const handleRefreshBalance = async () => {
    setIsProcessing(true)
    setProcessingMessage("Refreshing balance...")
    // Simulate balance refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setBalance(prevBalance => prevBalance + Math.random())
    setIsProcessing(false)
  }

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    // In a real app, you'd want to show a toast notification here
    console.log('Address copied to clipboard')
  }

  const handleViewOnExplorer = () => {
    const explorerUrl = network === 'devnet' 
      ? `https://explorer.solana.com/address/${walletAddress}?cluster=devnet`
      : `https://explorer.solana.com/address/${walletAddress}`
    window.open(explorerUrl, '_blank')
  }

  const handleSign = async () => {
    setIsProcessing(true)
    setProcessingMessage("Signing message...")
    // Simulate message signing
    await new Promise(resolve => setTimeout(resolve, 1500))
    setSignature('5wXQSNwv9TzPRXbGgcRjv3Gr5q7iNRwNcc8MhVqNvinqnZs3DwjntYtGG9nKTXa7xbHLf7K8KiCjJ3yGGQzDBHHf')
    setIsProcessing(false)
  }

  const handleNetworkChange = (newNetwork: string) => {
    setNetwork(newNetwork)
    // In a real app, you'd want to update the connection to the new network here
    console.log(`Switched to ${newNetwork}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
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
                  <Button variant="secondary" size="sm" className="bg-white text-purple-500 hover:bg-gray-200">
                    <Globe className="mr-2 h-4 w-4" />
                    {network === 'devnet' ? 'Devnet' : 'Mainnet'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleNetworkChange('mainnet')}>
                    Mainnet
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleNetworkChange('devnet')}>
                    Devnet
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {connected ? (
                <Button variant="secondary" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={handleConnect}>
                  Connect Wallet
                </Button>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyAddress}>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleViewOnExplorer}>
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
                <p className="text-lg font-bold">{balance.toFixed(6)} SOL</p>
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 gap-4 bg-gray-100 p-1 rounded-md">
                <TabsTrigger value="airdrop" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Droplet className="w-4 h-4 mr-2" />
                  AirDrop
                </TabsTrigger>
                <TabsTrigger value="send" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </TabsTrigger>
                <TabsTrigger value="sign" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <FileSignature className="w-4 h-4 mr-2" />
                  Sign
                </TabsTrigger>
                <TabsTrigger value="create" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
                  <Coins className="w-4 h-4 mr-2" />
                  Create
                </TabsTrigger>
              </TabsList>
              <TabsContent value="airdrop" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-500 mb-4">Request an airdrop of SOL to your wallet for testing purposes.</p>
                    <div className="flex space-x-2 mb-4">
                      <Input 
                        type="number" 
                        placeholder="Amount (SOL)" 
                        value={airdropAmount} 
                        onChange={(e) => setAirdropAmount(e.target.value)}
                        className="flex-grow"
                      />
                      <Button 
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white" 
                        onClick={handleAirdrop}
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
                        <Input id="recipient" placeholder="Enter Solana address" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount (SOL)</Label>
                        <Input id="amount" type="number" placeholder="0.00" className="mt-1" />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">Send SOL</Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="sign" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-500 mb-4">Sign a message to prove ownership of your wallet.</p>
                    <Input
                      placeholder="Enter message to sign"
                      className="mb-4"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white mb-4"
                      onClick={handleSign}
                    >
                      Sign Message
                    </Button>
                    {signature && (
                      <div className="mt-4 bg-gray-50 rounded-md p-4 border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Signature:</label>
                        <ScrollArea className="h-24 w-full rounded-md border border-gray-200 bg-white">
                          <div className="p-4">
                            <p className="text-sm text-gray-800 break-all font-mono leading-relaxed">{signature}</p>
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="create" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-gray-500 mb-4">Create a new SPL token on the Solana blockchain.</p>
                    <Input placeholder="Token Name" className="mb-4" />
                    <Input placeholder="Token Symbol" className="mb-4" />
                    <Input type="number" placeholder="Total Supply" className="mb-4" />
                    <Button  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white">
                      Create Token
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg font-medium text-gray-600 mb-4">Connect your wallet to access Solana features</p>
              <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white" onClick={handleConnect}>
                Connect Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {isProcessing && <ProcessingCard message={processingMessage} network={network} />}
    </div>
  )
}