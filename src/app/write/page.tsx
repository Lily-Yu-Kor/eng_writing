'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Save, Sparkles, BookOpen, Brain, CheckCircle, Lightbulb, Target, List, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { analyzeFeedback, convertToFeedbackItems, type FeedbackItem } from '@/lib/feedbackEngine';

// 글 데이터 타입 정의
type Essay = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  characterCount: number;
};

function WritePageContent() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEssayId, setCurrentEssayId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const { toast } = useToast();

  // 수정 모드에서 기존 글 불러오기
  useEffect(() => {
    if (editId) {
      const loadEssayForEdit = () => {
        try {
          const savedEssays = localStorage.getItem('bflt-essays');
          if (savedEssays) {
            const essays: Essay[] = JSON.parse(savedEssays);
            const essayToEdit = essays.find(essay => essay.id === editId);
            if (essayToEdit) {
              setTitle(essayToEdit.title);
              setContent(essayToEdit.content);
              setCurrentEssayId(essayToEdit.id);
              setIsEditMode(true);
              toast({
                title: "수정 모드 ✏️",
                description: "기존 글을 불러왔어요. 자유롭게 수정해보세요!",
              });
            }
          }
        } catch (error) {
          console.error('글을 불러오는데 실패했습니다:', error);
          toast({
            title: "불러오기 실패",
            description: "글을 불러올 수 없어요.",
            variant: "destructive"
          });
        }
      };
      loadEssayForEdit();
    }
  }, [editId, toast]);

  // 자동 저장 기능 (3초마다)
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (title.trim() || content.trim()) {
        handleAutoSave();
      }
    }, 3000);

    return () => clearTimeout(autoSave);
  }, [title, content]);

  const handleAutoSave = async () => {
    if (!title.trim() && !content.trim()) return;

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // 저장 시뮬레이션
      saveEssayToStorage();
      setLastSaved(new Date());
    } catch (error) {
      console.error('자동 저장 실패:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 로컬 스토리지에 글 저장
  const saveEssayToStorage = () => {
    try {
      const savedEssays = localStorage.getItem('bflt-essays');
      const essays: Essay[] = savedEssays ? JSON.parse(savedEssays) : [];

      const now = new Date();
      const essayData: Essay = {
        id: currentEssayId || generateId(),
        title: title.trim() || '제목 없음',
        content: content,
        createdAt: currentEssayId ? essays.find(e => e.id === currentEssayId)?.createdAt || now : now,
        updatedAt: now,
        characterCount: content.length
      };

      if (currentEssayId) {
        // 기존 글 업데이트
        const index = essays.findIndex(essay => essay.id === currentEssayId);
        if (index !== -1) {
          essays[index] = essayData;
        }
      } else {
        // 새 글 추가
        essays.push(essayData);
        setCurrentEssayId(essayData.id);
      }

      localStorage.setItem('bflt-essays', JSON.stringify(essays));
    } catch (error) {
      console.error('저장 실패:', error);
      throw error;
    }
  };

  // 고유 ID 생성
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleManualSave = async () => {
    if (!title.trim() && !content.trim()) {
      toast({
        title: "저장할 내용이 없어요",
        description: "제목이나 내용을 작성해주세요!",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      saveEssayToStorage();
      setLastSaved(new Date());

      toast({
        title: "저장 완료! 🎉",
        description: isEditMode ? "글이 성공적으로 수정되었어요!" : "글이 성공적으로 저장되었어요!",
      });
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // AI 피드백 분석 함수 (모의 데이터)
  const analyzeText = async () => {
    if (!content.trim()) {
      toast({
        title: "분석할 내용이 없어요",
        description: "먼저 글을 작성해주세요!",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      // 1. 우선 서버-side Gemini API 시도 (환경변수 기반)
      try {
        const response = await fetch('/api/ai-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (response.ok) {
          const data = await response.json();

          // 서버-side AI 피드백을 표시 (원본 텍스트로)
          const aiFeedback: FeedbackItem[] = [
            {
              type: 'expression' as const,
              originalText: '',
              suggestion: data.feedback,
              explanation: data.feedback
            }
          ];

          setFeedback(aiFeedback);
          setIsDialogOpen(true);
          toast({
            title: "실시간 AI 분석 완료! 🚀",
            description: "Gemini AI가 상세한 피드백을 제공했어요!",
          });
          return;
        }
      } catch (apiError) {
        console.log('Server-side API failed, using offline feedback...');
      }

      // 2. 폴백: 기본 오프라인 피드백 사용
      await new Promise(resolve => setTimeout(resolve, 1000));

      const feedbackData = analyzeFeedback(content);
      const feedbackItems = convertToFeedbackItems(feedbackData);

      setFeedback(feedbackItems);
      setIsDialogOpen(true);

      toast({
        title: "기본 피드백 제공 📚",
        description: "오프라인 AI가 글을 분석했어요. 피드백을 확인해보세요!",
      });

    } catch (error) {
      // 최종 폴백: 기본 피드백
      const feedbackData = analyzeFeedback(content);
      const feedbackItems = convertToFeedbackItems(feedbackData);
      setFeedback(feedbackItems);
      setIsDialogOpen(true);

      toast({
        title: "기본 피드백 제공",
        description: "네트워크 오류로 오프라인 피드백을 사용합니다.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 피드백 적용 함수
  const applyFeedback = (feedbackItem: FeedbackItem) => {
    if (feedbackItem.originalText && feedbackItem.suggestion) {
      const newContent = content.replace(feedbackItem.originalText, feedbackItem.suggestion);
      setContent(newContent);
      toast({
        title: "피드백 적용됨! ✨",
        description: "글이 더 좋아졌어요!",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between">
            <Link href="/essays">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                글 목록
              </Button>
            </Link>

            <div className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-800">
                {isEditMode ? '글 수정하기' : '영어 글쓰기 친구'}
              </h1>
              <Sparkles className="w-8 h-8 text-yellow-500" />
            </div>

            <Link href="/essays">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                내 글 모음
              </Button>
            </Link>
          </div>
          <p className="text-lg text-gray-600">
            {isEditMode ? '글을 자유롭게 수정해보세요! ✏️' : '우리나라나 좋아하는 것을 영어로 소개해보세요! ✨'}
          </p>
        </div>

        {/* 메인 글쓰기 카드 */}
        <Card className="shadow-lg border-2 border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <CardTitle className="text-xl flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              나의 영어 소개글
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* 제목 입력 */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-semibold text-gray-700">
                제목 (Title) 📝
              </Label>
              <Input
                id="title"
                placeholder="예: My Favorite Korean Food / About Seoul"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg p-4 border-2 border-gray-200 focus:border-blue-400 rounded-lg"
              />
            </div>

            {/* 본문 입력 */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg font-semibold text-gray-700">
                내용 (Content) ✍️
              </Label>
              <Textarea
                id="content"
                placeholder="영어로 자유롭게 써보세요!
예시:
Korea is a beautiful country in Asia.
I love Korean food, especially kimchi and bulgogi.
Seoul is the capital city of Korea..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] text-base p-4 border-2 border-gray-200 focus:border-blue-400 rounded-lg resize-none"
                rows={12}
              />
            </div>

            {/* 글자 수 표시 */}
            <div className="text-sm text-gray-500 text-right">
              글자 수: {content.length}자
            </div>

            {/* 저장 및 AI 피드백 버튼 */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-500">
                {lastSaved && (
                  <span>✅ 마지막 저장: {lastSaved.toLocaleTimeString()}</span>
                )}
                {isSaving && (
                  <span className="text-blue-600">💾 저장 중...</span>
                )}
                {isAnalyzing && (
                  <span className="text-purple-600">🧠 AI 분석 중...</span>
                )}
              </div>
              <div className="flex gap-3">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={analyzeText}
                      disabled={isAnalyzing || !content.trim()}
                      size="lg"
                      variant="outline"
                      className="px-6 py-3 rounded-full font-semibold border-2 border-purple-300 hover:bg-purple-50"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {isAnalyzing ? 'AI 분석 중...' : 'AI 피드백 받기'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
                    <DialogHeader>
                      <DialogTitle className="text-xl flex items-center gap-2">
                        <Brain className="w-6 h-6 text-purple-600" />
                        AI 선생님의 피드백 ✨
                      </DialogTitle>
                    </DialogHeader>

                    <Tabs defaultValue="grammar" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="grammar" className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          문법
                        </TabsTrigger>
                        <TabsTrigger value="expression" className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          표현
                        </TabsTrigger>
                        <TabsTrigger value="structure" className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          구조
                        </TabsTrigger>
                        <TabsTrigger value="vocabulary" className="flex items-center gap-1">
                          <Lightbulb className="w-4 h-4" />
                          어휘
                        </TabsTrigger>
                      </TabsList>

                      {['grammar', 'expression', 'structure', 'vocabulary'].map((type) => (
                        <TabsContent key={type} value={type} className="space-y-4 mt-4">
                          {feedback
                            .filter(item => item.type === type)
                            .map((item, index) => (
                              <Alert key={index} className="border-l-4 border-l-blue-400">
                                <AlertDescription className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      {item.originalText && (
                                        <div className="mb-2">
                                          <Badge variant="destructive" className="mb-1">수정 필요</Badge>
                                          <p className="text-sm bg-red-50 p-2 rounded italic">
                                            "{item.originalText}"
                                          </p>
                                        </div>
                                      )}

                                      <div className="mb-2">
                                        <Badge variant="secondary" className="mb-1 bg-green-100 text-green-800">추천</Badge>
                                        <p className="text-sm bg-green-50 p-2 rounded font-medium">
                                          {item.suggestion}
                                        </p>
                                      </div>

                                      <div className="mb-3">
                                        <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                          💡 <strong>설명:</strong> {item.explanation}
                                        </p>
                                      </div>
                                    </div>

                                    {item.originalText && (
                                      <Button
                                        onClick={() => applyFeedback(item)}
                                        size="sm"
                                        className="ml-3 bg-green-500 hover:bg-green-600"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        적용
                                      </Button>
                                    )}
                                  </div>
                                </AlertDescription>
                              </Alert>
                            ))}
                          {feedback.filter(item => item.type === type).length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                              <p>이 부분은 완벽해요! 👏</p>
                            </div>
                          )}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={handleManualSave}
                  disabled={isSaving}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-semibold"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? '저장 중...' : '저장하기'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 도움말 카드 */}
        <Card className="bg-yellow-50 border-2 border-yellow-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              글쓰기 & AI 피드백 가이드
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">✍️ 글쓰기 팁</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 간단한 문장부터 시작해보세요!</li>
                  <li>• 자신이 알고 있는 단어를 사용하세요</li>
                  <li>• 글이 자동으로 저장되니까 걱정하지 마세요</li>
                  <li>• 완벽하지 않아도 괜찮아요! 🌟</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-800 mb-2">🤖 AI 피드백 활용법</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 글을 다 쓴 후 "AI 피드백 받기" 클릭</li>
                  <li>• 문법, 표현, 구조, 어휘별로 확인</li>
                  <li>• "적용" 버튼으로 쉽게 수정 가능</li>
                  <li>• AI 선생님이 친절하게 설명해줘요! 📚</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <WritePageContent />
    </Suspense>
  );
}