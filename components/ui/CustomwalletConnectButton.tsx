"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function CustomWalletConnectButton() {
  return (
    <div className="text-center py-8">
      <p className="text-lg font-medium text-gray-600 mb-4">
        Connect your wallet to access Solana features
      </p>
      <WalletMultiButton
        style={{
          background: "linear-gradient(to right, #7f5af0, #5f3dc4)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
        }}
      />
    </div>
  );
}
