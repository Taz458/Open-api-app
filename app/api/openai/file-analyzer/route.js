import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");
    const question = data.get("question");

    if (!file || !question) {
      return NextResponse.json({ success: false, error: "Missing file or question" });
    }

    // Save the uploaded file temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempFilePath = `./temp_${file.name}`;
    fs.writeFileSync(tempFilePath, buffer);

    // Upload the file to OpenAI
    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(tempFilePath),
      purpose: "user_data",
    });

    // Now ask question about that file
    const response = await openai.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            { type: "input_file", file_id: uploadedFile.id },
            { type: "input_text", text: question },
          ],
        },
      ],
    });

    // Delete the temp file after uploading
    fs.unlinkSync(tempFilePath);

    return NextResponse.json({ success: true, answer: response.output_text });
  } catch (err) {
    console.error("File analyzer error:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Something went wrong",
    });
  }
}
