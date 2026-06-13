import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import "./globals.css";
import Navbar from "./navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ContentFlow AI — Transformez un article en 3 posts réseaux sociaux",
  description:
    "Collez une URL d'article, l'IA extrait le contenu et génère automatiquement des posts pour LinkedIn, Twitter et Instagram.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#050816",
          colorText: "#e2e8f0",
          colorTextSecondary: "#94a3b8",
          colorNeutral: "#312e81",
        },
      }}
    >
      <html lang="fr" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          <Navbar isSignedIn={!!user} />
          <main className="flex-1">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
