import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// We use gemini-2.0-flash — fast and smart
// Perfect for code explanation
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

async function explainWithGemini(
  question: string,
  relevantChunks: string[]
): Promise<string> {

  const prompt = `
You are ISKANDA — an expert AI software engineer 
with deep knowledge of any codebase.

You have been given relevant parts of a codebase 
to answer the developer's question.

=== RELEVANT CODE FROM CODEBASE ===
${relevantChunks.map((chunk, i) => `
--- Code Section ${i + 1} ---
${chunk}
`).join("\n")}
=== END OF CODE ===

=== DEVELOPER'S QUESTION ===
${question}
=== END OF QUESTION ===

Instructions:
- Explain clearly like a senior developer
- Reference specific files and line numbers
- Use simple language
- If the answer is not in the provided code, say so honestly
- Format your answer with clear sections if needed

Your explanation:
  `.trim();

  // Retry up to 3 times if rate limited
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      if (error.status === 429 && attempt < 3) {
        const waitTime = 60; // wait 60 seconds
        console.log(`⏳ Rate limited. Waiting ${waitTime}s before retry ${attempt}/3...`);
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
      } else {
        throw error;
      }
    }
  }

  return "Sorry, ISKANDA could not get a response after 3 attempts.";
}

export { explainWithGemini };
/* 

**🧠 Why this prompt works:**

1. Role setting
   "You are ISKANDA — expert AI software engineer"
   → Gemini adopts the right persona
   → Answers like a senior dev, not a student

2. Context injection
   "Here are relevant code sections"
   → Gemini only sees RELEVANT code
   → Not the entire codebase
   → Focused, accurate answers

3. Clear question
   "Developer's question: ..."
   → No ambiguity about what to answer

4. Instructions
   "Reference specific files and line numbers"
   → Forces Gemini to be specific
   → Not vague generic answers

5. Honesty instruction
   "If answer not in code, say so"
   → Prevents hallucination
   → ISKANDA won't make things up */