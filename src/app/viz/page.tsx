import Image from "next/image";
import Link from "next/link";
import EmbeddingMap from "@/components/EmbeddingMap";

export default function VizPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-950 px-6 py-8">
      <div className="mx-auto mb-6 flex w-full max-w-5xl items-center gap-4">
        <Image src="/logo.png" alt="LecTech" width={48} height={48} className="rounded-lg" />
        <div>
          <h1 className="text-2xl font-bold text-white">Carte des embeddings des articles LecTech</h1>
          <p className="mt-1 text-sm text-gray-400">
            Chaque point est un passage d&apos;article, projeté de 3 072 dimensions vers 2. Deux
            points proches traitent de sujets voisins.
          </p>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl flex-1 rounded-2xl border border-gray-700 bg-gray-900 p-6">
        <EmbeddingMap width={800} height={440} radius={7} />
      </div>

      <p className="mx-auto mt-6 w-full max-w-5xl text-center text-xs text-gray-500">
        Embeddings : Gemini (gemini-embedding-001) · Projection : PCA ·{" "}
        <Link href="/" className="underline hover:text-gray-300">
          Poser une question aux articles
        </Link>{" "}
        ·{" "}
        <a
          href="https://lectech.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-300"
        >
          LecTech
        </a>
      </p>
    </div>
  );
}
