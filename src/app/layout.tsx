import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SomCerto – Projeto de Som Automotivo",
  description:
    "Monte, valide e configure seu projeto de som automotivo com o SomCerto. Compatibilidade, cortes, caixas e medição de dB.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-[#0B0F15] font-sans text-white">
        {children}
      </body>
    </html>
  );
}
