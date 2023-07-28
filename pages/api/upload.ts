import clientPromise from "@/lib/mongodb";
import { getAuth } from "@clerk/nextjs/server";
import { Storage } from "@google-cloud/storage";
import vision from "@google-cloud/vision";
import formidable from "formidable";
import fs from "fs";
import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import { v4 as uuidv4 } from "uuid";
const { DocumentProcessorServiceClient } =
  require("@google-cloud/documentai").v1;

const documentAiClient = new DocumentProcessorServiceClient();

const visionClient = new vision.ImageAnnotatorClient();

const storage = new Storage({
  projectId: "gcp-mongo-hackathon", // Replace with your project ID
  keyFilename: "gcp-mongo-hackathon-key.json", // Replace with the path to your service account key file
});

const bucket = storage.bucket("gcp-mongo-hackathon-docker-cloud-storage"); // Replace with your bucket name

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 100_000_000,
  maxFieldsSize: 10_000_000,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: false,
};

function formidablePromise(
  req: NextApiRequest,
  opts?: Parameters<typeof formidable>[0]
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  return new Promise((accept, reject) => {
    const form = formidable(opts);

    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      return accept({ fields, files });
    });
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log(
      "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++"
    );

    const { fields, files } = await formidablePromise(req, formidableConfig);

    // const file = files.file[0];

    let file: formidable.File | undefined;

    if (Array.isArray(files.file)) {
      // If files.file is an array, get the first element
      file = files.file[0];
    } else {
      // If files.file is a single File object, just use it directly
      file = files.file;
    }

    const uniqueFilename = uuidv4();
    const fileName =
      uniqueFilename + "." + file?.originalFilename?.split(".")[1];

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      try {
        const client = await clientPromise;
        const db = client.db("gcp-mongo-hackathon-db");
        const collection = db.collection("files");

        const { userId } = getAuth(req);

        const fileType = blob.metadata.contentType.split("/")[0];
        console.log(fileType, "fileType");

        if (fileType === "video") {
          const result = await collection.insertOne({
            name: blob.name,
            originalFilename: file?.originalFilename,
            uuid: uniqueFilename,
            contentType: blob.metadata.contentType,
            tags: ["video"],
            url: publicUrl,
            createdAt: new Date(),
            userId: userId,
          });

          console.log(result, "result");

          res.status(200).send({
            url: publicUrl,
            msg: "success! video saved to mongodb",
            result: result,
            uuid: uniqueFilename,
          });
        }

        if (fileType == "image") {
          const [imageTranscription] = await visionClient.textDetection(
            `https://storage.googleapis.com/gcp-mongo-hackathon-docker-cloud-storage/${fileName}`
          );

          const detections = imageTranscription.textAnnotations;

          let allText = "";
          detections?.forEach((text) => {
            allText += text.description + " ";
          });

          const result = await collection.insertOne({
            name: blob.name,
            originalFilename: file?.originalFilename,
            uuid: uniqueFilename,
            contentType: blob.metadata.contentType,
            url: publicUrl,
            tags: ["image"],
            createdAt: new Date(),
            userId: userId,
            transcription: allText,
          });

          res.status(200).send({
            url: publicUrl,
            msg: "success! image saved to mongodb",
            result: result,
            uuid: uniqueFilename,
            transcription: allText,
          });
        }

        if (fileType === "application") {
          const name = `projects/gcp-mongo-hackathon/locations/us/processors/d1f0b009dd94aa77`;
          const [operation] = await documentAiClient.processDocument({
            name,
            document: {
              content: `https://storage.googleapis.com/gcp-mongo-hackathon-docker-cloud-storage/${fileName}`,
              mimeType: blob.metadata.contentType,
            },
          });

          const [response] = await operation.promise();

          const [document] = response?.document?.text?.split(" ");

          console.log(
            "+++++^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"
          );
          console.log(document);

          const result = await collection.insertOne({
            name: blob.name,
            originalFilename: file?.originalFilename,
            uuid: uniqueFilename,
            contentType: blob.metadata.contentType,
            url: publicUrl,
            tags: ["document"],
            createdAt: new Date(),
            userId: userId,
            transcription: document,
          });

          res.status(200).send({
            url: publicUrl,
            msg: "success! document saved to mongodb",
            result: result,
            uuid: uniqueFilename,
            transcription: document,
          });
        }
      } catch (err) {
        console.error(err, "---------------------------------------1");
        return res
          .status(500)
          .json({ error: "Internal Server Error. Could not save to MongoDB" });
      }
    });

    // Create a read stream from the temporary file and pipe it to the blobStream
    fs.createReadStream(file.filepath).pipe(blobStream);

    // return res.status(200).json({ fields, files, msg: "success" });
  } catch (err) {
    console.error(err, "---------------------------------------2");
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
