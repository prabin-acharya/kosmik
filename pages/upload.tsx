import { UserButton } from "@clerk/nextjs";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadFile() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileId, setFileId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(true);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/*,video/*",
    onDrop: (acceptedFiles) => {
      setSelectedFile(URL.createObjectURL(acceptedFiles[0]));
      setFile(acceptedFiles[0]);
      uploadFile(acceptedFiles[0]);
    },
  });

  const uploadFile = async (acceptedFile) => {
    console.log("uploading");
    if (!acceptedFile) return;
    console.log("uploading2");

    const formData = new FormData();
    formData.append("file", acceptedFile);
    formData.append("x-file-name", acceptedFile.name);

    setLoading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "x-file-name": acceptedFile.name,
        },
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      setFileId(data.uuid);

      if (data.transcription && !title) {
        setTranscription(data.transcription);
        generateTitle(data.transcription, data.uuid);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const generateTitle = async (tcps, fileId) => {
    console.log("generating title", transcription);

    if (title) return;

    const response = await fetch("/api/ai/title", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userInput: tcps,
        context: "image/screenshot",
        uuid: fileId,
      }),
    });

    const data = await response.json();

    const { output } = data;

    const generatedTitle = output.text;

    setTitle(generatedTitle);

    console.log(generatedTitle);
  };

  // get transcription, status
  useEffect(() => {
    console.log("efffect");
    if (!fileId) return;

    if (file && file.type.startsWith("image/")) return;

    console.log("polling");

    const poll = async () => {
      try {
        const response = await fetch(`/api/transcription?uuid=${fileId}`);

        if (!response.ok) throw new Error("Failed to get transcription");

        const data = await response.json();

        if (data.result.transcription) {
          setTranscription(data.result.transcription);
          clearInterval(interval);
          if (!title) {
            console.log("lllllllllLLLL");
            generateTitle(data.result.transcription, fileId);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    const generateTitle = async (tcps, fileId) => {
      console.log("~~~~~~~~");
      const response = await fetch("/api/ai/title", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: tcps,
          context: "image/screenshot",
          uuid: fileId,
        }),
      });

      const data = await response.json();

      const { output } = data;

      const generatedTitle = output.text;

      setTitle(generatedTitle);

      console.log(generatedTitle);
    };

    const interval = setInterval(() => {
      poll();
    }, 10000);

    return () => clearInterval(interval);
  }, [file, fileId, title, transcription]);

  // component unmount
  useEffect(() => {
    return () => {
      setSelectedFile(null);
      setFile(null);
      setLoading(false);
      setFileId(null);
      setTranscription(null);
      setTitle("");
      setTags("");
      setButtonDisabled(true);
    };
  }, []);

  const updateDetails = async () => {
    const response = await fetch("/api/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid: fileId,
        title,
        tags,
      }),
    });

    const data = await response.json();

    console.log(data);
  };

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
      <div className="flex flex-col justify-center  pt-4 px-60">
        <h1 className="text-2xl font-bold">Upload Files</h1>
        <div className="px-2">
          <div
            {...getRootProps()}
            className="mt-2 mb-4 border border-neutral-200 p-12 "
          >
            <input {...getInputProps()} />
            {/* <p>Drag and drop some files here, or click to select files</p> */}
            <div className="flex flex-col items-center justify-center gap-4">
              <ArrowUpTrayIcon className="h-5 w-5 fill-current" />
              {isDragActive ? (
                <p>Drop the files here ...</p>
              ) : (
                <p>Drag & drop files here, or click to select files</p>
              )}
            </div>
          </div>

          {selectedFile && <h2 className="text-2xl font-bold mb-4">Preview</h2>}

          {selectedFile && (
            <div className="">
              <div className="flex justify-between">
                <div className="p-4">
                  {file && file.type.startsWith("image/") && (
                    <figure className=" mb-4 w-fit text-center">
                      <Image
                        src={selectedFile}
                        alt="Selected"
                        width={400}
                        height={300}
                      />
                      <figcaption>{file.name}</figcaption>
                    </figure>
                  )}

                  {file && file.type.startsWith("video/") && (
                    <figure className=" mb-4 w-fit text-center">
                      <video
                        src={selectedFile}
                        width={400}
                        height={300}
                        controls
                      />
                      <figcaption className="text-center text-gray-500 font-medium">
                        {file.name}
                      </figcaption>
                    </figure>
                  )}

                  {file && file.type.startsWith("application/") && (
                    <figure className="border-2 border-red-200 mb-4 w-fit text-center">
                      {/* <video
                        src={selectedFile}
                        width={400}
                        height={300}
                        controls
                      /> */}
                      <p>pdf</p>
                      <figcaption className="text-center text-gray-500 font-medium">
                        {file.name}
                      </figcaption>
                    </figure>
                  )}
                </div>

                <div className=" p-4 pl-8 w-full">
                  {/* this div is file status, name, title, size, length */}
                  <div className="mb-4">
                    {/* this is just top status */}
                    {/* {!loading && !transcription && (
                      <button
                        onClick={uploadFile}
                        className=" rounded-md bg-gray-300 p-1 px-2 text-xs hover:cursor-pointer"
                      >
                        Upload {file.name}
                      </button>
                    )} */}

                    {loading && !fileId && (
                      <button className=" rounded-md bg-gray-300 p-1 px-2 text-xs hover:cursor-pointer">
                        Uploading...
                      </button>
                    )}

                    {fileId && (
                      <button className=" rounded-md bg-gray-300 p-1 px-2 text-xs hover:cursor-pointer">
                        Saved
                      </button>
                    )}

                    {fileId && !transcription && (
                      <button className=" rounded-md bg-gray-300 p-1 px-2 text-xs hover:cursor-pointer">
                        Generating Transcription...
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col">
                    {/* generated title, allow edit, add tags */}
                    <input
                      type="text"
                      placeholder="Title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        setButtonDisabled(false);
                      }}
                      className="text-2xl font-semibold border-none outline-none mb-4"
                    />

                    <input
                      type="text"
                      placeholder="tags: ai, cold-email,..."
                      value={tags}
                      onChange={(e) => {
                        setTags(e.target.value);
                        setButtonDisabled(false);
                      }}
                      className="border-none outline-none"
                    />

                    {!buttonDisabled && (
                      <button
                        onClick={() => {
                          updateDetails();
                          setButtonDisabled(true);
                        }}
                        className={` w-fit px-4 py-1 bg-fly rounded-md border mt-4 ${
                          buttonDisabled
                            ? "cursor-not-allowed "
                            : "hover:border hover:border-fuchsia-600"
                        }`}
                      >
                        Update
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                {/* below this transcription related */}
                {transcription && (
                  <>
                    <p>
                      <b>Transcription: </b> {transcription}
                    </p>

                    <span className="">*magic* Summarize this</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
