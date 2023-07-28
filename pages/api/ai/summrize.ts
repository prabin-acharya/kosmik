import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const basePromptPrefix =
  "This is a transcription from a video. Summarize important details of this video in 5-10 points. The point should be shot and concide. No need to add context, write points directly.";

const generateAction = async (req: NextApiRequest, res: NextApiResponse) => {
  const transcription = req.body.userInput;
  const context = req.body.context;

  console.log(transcription, context);

  const baseCompletion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${basePromptPrefix}
    Transcription: ${transcription} \n
    Summary in points:`,
    temperature: 0.81,
    max_tokens: 250,
  });

  const basePromptOutput = baseCompletion.data.choices.pop();

  console.log(basePromptOutput, "#################");

  try {
    const client = await clientPromise;
    const db = client.db("gcp-mongo-hackathon-db");
    const collection = db.collection("files");

    const result = await collection.updateOne(
      { uuid: req.body.uuid },
      { $set: { generatedTitle: basePromptOutput.text } }
    );

    console.log(result, "result");
    res.status(200).json({ output: basePromptOutput });
  } catch (err) {
    console.error(err);
    res.status(500).send({
      msg: "error",
      err: err,
    });
  }
  // res.status(200).json({ output: basePromptOutput });
};

export default generateAction;
