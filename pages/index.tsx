import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { isLoaded, userId, sessionId, getToken } = useAuth();

  // // In case the user signs out while on the page.
  if (!isLoaded || !userId) {
    return (
      <>
        <h1 className="text-4xl font-bold text-center">This is a Intro page</h1>
      </>
    );
  }

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      {/* <SignedOut>
        <h1 className="text-4xl font-bold text-center">This is a Intro page</h1>
      </SignedOut> */}
      <SignedIn>
        <header>
          <UserButton afterSignOutUrl="/" />
        </header>
        <h1 className="text-4xl font-bold text-center">This is a Home page</h1>
      </SignedIn>
    </main>
  );
}
