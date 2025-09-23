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

// 초등학생 맞춤 문법 규칙 (구체적 예시와 설명)
const grammarRules = [
  // Be동사 + 일반동사 오류
  {
    pattern: /\bi am go\b/gi,
    originalText: 'I am go',
    suggestion: 'I go',
    explanation: '✳️ I am go → ✅ I go\n→ "am"과 "go"를 함께 쓸 수 없어요. "I go" 또는 "I am going"을 사용하세요!'
  },
  {
    pattern: /\bi am study\b/gi,
    originalText: 'I am study',
    suggestion: 'I study',
    explanation: '✳️ I am study → ✅ I study\n→ "am"과 "study"를 함께 쓸 수 없어요. "I study" 또는 "I am studying"을 사용하세요!'
  },

  // 주어-동사 일치 오류
  {
    pattern: /\bhe are\b/gi,
    originalText: 'he are',
    suggestion: 'he is',
    explanation: '✳️ he are → ✅ he is\n→ "he"와 함께 쓸 때는 "is"를 사용해요!'
  },
  {
    pattern: /\bshe are\b/gi,
    originalText: 'she are',
    suggestion: 'she is',
    explanation: '✳️ she are → ✅ she is\n→ "she"와 함께 쓸 때는 "is"를 사용해요!'
  },

  // 단수/복수 오류
  {
    pattern: /\btwo book\b/gi,
    originalText: 'two book',
    suggestion: 'two books',
    explanation: '✳️ two book → ✅ two books\n→ 2개 이상일 때는 복수형 "books"를 써야 해요!'
  },
  {
    pattern: /\bmany book\b/gi,
    originalText: 'many book',
    suggestion: 'many books',
    explanation: '✳️ many book → ✅ many books\n→ "many" 다음에는 복수형을 써야 해요!'
  },

  // want to 구조
  {
    pattern: /\bi want eat\b/gi,
    originalText: 'I want eat',
    suggestion: 'I want to eat',
    explanation: '✳️ I want eat → ✅ I want to eat\n→ "want" 다음에는 "to"가 필요해요!'
  },
  {
    pattern: /\bi want go\b/gi,
    originalText: 'I want go',
    suggestion: 'I want to go',
    explanation: '✳️ I want go → ✅ I want to go\n→ "want" 다음에는 "to"가 필요해요!'
  },

  // 띄어쓰기 오류
  {
    pattern: /,(?!\s)/g,
    originalText: ',',
    suggestion: ', ',
    explanation: '띄어쓰기 & 쉼표 사용\n✳️ apple,banana → ✅ apple, banana\n→ 쉼표(,) 뒤에는 꼭 띄어쓰기를 해줘요.'
  },
  {
    pattern: /\.(?!\s|$)/g,
    originalText: '.',
    suggestion: '. ',
    explanation: '띄어쓰기 & 마침표 사용\n✳️ Hi.How are you? → ✅ Hi. How are you?\n→ 마침표(.) 뒤에는 꼭 띄어쓰기를 해줘요.'
  },

  // 줄임말 오류
  {
    pattern: /\bdont\b/gi,
    originalText: "dont",
    suggestion: "don't",
    explanation: '✳️ dont → ✅ don\'t\n→ 줄임말에는 작은따옴표(\')가 필요해요!'
  },
  {
    pattern: /\bcant\b/gi,
    originalText: "cant",
    suggestion: "can't",
    explanation: '✳️ cant → ✅ can\'t\n→ 줄임말에는 작은따옴표(\')가 필요해요!'
  },

  // 전치사 오류
  {
    pattern: /\bon morning\b/gi,
    originalText: 'on morning',
    suggestion: 'in the morning',
    explanation: '✳️ on morning → ✅ in the morning\n→ "아침에"는 "in the morning"이에요!'
  },
  {
    pattern: /\bat monday\b/gi,
    originalText: 'at Monday',
    suggestion: 'on Monday',
    explanation: '✳️ at Monday → ✅ on Monday\n→ 요일 앞에는 "on"을 사용해요!'
  },

  // 관사 오류
  {
    pattern: /\ba apple\b/gi,
    originalText: 'a apple',
    suggestion: 'an apple',
    explanation: '✳️ a apple → ✅ an apple\n→ 모음소리로 시작하는 단어 앞에는 "an"을 써요!'
  },
  {
    pattern: /\ban book\b/gi,
    originalText: 'an book',
    suggestion: 'a book',
    explanation: '✳️ an book → ✅ a book\n→ 자음소리로 시작하는 단어 앞에는 "a"를 써요!'
  }
];

// 어휘 개선 제안 (구체적 예시와 친절한 설명)
const vocabularyRules = [
  // 기본 형용사 업그레이드
  {
    pattern: /\bgood\b/gi,
    suggestions: ['great', 'excellent', 'wonderful', 'amazing', 'fantastic'],
    explanation: '단어 표현 다듬기\n✳️ This food is good. → ✅ This food is delicious.\n→ "good" 대신 상황에 맞는 더 구체적인 단어를 써보세요! 음식이면 "delicious", 날씨면 "nice", 영화면 "fantastic"!'
  },
  {
    pattern: /\bbig\b/gi,
    suggestions: ['huge', 'enormous', 'large', 'massive'],
    explanation: '크기 표현 업그레이드\n✳️ big house → ✅ huge house / enormous house\n→ "big" 대신 얼마나 큰지 더 정확하게 표현해보세요!'
  },
  {
    pattern: /\bsmall\b/gi,
    suggestions: ['tiny', 'little', 'mini', 'compact'],
    explanation: '크기 표현 업그레이드\n✳️ small cat → ✅ tiny cat / little cat\n→ "small" 대신 더 귀엽고 구체적인 표현을 써보세요!'
  },
  {
    pattern: /\bnice\b/gi,
    suggestions: ['lovely', 'beautiful', 'wonderful', 'pleasant'],
    explanation: '감정 표현 풍부하게\n✳️ nice weather → ✅ beautiful weather\n→ "nice" 대신 무엇이 좋은지 더 구체적으로 표현해보세요!'
  },

  // 동작 동사 개선
  {
    pattern: /\bgo\b/gi,
    suggestions: ['walk', 'travel', 'visit', 'move to'],
    explanation: '동작 표현 구체화\n✳️ I go to school. → ✅ I walk to school. / I travel to Seoul.\n→ "go" 대신 어떻게 가는지 구체적으로 표현해보세요!'
  },
  {
    pattern: /\beat\b/gi,
    suggestions: ['enjoy', 'taste', 'have'],
    explanation: '먹기 표현 다양화\n✳️ I eat pizza. → ✅ I enjoy pizza. / I taste Korean food.\n→ "eat" 대신 더 맛있게 들리는 표현을 써보세요!'
  },
  {
    pattern: /\blike\b/gi,
    suggestions: ['love', 'enjoy', 'prefer', 'adore'],
    explanation: '좋아함 표현 강화\n✳️ I like music. → ✅ I love music. / I enjoy listening to music.\n→ "like" 대신 얼마나 좋아하는지 더 강하게 표현해보세요!'
  },

  // 감정 표현 개선
  {
    pattern: /\bhappy\b/gi,
    suggestions: ['excited', 'delighted', 'joyful', 'thrilled'],
    explanation: '감정 표현 풍부하게\n✳️ I am happy. → ✅ I am excited! / I am thrilled!\n→ "happy" 대신 더 생생한 감정을 표현해보세요!'
  },
  {
    pattern: /\bfun\b/gi,
    suggestions: ['exciting', 'enjoyable', 'interesting', 'entertaining'],
    explanation: '재미 표현 업그레이드\n✳️ This game is fun. → ✅ This game is exciting!\n→ "fun" 대신 어떤 재미인지 더 구체적으로 표현해보세요!'
  },

  // 정도 부사 개선
  {
    pattern: /\bvery\b/gi,
    suggestions: ['extremely', 'really', 'super', 'incredibly'],
    explanation: '강조 표현 다양화\n✳️ very good → ✅ extremely good / really amazing\n→ "very" 대신 더 강한 표현을 써서 글을 생생하게 만들어보세요!'
  },
  {
    pattern: /\ba lot\b/gi,
    suggestions: ['many', 'lots of', 'plenty of', 'numerous'],
    explanation: '수량 표현 정확하게\n✳️ a lot books → ✅ many books / lots of friends\n→ "a lot" 대신 셀 수 있는 것은 "many", 셀 수 없는 것은 "much"를 써보세요!'
  }
];

// 격려 메시지 (구체적이고 따뜻한 피드백)
const praiseMessages = [
  "🎉 잘한 점\n\n영어로 글쓰기에 도전하는 모습이 정말 멋져요! 처음엔 어려워도 계속 연습하면 분명 늘 거예요! 💪",
  "🎉 잘한 점\n\n자신의 생각을 영어로 표현하려고 노력하는 게 훌륭해요! 완벽하지 않아도 괜찮으니까 자신감을 갖고 써보세요! ✨",
  "🎉 잘한 점\n\n문장을 차근차근 만들어가는 모습이 보기 좋아요! 이런 식으로 꾸준히 연습하면 영어 실력이 쑥쑥 늘 거예요! 🌟",
  "🎉 잘한 점\n\n글에 자신만의 생각과 경험이 잘 담겨있어요! 개성 있는 표현이 글을 더 흥미롭게 만들어줘요! 🎨",
  "🎉 잘한 점\n\n새로운 단어에 도전해보는 용기가 멋져요! 틀려도 괜찮으니까 다양한 표현을 시도해보세요! 🚀",
  "🎉 잘한 점\n\n문법을 신경 써서 쓰려는 모습이 대단해요! 이런 꼼꼼함이 실력 향상의 비결이에요! 📚",
  "🎉 잘한 점\n\n글의 내용이 구체적이고 상세해서 읽는 재미가 있어요! 독자를 생각하며 쓴 게 느껴져요! 👀",
  "🎉 잘한 점\n\n문장과 문장 사이의 연결이 자연스러워요! 글의 흐름을 잘 생각해서 썼네요! 🌊"
];

// 구조 개선 제안 (더 정교한 분석)
const structureRules = [
  {
    condition: (text: string) => text.length > 300 && !text.includes('\n') && !text.includes('\r'),
    suggestion: '글이 길어졌네요! 주제별로 문단을 나누어보는 건 어떨까요?',
    explanation: '긴 글은 문단으로 나누면 읽기가 더 쉬워져요!'
  },
  {
    condition: (text: string) => !text.match(/[.!?]/) && text.length > 50,
    suggestion: '마침표(.)나 느낌표(!)를 사용해서 문장을 나누어보세요!',
    explanation: '긴 문장은 마침표로 나누면 더 읽기 좋아요!'
  },
  {
    condition: (text: string) => text.split(' ').length < 15,
    suggestion: '더 자세하게 설명해보면 어떨까요?',
    explanation: '글에 더 많은 내용을 추가하면 더 흥미로워져요!'
  },
  {
    condition: (text: string) => text.split(' ').length > 100,
    suggestion: '정말 길게 잘 썼어요! 중요한 내용을 강조해보면 어떨까요?',
    explanation: '긴 글에서는 핵심 내용을 굵게 하거나 강조하면 좋아요!'
  },
  {
    condition: (text: string) => {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      return sentences.length >= 3 && !text.toLowerCase().includes('first') && !text.toLowerCase().includes('second') && !text.toLowerCase().includes('finally');
    },
    suggestion: '문장을 연결하는 단어를 사용해보세요! "First", "Also", "Finally" 같은 단어들이 도움이 될 거예요.',
    explanation: '연결어를 사용하면 글의 흐름이 더 자연스러워져요!'
  },
  {
    condition: (text: string) => {
      const questionMarks = (text.match(/\?/g) || []).length;
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
      return questionMarks > sentences * 0.5;
    },
    suggestion: '질문이 많네요! 답변도 함께 써보면 더 완성도 높은 글이 될 거예요!',
    explanation: '질문 후에 자신의 생각이나 답을 써주면 글이 더 흥미로워져요!'
  },
  {
    condition: (text: string) => {
      const words = text.split(' ');
      const uniqueWords = new Set(words.map(w => w.toLowerCase()));
      return words.length > 30 && uniqueWords.size / words.length < 0.6;
    },
    suggestion: '같은 단어를 반복해서 쓴 것 같아요. 다양한 표현을 써보면 어떨까요?',
    explanation: '다양한 단어를 사용하면 글이 더 풍부해져요!'
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
      feedback.grammar.push(rule.explanation);
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

  // 고급 문법 체크
  if (!text.match(/[.!?]$/)) {
    feedback.grammar.push('문장 끝에 마침표(.)나 느낌표(!)를 넣어보세요!');
  }

  if (text.charAt(0) !== text.charAt(0).toUpperCase()) {
    feedback.grammar.push('문장의 첫 글자는 대문자로 시작해요!');
  }

  // 문장 시작 후 대문자 체크
  const afterPunctuation = text.match(/[.!?]\s+[a-z]/g);
  if (afterPunctuation) {
    feedback.grammar.push('마침표 다음 문장은 대문자로 시작해야 해요!');
  }

  // 연속 대문자 체크
  if (text.match(/[A-Z]{3,}/)) {
    feedback.grammar.push('너무 많은 대문자는 피하는 게 좋아요. 필요한 곳에만 사용해보세요!');
  }

  // 스펠링 의심 패턴 체크
  const suspiciousWords = ['recieve', 'definately', 'seperate', 'occured', 'neccessary'];
  suspiciousWords.forEach(word => {
    if (text.toLowerCase().includes(word)) {
      const corrections = {
        'recieve': 'receive',
        'definately': 'definitely',
        'seperate': 'separate',
        'occured': 'occurred',
        'neccessary': 'necessary'
      };
      feedback.grammar.push(`"${word}" 스펠링을 확인해보세요! "${corrections[word as keyof typeof corrections]}"가 맞아요.`);
    }
  });

  // 상황별 맞춤 격려 메시지
  let praiseCriteria = '';
  if (feedback.grammar.length === 0) praiseCriteria += 'grammar-good ';
  if (feedback.vocabulary.length > 0) praiseCriteria += 'vocab-trying ';
  if (text.length > 100) praiseCriteria += 'long-text ';
  if (text.split(/[.!?]+/).length > 3) praiseCriteria += 'multi-sentence ';

  // 맞춤 격려 선택
  let selectedPraise;
  if (praiseCriteria.includes('grammar-good') && praiseCriteria.includes('long-text')) {
    selectedPraise = "문법도 정확하고 길게도 잘 썼어요! 정말 대단해요! 🏆";
  } else if (praiseCriteria.includes('vocab-trying')) {
    selectedPraise = "새로운 단어를 시도해보는 게 멋져요! 어휘가 늘고 있어요! 🎯";
  } else if (praiseCriteria.includes('multi-sentence')) {
    selectedPraise = "여러 문장으로 잘 표현했어요! 글의 흐름이 좋아요! 👍";
  } else {
    selectedPraise = praiseMessages[Math.floor(Math.random() * praiseMessages.length)];
  }
  feedback.praise.push(selectedPraise);

  // 피드백이 없으면 더 구체적인 긍정 메시지
  if (feedback.grammar.length === 0 && feedback.vocabulary.length === 0 && feedback.structure.length === 0) {
    feedback.grammar.push('문법이 정말 정확해요! 완벽한 문장들이네요! 👍');
    feedback.vocabulary.push('단어 선택이 적절해요! 어휘 실력이 늘고 있어요! 📚');
    feedback.structure.push('글의 구조가 논리적이에요! 읽기 쉽게 잘 썼어요! 🏗️');
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