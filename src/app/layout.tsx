import type { Metadata } from "next";
import { Providers } from "./providers";
import { Orbitron, Press_Start_2P, Inter } from "next/font/google";
import "./global.css";

export const interfont = Inter({
  variable: "--",
  subsets: ["latin"]
});

export const orbitron = Orbitron({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-orbitron",
});

const pressStart = Press_Start_2P({
    weight: "400",
    subsets: ["latin"],
    display: "swap",
    variable: "--font-press-start",
});

export const metadata: Metadata = {
    title: "Chain Play",
    description: "Play retro arcade games and earn crypto rewards on Solana",
    applicationName: "Chain Play",
    manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${pressStart.variable}`}>
        <body className={`${orbitron.className} antialiased`}>
            <Providers>{children}</Providers>
        </body>
    </html>
  );
}
