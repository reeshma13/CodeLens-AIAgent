process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import Groq from "groq-sdk";
import * as dotenv from "dotenv";
dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

async function explainWithGroq(
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

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: 1024,
  });

  return response.choices[0]?.message?.content || "No response";
}

export { explainWithGroq };