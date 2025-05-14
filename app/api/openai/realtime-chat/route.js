import { NextResponse } from "next/server";
import OpenAI from "openai";

// Keep only the last N messages to manage context size
const MAX_MESSAGES = 5;

// Rough estimate of tokens per message (4 chars ≈ 1 token)
const estimateTokens = (text) => Math.ceil(text.length / 4);

export async function POST(request) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    const requestData = await request.json();
    const { model, messages, audioData, isAudio } = requestData;

    console.log("Received request:", {
      model,
      isAudio,
      hasAudioData: !!audioData,
    });

    // If this is an audio request, transcribe it first
    if (isAudio && audioData) {
      const audioBuffer = Buffer.from(audioData, "base64");
      const audioBlob = new Blob([audioBuffer], { type: "audio/webm" });

      // Create a File object from the Blob
      const audioFile = new File([audioBlob], "audio.webm", {
        type: "audio/webm",
      });

      const transcription = await client.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
      });

      // Add the transcribed text as a user message
      messages.push({
        role: "user",
        content: transcription.text,
      });
    }

    // Keep only the last N messages and ensure we don't exceed token limits
    let recentMessages = messages.slice(-MAX_MESSAGES);
    let totalTokens = recentMessages.reduce(
      (sum, msg) => sum + estimateTokens(msg.content),
      0
    );

    // If we're still over the limit, keep reducing messages until we're under
    while (totalTokens > 12000 && recentMessages.length > 1) {
      // Leave some room for response
      recentMessages = recentMessages.slice(1);
      totalTokens = recentMessages.reduce(
        (sum, msg) => sum + estimateTokens(msg.content),
        0
      );
    }

    console.log("Starting chat completion...");
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo", // Use GPT-3.5-turbo instead of GPT-4 for higher rate limits
      messages: recentMessages,
      stream: true,
    });

    // Create a new ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = "";
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(new TextEncoder().encode(content));
            }
          }

          // If this was an audio request, generate speech for the response
          if (isAudio) {
            try {
              console.log("Starting text-to-speech conversion...");
              const speechResponse = await client.audio.speech.create({
                model: "tts-1",
                voice: "alloy",
                input: fullResponse,
              });

              const audioBuffer = await speechResponse.arrayBuffer();
              const base64Audio = Buffer.from(audioBuffer).toString("base64");

              // Send a special marker to indicate the end of text and start of audio
              controller.enqueue(new TextEncoder().encode("\n<AUDIO_START>"));
              controller.enqueue(new TextEncoder().encode(base64Audio));
              controller.enqueue(new TextEncoder().encode("\n<AUDIO_END>"));
              console.log("Text-to-speech conversion completed");
            } catch (ttsError) {
              console.error("Text-to-speech error:", ttsError);
              controller.error(
                new Error(`Text-to-speech failed: ${ttsError.message}`)
              );
              return;
            }
          }

          controller.close();
        } catch (error) {
          console.error("Stream processing error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error,
      },
      { status: 500 }
    );
  }
}
