"use client";
import React from "react";
import AppWalletProvider from "./AppWalletProvider";
import ToastProvider from "./TaostProvider";
import { NetworkProvider } from "../NetworkContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NetworkProvider>
          <AppWalletProvider>
            <ToastProvider>{children}</ToastProvider>
          </AppWalletProvider>
        </NetworkProvider>
      </body>
    </html>
  );
}
