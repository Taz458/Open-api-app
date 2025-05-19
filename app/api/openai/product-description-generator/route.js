import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    const requestData = await request.json();
    const { name, category, features, audience, price, personality, formats } =
      requestData;

    // Helper to build prompts for each format
    const buildPrompt = (format) => {
      let base = `Product Name: ${name}\nCategory: ${category}\nKey Features: ${features.join(
        ", "
      )}\nTarget Audience: ${audience}\nPrice Point: ${price}\nBrand Personality/Tone: ${personality}\n`;
      switch (format) {
        case "website":
          return `${base}\nWrite a detailed, engaging website product description in a ${personality.toLowerCase()} tone. Use paragraphs, highlight key features, and end with a call to action.`;
        case "social":
          return `${base}\nWrite a short, catchy Instagram post in a ${personality.toLowerCase()} tone. Use emojis, line breaks, and include 3-5 relevant hashtags. Keep it under 50 words.`;
        case "email":
          return `${base}\nWrite a medium-length email marketing copy in a ${personality.toLowerCase()} tone. Start with a hook, describe the product, and end with a strong call to action. Use short paragraphs and a subject line.`;
        default:
          return base;
      }
    };

    const results = {};
    for (const format of formats) {
      const prompt = buildPrompt(format);
      const response = await client.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a marketing copywriter." },
          { role: "user", content: prompt },
        ],
        max_tokens: 600,
      });
      results[format] = response.choices[0].message.content;
    }

    return NextResponse.json({ success: true, content: results });
  } catch (error) {
    console.error("Product Description Generator API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
