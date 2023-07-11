import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const uuid = req.query.uuid as string;

  try {
    const client = await clientPromise;
    const db = client.db("gcp-mongo-hackathon-db");
    const collection = db.collection("files");

    const result = await collection.findOne({ uuid: uuid });

    console.log(result, "result");

    res.status(200).send({
      msg: "success! generated transcription",
      result: result,
    });
  } catch (err) {
    console.error(err);

    res.status(500).send({
      msg: "error",
      err: err,
    });
  }

  return res.status(500).json({ error: "Internal Server Error pap ppap papp" });
}
