import clientPromise from "@/lib/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

const basePromptPrefix =
  "For the given transcription and context write a suitable title. The title should be short and concise.";

const generateAction = async (req: NextApiRequest, res: NextApiResponse) => {
  const transcription = req.body.userInput;
  const context = req.body.context;
  const uuid = req.body.uuid;

  console.log(
    transcription,
    context,
    req.body.uuid,
    "_----------------------------"
  );

  const baseCompletion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${basePromptPrefix}
    Transcription: ${transcription} \n
    Context: ${context} \n$
    Title:`,
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
      { uuid: uuid },
      { $set: { generatedTitle: basePromptOutput.text } }
    );

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
