import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, text } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Test message: "${text}". Please respond with "Connection successful!" if you can read this.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    return NextResponse.json({
      success: true,
      message: responseText
    });

  } catch (error) {
    console.error('API Test Error:', error);
    return NextResponse.json(
      { error: 'API connection failed' },
      { status: 500 }
    );
  }
}