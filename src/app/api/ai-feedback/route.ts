import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Gemini API 키는 환경변수로 안전하게 관리
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const prompt = `당신은 초등학교 6학년 학생의 영어 글쓰기를 도와주는 친절한 선생님입니다.
아래 영어 글을 분석하고 다음과 같은 구체적인 피드백을 한국어로 제공해주세요:

🎉 **잘한 점** (구체적으로 칭찬)
✳️ **고치면 좋은 부분** (문법, 표현, 구조별로 예시와 함께)

학생이 작성한 영어 글:
"${content}"

피드백은 친근하고 격려적인 톤으로 작성하되, 구체적인 개선점을 포함해주세요.
예시:
✳️ I am go → ✅ I go
→ 설명: "am"과 "go"를 함께 쓸 수 없어요.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API Error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get AI feedback' },
        { status: 500 }
      );
    }

    const result = await response.json();

    if (!result.candidates || result.candidates.length === 0) {
      return NextResponse.json(
        { error: 'No feedback generated' },
        { status: 500 }
      );
    }

    const feedback = result.candidates[0]?.content?.parts?.[0]?.text ||
      '피드백을 생성할 수 없습니다. 다시 시도해주세요.';

    return NextResponse.json({
      feedback,
      success: true
    });

  } catch (error) {
    console.error('AI Feedback API Error:', error);
    return NextResponse.json(
      { error: 'AI 피드백 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}