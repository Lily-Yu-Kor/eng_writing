// 오프라인 AI 피드백 엔진 - 초등학생용
export type FeedbackItem = {
  type: 'grammar' | 'expression' | 'structure' | 'vocabulary';
  originalText: string;
  suggestion: string;
  explanation: string;
  position?: { start: number; end: number };
};

export type FeedbackResponse = {
  grammar: string[];
  vocabulary: string[];
  structure: string[];
  praise: string[];
};

// 일반적인 문법 오류 패턴
const grammarRules = [
  {
    pattern: /\bi am go\b/gi,
    suggestion: 'I go',
    explanation: '"am"과 "go"를 함께 쓸 수 없어요. "I go" 또는 "I am going"을 사용하세요!'
  },
  {
    pattern: /\bi like very much\b/gi,
    suggestion: 'I like it very much',
    explanation: '"very much"는 보통 문장 끝에 와요. "I like it very much"처럼 써보세요!'
  },
  {
    pattern: /\bhe are\b/gi,
    suggestion: 'he is',
    explanation: '"he"와 함께 쓸 때는 "is"를 사용해요!'
  },
  {
    pattern: /\bshe are\b/gi,
    suggestion: 'she is',
    explanation: '"she"와 함께 쓸 때는 "is"를 사용해요!'
  },
  {
    pattern: /\bdont\b/gi,
    suggestion: "don't",
    explanation: "줄임말에는 작은따옴표(')가 필요해요!"
  },
  {
    pattern: /\bcant\b/gi,
    suggestion: "can't",
    explanation: "줄임말에는 작은따옴표(')가 필요해요!"
  }
];

// 어휘 개선 제안
const vocabularyRules = [
  {
    pattern: /\bgood\b/gi,
    suggestions: ['great', 'excellent', 'wonderful', 'amazing'],
    explanation: '"good" 대신 더 멋진 표현을 써보세요!'
  },
  {
    pattern: /\bbig\b/gi,
    suggestions: ['huge', 'enormous', 'gigantic', 'massive'],
    explanation: '"big" 대신 더 강한 표현을 써보세요!'
  },
  {
    pattern: /\bnice\b/gi,
    suggestions: ['fantastic', 'lovely', 'brilliant', 'awesome'],
    explanation: '"nice" 대신 더 생동감 있는 표현을 써보세요!'
  },
  {
    pattern: /\bfun\b/gi,
    suggestions: ['exciting', 'enjoyable', 'thrilling', 'delightful'],
    explanation: '"fun" 대신 더 구체적인 표현을 써보세요!'
  }
];

// 격려 메시지
const praiseMessages = [
  "정말 잘했어요! 영어로 글을 쓰는 게 쉽지 않은데 열심히 했네요! 🌟",
  "와! 문장을 잘 만들었어요! 계속 연습하면 더 잘할 수 있을 거예요! 💪",
  "영어 글쓰기에 도전하는 모습이 멋져요! 👏",
  "점점 실력이 늘고 있어요! 자신감을 갖고 계속해보세요! ✨",
  "글을 쓰는 노력이 정말 대단해요! 🎉",
  "영어로 자신의 생각을 표현하는 게 훌륭해요! 📝"
];

// 구조 개선 제안
const structureRules = [
  {
    condition: (text: string) => text.length > 200 && !text.includes('\n'),
    suggestion: '글이 길어졌네요! 주제별로 문단을 나누어보는 건 어떨까요?',
    explanation: '긴 글은 문단으로 나누면 읽기가 더 쉬워져요!'
  },
  {
    condition: (text: string) => !text.includes('.') && text.length > 50,
    suggestion: '마침표(.)를 사용해서 문장을 나누어보세요!',
    explanation: '긴 문장은 마침표로 나누면 더 읽기 좋아요!'
  },
  {
    condition: (text: string) => text.split(' ').length < 10,
    suggestion: '더 자세하게 설명해보면 어떨까요?',
    explanation: '글에 더 많은 내용을 추가하면 더 흥미로워져요!'
  }
];

export function analyzeFeedback(text: string): FeedbackResponse {
  const feedback: FeedbackResponse = {
    grammar: [],
    vocabulary: [],
    structure: [],
    praise: []
  };

  if (!text.trim()) {
    return feedback;
  }

  // 문법 검사
  grammarRules.forEach(rule => {
    if (rule.pattern.test(text)) {
      feedback.grammar.push(`${rule.explanation} "${rule.suggestion}"로 바꿔보세요!`);
    }
  });

  // 어휘 검사
  vocabularyRules.forEach(rule => {
    if (rule.pattern.test(text)) {
      const randomSuggestion = rule.suggestions[Math.floor(Math.random() * rule.suggestions.length)];
      feedback.vocabulary.push(`${rule.explanation} "${randomSuggestion}" 같은 단어는 어떨까요?`);
    }
  });

  // 구조 검사
  structureRules.forEach(rule => {
    if (rule.condition(text)) {
      feedback.structure.push(rule.suggestion);
    }
  });

  // 기본 문법 체크
  if (!text.match(/[.!?]$/)) {
    feedback.grammar.push('문장 끝에 마침표(.)나 느낌표(!)를 넣어보세요!');
  }

  if (text.charAt(0) !== text.charAt(0).toUpperCase()) {
    feedback.grammar.push('문장의 첫 글자는 대문자로 시작해요!');
  }

  // 격려 메시지 (항상 포함)
  const randomPraise = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
  feedback.praise.push(randomPraise);

  // 피드백이 없으면 기본 메시지
  if (feedback.grammar.length === 0 && feedback.vocabulary.length === 0 && feedback.structure.length === 0) {
    feedback.grammar.push('문법이 정말 좋아요! 👍');
    feedback.vocabulary.push('단어 선택이 훌륭해요! 📚');
    feedback.structure.push('글의 구조가 잘 짜여있어요! 🏗️');
  }

  return feedback;
}

// 피드백을 FeedbackItem 형태로 변환
export function convertToFeedbackItems(feedback: FeedbackResponse): FeedbackItem[] {
  const items: FeedbackItem[] = [];

  feedback.grammar.forEach(item => {
    items.push({
      type: 'grammar',
      originalText: '',
      suggestion: item,
      explanation: item
    });
  });

  feedback.vocabulary.forEach(item => {
    items.push({
      type: 'vocabulary',
      originalText: '',
      suggestion: item,
      explanation: item
    });
  });

  feedback.structure.forEach(item => {
    items.push({
      type: 'structure',
      originalText: '',
      suggestion: item,
      explanation: item
    });
  });

  feedback.praise.forEach(item => {
    items.push({
      type: 'expression',
      originalText: '',
      suggestion: item,
      explanation: item
    });
  });

  return items;
}