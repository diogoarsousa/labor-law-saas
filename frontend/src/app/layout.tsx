import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import QueryProvider from "@/components/providers/QueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Doutor Trabalho — Plataforma de Direito Laboral",
    template: "%s | Doutor Trabalho",
  },
  description:
    "Plataforma B2B de apoio ao Direito do Trabalho português para equipas de RH, advogados e trabalhadores.",
  keywords: ["direito do trabalho", "código do trabalho", "RH", "portugal"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-PT" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
