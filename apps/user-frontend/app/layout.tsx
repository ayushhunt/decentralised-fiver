
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";


// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {



  return (
    <html lang="en">
      <body className={inter.className}>
        
        {children}
        
      </body>
    </html>
  );
}