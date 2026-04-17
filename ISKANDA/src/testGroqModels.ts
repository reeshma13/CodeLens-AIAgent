process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import Groq from "groq-sdk";
import * as dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

async function listModels() {
  const models = await groq.models.list();
  
  console.log("📋 Available Groq models:\n");
  models.data.forEach((model) => {
    console.log(`✅ ${model.id}`);
  });
}

listModels();