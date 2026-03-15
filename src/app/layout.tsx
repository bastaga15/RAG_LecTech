import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "How to Hire an AI — Interactive Q&A",
  description:
    "Ask questions about the book 'How to Hire an AI' by Felix Craft & Nat Eliason. Powered by RAG.",
  openGraph: {
    title: "How to Hire an AI — Interactive Q&A",
    description:
      "Explore the practical playbook for giving an AI a real job. Ask any question about the book!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
