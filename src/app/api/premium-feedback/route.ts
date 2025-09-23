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

    const prompt = `당신은 초등학교 6학년 학생의 영어 글쓰기를 도와주는 전문 영어 선생님입니다.
학생이 작성한 영어 글을 정밀하게 분석하고 다음과 같은 고품질 피드백을 제공해주세요:

1. **문법 분석**: 문법 오류를 정확히 찾아 구체적인 수정 방법 제시
2. **어휘 개선**: 더 적절하고 풍부한 어휘 제안 (학생 수준에 맞게)
3. **문장 구조**: 문장의 흐름과 연결을 개선하는 방법
4. **내용 발전**: 글의 내용을 더 풍부하게 만드는 구체적 제안
5. **격려**: 잘한 부분을 구체적으로 칭찬하고 동기부여

피드백은 초등학생이 이해할 수 있도록 친근하고 격려적인 톤으로 작성해주세요.
JSON 형태로만 응답하되, 다음 구조를 정확히 따라주세요:

{
  "grammar": [
    "구체적인 문법 오류와 수정 방법을 자세히 설명"
  ],
  "vocabulary": [
    "더 좋은 어휘나 표현 제안과 그 이유"
  ],
  "structure": [
    "문장 구조나 글의 흐름 개선 제안"
  ],
  "content": [
    "내용을 더 풍부하게 만드는 구체적 제안"
  ],
  "praise": [
    "잘한 부분에 대한 구체적이고 따뜻한 격려"
  ]
}

분석할 학생의 글:
"${text}"

위 글을 꼼꼼히 분석하여 학생이 영어 실력을 향상시킬 수 있도록 도와주세요.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const responseText = response.text();

    // JSON 파싱 시도
    try {
      // 응답에서 JSON 부분만 추출
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const feedback = JSON.parse(jsonMatch[0]);
        return NextResponse.json(feedback);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      // JSON 파싱 실패 시 기본 구조로 응답
      return NextResponse.json({
        grammar: ["고품질 문법 분석: " + responseText.slice(0, 150) + "..."],
        vocabulary: ["어휘 개선 제안을 확인해보세요!"],
        structure: ["문장 구조 개선 방법을 생각해보세요!"],
        content: ["내용을 더 풍부하게 만들어보세요!"],
        praise: ["정말 열심히 글을 썼네요! AI가 더 자세한 피드백을 준비했어요! 🌟"]
      });
    }

  } catch (error) {
    console.error('Premium Feedback Error:', error);
    return NextResponse.json(
      { error: 'Failed to get premium feedback' },
      { status: 500 }
    );
  }
}