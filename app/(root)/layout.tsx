import AppWalletProvider from "./AppWalletProvider";
import ToastProvider from "./TaostProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppWalletProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppWalletProvider>
      </body>
    </html>
  );
}
