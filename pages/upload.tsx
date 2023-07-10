import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadImage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [mongoId, setMongoId] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*,video/*",
    onDrop: (acceptedFiles) => {
      setSelectedImage(URL.createObjectURL(acceptedFiles[0]));
      setImageFile(acceptedFiles[0]);
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
    <div>
      <header>
        <UserButton afterSignOutUrl="/" />
      </header>
      <h1>Upload your image</h1>
      <div>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <p>Drag and drop some files here, or click to select files</p>
        </div>
        {selectedImage && (
          <>
            <>
              {imageFile && imageFile.type.startsWith("image/") ? (
                <Image
                  src={selectedImage}
                  alt="Selected"
                  width={400}
                  height={300}
                />
              ) : (
                <video src={selectedImage} width={400} height={300} controls />
              )}

              <button onClick={uploadImage}>Upload</button>

              {loading && !mongoId && <p>Uploading</p>}
              {mongoId && !transcription && <p>Generating Transcription</p>}
              {transcription && <p>Transcription: {transcription}</p>}
            </>
          </>
        )}
      </div>
    </div>
  );
}
