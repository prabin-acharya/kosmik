import clientPromise from "@/lib/mongodb";
import vision from "@google-cloud/vision";
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

const client = new vision.ImageAnnotatorClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [result] = await client.textDetection(
    "https://storage.googleapis.com/gcp-mongo-hackathon-docker-videos/ramunjan.png"
  );
  const detections = result.textAnnotations;
  console.log("Text:");
  detections?.forEach((text) => console.log(text));

  let allText = "";
  detections?.forEach((text) => {
    // add space between words
    allText += text.description + " ";
  });

  console.log(allText);

  return NextResponse.json({
    name: "John Doe",
    description: allText,
  });
}
