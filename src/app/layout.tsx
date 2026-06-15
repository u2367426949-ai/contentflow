import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
} from "@clerk/nextjs";
import "./globals.css";
import "./animations.css";
import { Zap } from "lucide-react";
import { NavLinks } from "@/components/NavLinks";
import { UserMenu } from "@/components/UserMenu";
import { LogoLink } from "@/components/LogoLink";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ContentFlow AI — Transformez un article en 3 posts réseaux sociaux",
  description:
    "Collez une URL d'article, l'IA extrait le contenu et génère automatiquement des posts pour LinkedIn, Twitter et Instagram.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "ContentFlow AI — Transformez un article en 3 posts réseaux sociaux",
    description:
      "Collez une URL d'article, l'IA extrait le contenu et génère automatiquement des posts pour LinkedIn, Twitter et Instagram.",
    url: "https://contentflow-ai-node-ia.vercel.app",
    siteName: "ContentFlow AI",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContentFlow AI — Transformez un article en 3 posts réseaux sociaux",
    description:
      "Collez une URL d'article, l'IA extrait le contenu et génère automatiquement des posts pour LinkedIn, Twitter et Instagram.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#6366f1",
          colorBackground: "#f8fafc",
        },
        elements: {
          card: "shadow-2xl shadow-indigo-500/10 border border-slate-200/60 rounded-2xl",
          headerTitle: "text-slate-800 text-xl font-bold",
          headerSubtitle: "text-slate-500",
          socialButtonsBlockButton: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-sm rounded-lg",
          dividerLine: "bg-slate-200",
          dividerText: "text-slate-400",
          formFieldLabel: "text-slate-600 text-sm font-medium",
          formFieldInput: "border border-slate-200 bg-white text-slate-800 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400",
          formButtonPrimary: "bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/20 rounded-lg",
          footerActionText: "text-slate-500",
          footerActionLink: "text-indigo-600 hover:text-indigo-700 font-medium",
        },
      }}
    >
      <html lang="fr" className={`${inter.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <ToastProvider>
          {/* ─── Navbar ─── */}
          <header className="sticky top-0 z-50">
            {/* Gradient border bottom */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />

            <nav className="relative bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                  {/* Logo */}
                  <LogoLink />

                  {/* Nav links with active indicator */}
                  <NavLinks />

                  {/* Right side */}
                  <div className="flex items-center gap-3">
                    <Show when="signed-out">
                      <SignInButton mode="modal">
                        <button className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-surface/50">
                          Se connecter
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button className="group relative inline-flex items-center gap-2 text-sm font-semibold bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-all shadow-md shadow-accent/20 hover:shadow-accent/30 overflow-hidden">
                          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          <Zap className="w-3.5 h-3.5 relative z-10" />
                          <span className="relative z-10">Essayer gratuitement</span>
                        </button>
                      </SignUpButton>
                    </Show>
                    <Show when="signed-in">
                      <UserMenu />
                    </Show>
                  </div>
                </div>
              </div>
            </nav>
          </header>

          <main className="flex-1">{children}</main>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
