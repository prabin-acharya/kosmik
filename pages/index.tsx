import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const [allMedia, setAllMedia] = useState([]);

  const [search, setSearch] = useState("");

  // fetcch data from /api/getAllMedia
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/getAllMedia");
      const data = await res.json();
      console.log(data);
      data && setAllMedia(data.result);
    };

    fetchData();
  }, []);

  const searchMedia = async () => {
    console.log("---searching");
    const res = await fetch(`/api/search?search=${encodeURIComponent(search)}`);
    const data = await res.json();
    console.log(data);

    const files = data.result.map((file) => file.document);

    console.log(files, "==");

    data && setAllMedia(files);
  };

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
        <header className=" flex justify-between pr-16 py-2">
          <span
            className="text-3xl font-bold cursor-pointer bg-green-100 text-orange-500  "
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Kosmik
          </span>
          <UserButton afterSignOutUrl="/" />
        </header>
        <div className="flex flex-col justify-center py-8 px-2">
          {/* search */}
          <div className="flex justify-between items-center w-full mb-4 pb-4 pr-8">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  console.log("enter");
                  searchMedia();
                }
              }}
              className="border-2 border-gray-300 rounded-md px-4 py-2 w-10/12 mr-1"
            />

            <button
              onClick={() => {
                window.location.href = "/upload";
              }}
              className="bg-black  text-white py-2 px-12 rounded-md w-2/12 ml-4"
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
              <>
                <Link href={`/file/${media.uuid}`}>
                  <li
                    key={media.uuid}
                    className=" w-80 px-2 py-4 m-2 rounded-md"
                  >
                    {/*  */}

                    {media && media.contentType?.startsWith("image/") ? (
                      <figure className="mb-4 w-fit text-center px-3 ">
                        <div className=" relative overflow-hidden w-homeImages h-homeImages ">
                          <Image
                            src={media.url}
                            alt="Selected"
                            // height={200}
                            // width={400}
                            layout="fill"
                            objectFit="cover"
                            className=" rounded-md"
                          />
                        </div>
                        <figcaption>{media.originalFilename}</figcaption>
                        <p>
                          <b>Transcription: </b>
                          {media.transcription &&
                          media.transcription.length > 100
                            ? media.transcription.substring(0, 100)
                            : media.transcription}
                        </p>
                      </figure>
                    ) : (
                      <figure className=" mb-4 w-fit text-center">
                        <video
                          src={media.url}
                          width={400}
                          height={300}
                          controls
                          className=" rounded-md"
                        />
                        <figcaption className="text-center text-gray-500 font-medium">
                          {media.originalFilename}
                        </figcaption>
                        <p>
                          <b>Transcription: </b>
                          {media.transcription &&
                            media.transcription.substring(0, 100)}
                          ...
                        </p>
                      </figure>
                    )}

                    {/*  */}
                  </li>
                  {/* {media.originalFilename} */}
                </Link>
              </>
            ))}
          </ul>
        </div>
      </main>
    </SignedIn>
  );
}
