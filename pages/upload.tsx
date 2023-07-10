import { UserButton } from "@clerk/nextjs";
import { ArrowUpTrayIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadImage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [mongoId, setMongoId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: "image/*,video/*",
    onDrop: (acceptedFiles) => {
      setSelectedImage(URL.createObjectURL(acceptedFiles[0]));
      setImageFile(acceptedFiles[0]);
      uploadImage();
    },
  });

  const uploadImage = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("x-file-name", imageFile.name);

    setLoading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          "x-file-name": imageFile.name,
        },
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      console.log(data);
      setMongoId(data.uuid);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // poll for status every 10 second
  useEffect(() => {
    console.log("===1");
    if (!mongoId) return;

    const poll = async () => {
      console.log("===2poll");
      try {
        const response = await fetch(`/api/transcription?uuid=${mongoId}`);

        if (!response.ok) throw new Error("Failed to get transcription");

        const data = await response.json();
        console.log(data.result.transcription, "*****");

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
  }, [mongoId]);

  return (
    <main className=" px-60">
      <header className="border-2 border-green-300 flex justify-end px-16 py-2">
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

          {selectedImage && (
            <div className=" px-4">
              {imageFile && imageFile.type.startsWith("image/") ? (
                <figure className="border-2 border-red-200 mb-4 w-fit text-center">
                  <Image
                    src={selectedImage}
                    alt="Selected"
                    width={400}
                    height={300}
                  />
                  <figcaption>{imageFile.name}</figcaption>
                </figure>
              ) : (
                <figure className="border-2 border-red-200 mb-4 w-fit text-center">
                  <video
                    src={selectedImage}
                    width={400}
                    height={300}
                    controls
                  />
                  <figcaption className="text-center text-gray-500 font-medium">
                    {imageFile.name}
                  </figcaption>
                </figure>
              )}

              {/* {!loading && !transcription && (
                <button
                  onClick={uploadImage}
                  className="bg-black  text-white py-2 px-12 rounded-md"
                >
                  Upload {imageFile.name}
                </button>
              )} */}

              {loading && !mongoId && (
                <button
                  onClick={uploadImage}
                  className="bg-black  text-white py-2 px-12 rounded-md"
                >
                  Uploading...
                </button>
              )}
              {mongoId && !transcription && (
                <button
                  onClick={uploadImage}
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
