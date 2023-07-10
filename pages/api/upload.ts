import clientPromise from "@/lib/mongodb";
import { Storage } from "@google-cloud/storage";
import formidable from "formidable";
import fs from "fs";
import { NextApiRequest, NextApiResponse, PageConfig } from "next";
import { v4 as uuidv4 } from "uuid";

type ConnectionStatus = {
  isConnected: boolean;
};

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
    const { fields, files } = await formidablePromise(req, formidableConfig);

    const file = files.file[0];

    const uniqueFilename = uuidv4();

    // Create a new blob in the bucket and upload the file data
    const fileName =
      file.originalFilename.split(".")[0] +
      "-" +
      uniqueFilename +
      "." +
      file.originalFilename.split(".")[1];

    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    });

    blobStream.on("finish", async () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      // save to mongodb
      try {
        const client = await clientPromise;
        const db = client.db("gcp-mongo-hackathon-db");

        console.log("$$$$$$$$$$$$$", blob.name);

        const collection = db.collection("images");

        const result = await collection.insertOne({
          name: file.originalFilename,
          url: publicUrl,
          createdAt: new Date(),
        });

        console.log(result, "result");

        res
          .status(200)
          .send({ url: publicUrl, msg: "success! saved to mongodb" });
      } catch (err) {
        console.error(err);
        return res
          .status(500)
          .json({ error: "Internal Server Error. Could not save to MongoDB" });
      }
    });

    // Create a read stream from the temporary file and pipe it to the blobStream
    fs.createReadStream(file.filepath).pipe(blobStream);

    // return res.status(200).json({ fields, files, msg: "success" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};
