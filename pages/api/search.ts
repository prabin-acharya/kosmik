import clientPromise from "@/lib/mongodb";
import { getAuth } from "@clerk/nextjs/server";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("+++++++++++++______________++++++++++++++++++++++++++++");

  const searchQuery = req.query.search as string;

  const { userId } = getAuth(req);

  try {
    const client = await clientPromise;
    const db = client.db("gcp-mongo-hackathon-db");
    const collection = db.collection("files");

    const aggregate = [
      {
        $search: {
          index: "transcriptionSearch",
          text: {
            query: searchQuery,
            path: {
              wildcard: "*",
            },
          },
        },
      },
      {
        $match: {
          userId: userId,
        },
      },
      {
        $project: {
          _id: 0,
          score: { $meta: "searchScore" },
          document: "$$ROOT",
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
    ];

    const result = await collection.aggregate(aggregate).toArray();

    //   search
    // const result = await collection
    //   .find({ $text: { $search: searchQuery } })
    //   .project({ score: { $meta: "textScore" }, _id: 0 })
    //   .sort({ score: { $meta: "textScore" } })
    //   .toArray();

    //   .sort({ createdAt: -1 })

    console.log(result, "result");

    res.status(200).send({
      msg: "seatch results",
      result: result,
    });
  } catch (err) {
    console.error(err);

    res.status(500).send({
      msg: "error",
      err: err,
    });
  }

  //   return res.status(500).json({ error: "Internal Server Error pap ppap papp" });
}
