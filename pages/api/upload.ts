import { Storage } from "@google-cloud/storage";
import formidable from "formidable";
import fs from "fs";
import { NextApiRequest, NextApiResponse, PageConfig } from "next";

const storage = new Storage({
  projectId: "gcp-mongo-hackathon", // Replace with your project ID
  keyFilename: "gcp-mongo-hackathon-key.json", // Replace with the path to your service account key file
});

const bucket = storage.bucket("gcp-mongo-hackathon-docker-cloud-storage"); // Replace with your bucket name

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000,
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

    console.log(file.originalFilename, file.filepath, "file");

    // Create a new blob in the bucket and upload the file data
    const fileName = file.originalFilename.split(".")[0] + file.newFilename;
    const blob = bucket.file(fileName);
    const blobStream = blob.createWriteStream();

    blobStream.on("error", (err) => {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    });

    blobStream.on("finish", () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      res.status(200).send({ url: publicUrl, msg: "success" });
    });

    // blobStream.end(file.data);
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
