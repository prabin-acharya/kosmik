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
      console.log(data, "==++");
      setFileId(data.uuid);

      data.transcription && setTranscription(data.transcription);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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
        }
      } catch (error) {
        console.log(error);
      }
    };

    const interval = setInterval(() => {
      poll();
    }, 10000);

    return () => clearInterval(interval);
  }, [file, fileId]);

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
      <div className="flex flex-col justify-center border-2 border-gray-300 py-8 px-2">
        <h1 className="text-3xl font-bold">Upload Files</h1>
        <div className="px-2">
          <div
            {...getRootProps()}
            className="mt-6 mb-6 border border-neutral-200 p-16 "
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

          <h2 className="text-2xl font-bold mb-4">Preview</h2>

          {selectedFile && (
            <div className=" px-4">
              {file && file.type.startsWith("image/") ? (
                <figure className="border-2 border-red-200 mb-4 w-fit text-center">
                  <Image
                    src={selectedFile}
                    alt="Selected"
                    width={400}
                    height={300}
                  />
                  <figcaption>{file.name}</figcaption>
                </figure>
              ) : (
                <figure className="border-2 border-red-200 mb-4 w-fit text-center">
                  <video src={selectedFile} width={400} height={300} controls />
                  <figcaption className="text-center text-gray-500 font-medium">
                    {file.name}
                  </figcaption>
                </figure>
              )}

              {!loading && !transcription && (
                <button
                  onClick={uploadFile}
                  className="bg-black  text-white py-2 px-12 rounded-md"
                >
                  Upload {file.name}
                </button>
              )}

              {loading && !fileId && (
                <button
                  onClick={uploadFile}
                  className="bg-black  text-white py-2 px-12 rounded-md"
                >
                  Uploading...
                </button>
              )}
              {fileId && !transcription && (
                <button
                  onClick={uploadFile}
                  className="bg-black  text-white py-2 px-12 rounded-md"
                >
                  Generating Transcription...
                </button>
              )}
              {transcription && (
                <p>
                  <b>Transcription: </b> {transcription}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
