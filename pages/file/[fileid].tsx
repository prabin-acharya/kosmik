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
    <main className="px-60">
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
      <div className="flex flex-col justify-center border-2 border-gray-300 py-8 px-2 pr-10">
        {file && (
          <>
            <h1 className="text-3xl font-bold mb-4">{file.originalFilename}</h1>
            <figure className="border-2 border-red-200 mb-4 w-fit text-center">
              <video src={file?.url} width={400} height={300} controls />
              <figcaption className="text-center text-gray-500 font-medium">
                {file.filename}
              </figcaption>
            </figure>

            <p>
              <b>Transcription: </b> {file.transcription}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
