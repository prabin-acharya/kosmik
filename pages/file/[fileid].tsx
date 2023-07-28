import { UserButton } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function File() {
  const [file, setFile] = useState(null);

  const router = useRouter();
  const { fileid } = router.query;

  useEffect(() => {
    console.log(fileid);

    const fetchData = async () => {
      const res = await fetch(`/api/file?uuid=${fileid}`);
      const data = await res.json();
      setFile(data.result);
      console.log(data);
    };

    fetchData();
  }, [fileid]);

  return (
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
      <div className="flex flex-col justify-center py-8 px-60 ">
        {file && (
          <>
            <h1 className="text-3xl font-bold mb-4">{file.generatedTitle}</h1>
            <figure className=" mb-4 w-fit text-center">
              <video src={file?.url} width={400} height={300} controls />
              <figcaption className="text-center text-gray-500 font-medium">
                {file.generatedTitle}
              </figcaption>
            </figure>

            {file.tags?.map((tag) => (
              <span
                key={tag}
                className="bg-gray-200 w-fit text-gray-500 text-xs rounded-md px-2 py-1 mr-1"
              >
                {tag}
              </span>
            ))}

            <p>
              <b>Transcription: </b> {file.transcription}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
