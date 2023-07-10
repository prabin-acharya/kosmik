import { UserButton } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <header>
        <UserButton afterSignOutUrl="/" />
      </header>
      <h1 className="text-4xl font-bold text-center">This is a home page</h1>
    </main>
  );
}
