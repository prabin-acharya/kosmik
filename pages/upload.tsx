import Image from "next/image";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadImage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

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

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      headers: {
        "x-file-name": imageFile.name,
      },
    });

    const data = await response.json();

    console.log(data);

    if (response.ok) {
      console.log("Image uploaded successfully");
    } else {
      console.log("Image upload failed");
    }
  };

  return (
    <div>
      <h1>Upload your image</h1>
      <div>
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          <p>Drag and drop some files here, or click to select files</p>
        </div>
        {selectedImage && (
          <>
            {/* <Image
              src={selectedImage}
              alt="Selected"
              width={400}
              height={300}
            />
            <button onClick={uploadImage}>Upload</button> */}
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
            </>
          </>
        )}
      </div>
    </div>
  );
}
