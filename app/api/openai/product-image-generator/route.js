import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    const requestData = await request.json();
    const { name, category, features, personality, platform } = requestData;

    // Build a DALL-E prompt based on product details and platform
    let style = "";
    switch (platform) {
      case "website":
        style =
          "clean, professional, high-resolution product photo, white background";
        break;
      case "social":
        style =
          "vibrant, eye-catching, Instagram style, colorful background, trendy";
        break;
      case "email":
        style = "inviting, modern, lifestyle context, soft lighting";
        break;
      default:
        style = "high-quality product image";
    }
    const prompt = `A ${personality.toLowerCase()} style image of a product named ${name}, category: ${category}, features: ${features.join(
      ", "
    )}. ${style}.`;

    const response = await client.images.generate({
      model: "dall-e-2",
      prompt,
      n: 1,
      size: "512x512",
    });

    const imageUrl = response.data[0]?.url;
    return NextResponse.json({ success: true, url: imageUrl });
  } catch (error) {
    console.error("Product Image Generator API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
