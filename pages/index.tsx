import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { isLoaded, userId } = useAuth();
  const [allMedia, setAllMedia] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [search, setSearch] = useState("");

  console.log("===");

  // fetcch data from /api/getAllMedia
  useEffect(() => {
    console.log("+++");
    const fetchData = async () => {
      console.log("---");
      const res = await fetch("/api/getAllMedia");
      const data = await res.json();
      console.log(data, "*");
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

    if (data) {
      // setAllMedia(files);
      setSearchResults(files);
      setShowSearchResults(true);
    }
  };

  // // In case the user signs out while on the page.
  if (!isLoaded || !userId) {
    return (
      <>
        {/* <h1 className="text-4xl font-bold text-center">This is a Intro page</h1>
        <Link href="/sign-in">Sign In</Link> */}
      </>
    );
  }

  const allFiles = showSearchResults ? searchResults : allMedia;

  // function to calculate how many days ago, hours ago, minutes ago
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + " years ago";
    }

    interval = seconds / 2592000;

    if (interval > 1) {
      return Math.floor(interval) + " months ago";
    }

    interval = seconds / 86400;

    if (interval > 1) {
      return Math.floor(interval) + " days ago";
    }

    interval = seconds / 3600;

    if (interval > 1) {
      return Math.floor(interval) + " hours ago";
    }

    interval = seconds / 60;

    if (interval > 1) {
      return Math.floor(interval) + " minutes ago";
    }

    return Math.floor(seconds) + " seconds ago";
  };

  const imageFiles = allFiles.filter((file) =>
    file.contentType.startsWith("image/")
  );

  const videoFiles = allFiles.filter((file) =>
    file.contentType.startsWith("video/")
  );

  return (
    <SignedIn>
      <main className="">
        <header className=" flex justify-between  py-2 bg-fly px-60 pr-76 sticky top-0 z-50 shadow-md">
          <span
            className="text-3xl font-bold cursor-pointer  "
            onClick={() => {
              window.location.href = "/";
            }}
          >
            Kosmik
          </span>
          <UserButton afterSignOutUrl="/" />
        </header>
        <div className="flex flex-col justify-center py-8 px-60">
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
              className="bg-fuchsia-900  text-white py-2 px-8 rounded-md w-2/12 ml-4"
            >
              <b>+ </b> Add New
            </button>
          </div>
          {/* end search */}

          <div className=" flex flex-col pb-4">
            {showSearchResults && (
              <button
                onClick={() => {
                  setShowSearchResults(false);
                  setSearch("");
                }}
                className=" bg-slate-600 text-white py-1 px-8 rounded-full w-fit mb-4"
              >
                see all files
              </button>
            )}
            <h2 className="text-2xl font-bold">
              {!showSearchResults ? "Recent Uploads" : "Search Results"}
            </h2>
          </div>

          {allFiles.length === 0 && (
            <div className="flex flex-col justify-center items-center">
              <p className="text-2xl font-bold text-gray-500">No files found</p>
              <br />
              <p>
                Hey, looks like you are new here. Click on "+ Add New" button
                above to start saving files.
              </p>
            </div>
          )}

          <ul className="flex flex-wrap">
            {allFiles?.map((media) => (
              <>
                <Link href={`/file/${media.uuid}`}>
                  <li
                    key={media.uuid}
                    className=" w-80 m-2 rounded-md border-2 border-fly hover:border-fuchsia-700"
                  >
                    {media && media.contentType?.startsWith("image/") && (
                      <figure className=" w-fit text-center bg-fly">
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
                        {/* <figcaption>{media.originalFilename}</figcaption> */}
                        <p>
                          <b>{media?.generatedTitle}</b>
                        </p>
                        <div className="px-1 pb-2">
                          {media.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-200 text-gray-500 text-xs rounded-md px-2 py-1 mr-1"
                            >
                              {tag}
                            </span>
                          ))}

                          {/* date: days ago */}

                          <span className=" text-gray-500 text-xs rounded-md px-2 py-1 mr-1">
                            {/* {new Date(media.createdAt).toDateString()} */}
                            {timeAgo(new Date(media.createdAt))}
                          </span>

                          {/* <p>
                            <b>Transcription: </b>
                            {media.transcription &&
                            media.transcription.length > 100
                              ? media.transcription.substring(0, 100)
                              : media.transcription}
                          </p> */}
                        </div>
                      </figure>
                    )}

                    {media && media.contentType?.startsWith("video/") && (
                      <figure className=" w-fit text-center bg-fly">
                        <video
                          src={media.url}
                          width={400}
                          height={300}
                          controls
                          className=" rounded-md"
                        />
                        {/* <figcaption className="text-center text-gray-500 font-medium">
                          {media.originalFilename}
                        </figcaption> */}
                        <p>
                          <b>{media?.generatedTitle}</b>
                        </p>
                        <div className="px-1 pb-2">
                          {media.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="bg-gray-200 text-gray-500 text-xs rounded-md px-2 py-1 mr-1"
                            >
                              {tag}
                            </span>
                          ))}

                          <span className=" text-gray-500 text-xs rounded-md px-2 py-1 mr-1">
                            {/* {new Date(media.createdAt).toDateString()} */}
                            {timeAgo(new Date(media.createdAt))}
                          </span>
                          {/* <p>
                            <b>Transcription: </b>
                            {media.transcription &&
                              media.transcription.substring(0, 100)}
                            ...
                          </p> */}
                        </div>
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
