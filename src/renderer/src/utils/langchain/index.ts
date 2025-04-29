import fs from "fs";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

const visionModel = new ChatGoogleGenerativeAI({
  model: "gemini-pro-vision",
  maxOutputTokens: 2048,
});

const image = fs.readFileSync("./hotdog.jpg").toString("base64");

const input = [
  new HumanMessage({
    content: [
      {
        type: "text",
        text: "Describe the following image.",
      },
      {
        type: "image_url",
        image_url: `data:image/png;base64,${image}`,
      },
    ],
  }),
];

const res = await visionModel.invoke(input);
console.log(res.content);
