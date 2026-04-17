import * as dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
  );
  const data = await response.json() as { 
    models: Array<{ 
      name: string; 
      supportedGenerationMethods: string[] 
    }> 
  };
  
  console.log("📋 Models supporting generateContent:\n");
  
  data.models.forEach((model) => {
    if (model.supportedGenerationMethods.includes("generateContent")) {
      console.log(`✅ ${model.name}`);
    }
  });
}

listModels();