import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Link from "next/link";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const [allMedia, setAllMedia] = useState([]);

  // fetcch data from /api/getAllMedia
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/getAllMedia");
      const data = await res.json();
      console.log(data);
      setAllMedia(data.result);
    };

    fetchData();
  }, []);

  // // In case the user signs out while on the page.
  if (!isLoaded || !userId) {
    return (
      <>
        <h1 className="text-4xl font-bold text-center">This is a Intro page</h1>
        <Link href="/sign-in">Sign In</Link>
      </>
    );
  }

  return (
    <SignedIn>
      <main className=" px-60">
        <header className="border-2 border-green-300 flex justify-end px-16 py-2">
          <UserButton afterSignOutUrl="/" />
        </header>
        <div className="flex flex-col justify-center border-2 border-gray-300 py-8 px-2 pr-10">
          {/* search */}

          <div className="flex justify-between items-center w-full mb-4 pb-4">
            <input
              type="text"
              placeholder="Search"
              className="border-2 border-gray-300 rounded-md px-4 py-2 w-10/12 mr-1"
            />

            <button
              onClick={() => {
                window.location.href = "/upload";
              }}
              className="bg-black  text-white py-2 px-12 rounded-md w-2/12"
            >
              Add New
            </button>
          </div>

          {/* end search */}

          <div className=" flex justify-between items-center pb-4">
            <h2 className="text-2xl font-bold">Recent Uploads</h2>
          </div>
          <ul className="flex flex-wrap">
            {allMedia?.map((media) => (
              <li
                key={media.uuid}
                className="border-2 border-slate-800 w-96 px-4 py-4 m-2 rounded-md"
              >
                <Link href={`/file/${media.uuid}`}>
                  {media.originalFilename}
                </Link>

                <video src={media.url} width={400} height={300} controls />
                <p>
                  <b>Transcription: </b>
                  {media.transcription.substring(0, 100)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </SignedIn>
  );
}
