import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    const requestData = await request.json();
    const { model, instructions, input, useRoles } = requestData;

    let response;

    if (useRoles) {
      response = await client.chat.completions.create({
        model: model || "gpt-4",
        messages: input,
      });
    } else {
      response = await client.completions.create({
        model: model || "gpt-4",
        prompt: input,
        max_tokens: 1000,
      });
    }

    return NextResponse.json({ success: true, data: response });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 