"use client";

import { WalletAdapterNetwork } from "@/app/types";
import { RefreshCw } from "lucide-react";

interface ProcessingCardProps {
  message?: string;
  network: string;
}

const ProcessingCard: React.FC<ProcessingCardProps> = ({
  message = "Processing request...",
  network,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div
          className={`text-white text-center py-2 font-semibold ${network === WalletAdapterNetwork.Devnet ? "bg-yellow-500" : "bg-green-500"}`}
        >
          {network === WalletAdapterNetwork.Devnet ? "Devnet" : "Mainnet"}{" "}
          Environment
        </div>
        <div className="p-6 flex flex-col items-center justify-center min-h-[200px] bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-12 w-12 animate-spin text-purple-500" />
            <p className="text-lg font-medium text-gray-700">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingCard;
