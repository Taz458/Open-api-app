import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { imageUrl, question } = await req.json();

    if (!imageUrl || !question) {
      return NextResponse.json({ success: false, error: "Missing input" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: question },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const answer = response.choices[0]?.message?.content || "No response";

    return NextResponse.json({ success: true, answer });
  } catch (err) {
    console.error("Image analyzer error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Something went wrong",
    });
  }
}
