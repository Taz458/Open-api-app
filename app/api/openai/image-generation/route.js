import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    const {
      prompt,
      size = "1024x1024",
      outputFormat = "jpeg",
    } = await request.json();

    // DALL·E 2 supports only these sizes
    const allowedSizes = ["256x256", "512x512", "1024x1024"];
    const safeSize = allowedSizes.includes(size) ? size : "1024x1024";

    // DALL·E 2 does not support quality or hd/standard
    const result = await client.images.generate({
      model: "dall-e-2",
      prompt,
      size: safeSize,
      response_format: "b64_json",
    });

    const imageBase64 = result.data[0].b64_json;
    const mimeType =
      outputFormat === "png"
        ? "image/png"
        : outputFormat === "webp"
        ? "image/webp"
        : "image/jpeg";
    const imageUrl = `data:${mimeType};base64,${imageBase64}`;

    return NextResponse.json({ success: true, data: { imageUrl } });
  } catch (error) {
    console.error("OpenAI Image API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
