import { OpenAI } from "openai";

const openai = new OpenAI();

export async function POST(req) {
  const { messages } = await req.json();

  // Create a new ReadableStream to stream tokens to the client
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Call OpenAI's chat.completions with streaming enabled
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          stream: true,
        });

        // For each streamed token, enqueue the text into the stream
        for await (const part of response) {
          const text = part.choices[0].delta?.content;
          if (text) {
            // Convert string to Uint8Array and enqueue
            controller.enqueue(new TextEncoder().encode(text));
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  // Return the streaming response as text/event-stream
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
