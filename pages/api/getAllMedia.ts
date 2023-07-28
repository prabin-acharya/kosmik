import clientPromise from "@/lib/mongodb";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse, PageConfig } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("__++++");

  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("gcp-mongo-hackathon-db");
    const collection = db.collection("files");

    const result = await collection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
