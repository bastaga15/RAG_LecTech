import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interroger les articles LecTech (démo RAG)",
  description:
    "Posez une question sur les articles publiés par LecTech. Les réponses citent les articles dont elles viennent.",
  openGraph: {
    title: "Interroger les articles LecTech (démo RAG)",
    description:
      "Démo de RAG : recherche par similarité dans les articles de lectech.fr, réponse générée avec ses sources.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-950 text-gray-100 antialiased">{children}</body>
    </html>
  );
}
