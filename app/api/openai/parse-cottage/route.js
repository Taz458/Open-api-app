import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

export async function POST(request) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORG_ID,
    });

    const requestData = await request.json();
    const { model, input } = requestData;

    const PropertyListing = z.object({
      cottageName: z.string(),
      numberOfGuests: z.number(),
      numberOfBedrooms: z.number(),
      numberOfBathrooms: z.number(),
      allowsPets: z.boolean(),
      keyFeatures: z.array(z.string()),
      marketingCopy: z.string()
    });

    const CalendarEvent = z.object({
      name: z.string(),
      date: z.string(),
      participants: z.array(z.string()),
    });

    const response = await client.responses.parse({
      model: model || "gpt-4o-2024-08-06",
      input: input,
      text: {
        format: zodTextFormat(PropertyListing, "property"),
      },
    });

    return NextResponse.json({ 
      success: true, 
      event: response.output_parsed 
    });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 