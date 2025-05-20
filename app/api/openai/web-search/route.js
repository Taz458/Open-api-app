import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const { query, location, contextSize } = await request.json();
    if (!query || typeof query !== "string" || query.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Missing or empty search query." },
        { status: 400 }
      );
    }

    // Map context size to OpenAI's search_context_size
    let search_context_size = "medium";
    if (contextSize === "small") search_context_size = "low";
    if (contextSize === "large") search_context_size = "high";

    // Parse location for OpenAI's user_location fields
    let user_location = undefined;
    if (location && location.trim() !== "") {
      // For demo, just use city. You could parse more fields if needed.
      user_location = { type: "approximate", city: location };
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    const tools = [
      {
        type: "web_search_preview",
        ...(user_location ? { user_location } : {}),
        search_context_size,
      },
    ];

    const response = await client.responses.create({
      model: "gpt-4.1",
      tools,
      input: query,
    });

    // The output is in response.output_text, and citations are in response.content[0].annotations
    return NextResponse.json({
      success: true,
      processed: response.output_text,
      raw: response,
    });
  } catch (error) {
    console.error("Web Search API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message, details: error },
      { status: 500 }
    );
  }
}
