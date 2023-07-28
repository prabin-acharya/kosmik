import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

const updateDetails = async (req: NextApiRequest, res: NextApiResponse) => {
  const uuid = req.body.uuid;
  const title = req.body.title;
  const tags: string = req.body.tags;
  const tagsArray = tags.split(",").map((tag) => tag.trim());

  try {
    const client = await clientPromise;
    const db = client.db("gcp-mongo-hackathon-db");
    const collection = db.collection("files");

    const result = await collection.updateOne(
      { uuid: uuid },
      {
        $set: {
          generatedTitle: title,
          tags: tagsArray,
        },
      }
    );

    res.status(200).json({ output: result });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      msg: "error",
      err: err,
    });
  }
  // res.status(200).json({ output: basePromptOutput });
};

export default updateDetails;
