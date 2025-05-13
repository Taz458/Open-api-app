import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

export async function POST(request) {
  try {
    const { text } = await request.json();
    if (!text) {
      return new Response(
        JSON.stringify({ success: false, error: "No text provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    const ttsResponse = await client.audio.speech.create({
      model: "tts-1",
      input: text,
      voice: "alloy", // You can allow user to select voice if desired
      response_format: "mp3",
    });

    const audioBuffer = Buffer.from(await ttsResponse.arrayBuffer());
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="speech.mp3"',
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
