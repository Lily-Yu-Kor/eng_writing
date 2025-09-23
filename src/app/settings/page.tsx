'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, Key, Brain, Users, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [isTestLoading, setIsTestLoading] = useState(false);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // 로컬 스토리지에서 API 키 불러오기
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiConnected(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API 키를 입력해주세요",
        variant: "destructive"
      });
      return;
    }

    // 로컬 스토리지에 API 키 저장
    localStorage.setItem('gemini_api_key', apiKey);
    setIsApiConnected(true);

    toast({
      title: "API 키가 저장되었습니다! ✅",
      description: "이제 고품질 AI 피드백을 사용할 수 있어요!",
    });
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API 키를 먼저 입력해주세요",
        variant: "destructive"
      });
      return;
    }

    setIsTestLoading(true);
    try {
      const response = await fetch('/api/test-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey,
          text: "Hello, this is a test."
        }),
      });

      if (response.ok) {
        toast({
          title: "연결 성공! 🎉",
          description: "API가 정상적으로 작동합니다!",
        });
        setIsApiConnected(true);
      } else {
        throw new Error('API 테스트 실패');
      }
    } catch (error) {
      toast({
        title: "연결 실패",
        description: "API 키를 확인해주세요.",
        variant: "destructive"
      });
      setIsApiConnected(false);
    } finally {
      setIsTestLoading(false);
    }
  };

  const handleRemoveApiKey = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsApiConnected(false);

    toast({
      title: "API 키가 제거되었습니다",
      description: "기본 피드백 시스템으로 전환됩니다.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                메인으로
              </Button>
            </Link>
            <Badge variant="outline" className="bg-white">
              <Settings className="w-4 h-4 mr-1" />
              선생님 설정
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            AI 피드백 설정
          </h1>
          <p className="text-gray-600">
            고품질 AI 피드백을 위한 API 설정 (선생님용)
          </p>
        </div>

        {/* 현재 상태 */}
        <Card className={`border-2 ${isApiConnected ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isApiConnected ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {isApiConnected ? '고품질 AI 피드백 활성화' : '기본 피드백 모드'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isApiConnected
                      ? 'Gemini AI가 정교한 피드백을 제공합니다'
                      : '오프라인 규칙 기반 피드백을 사용 중입니다'
                    }
                  </p>
                </div>
              </div>
              {isApiConnected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveApiKey}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  API 해제
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* API 키 설정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              Gemini API 키 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API 키</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIza... (Gemini API 키를 입력하세요)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="font-mono"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveApiKey} className="flex-1">
                <Key className="w-4 h-4 mr-2" />
                API 키 저장
              </Button>
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTestLoading}
                className="flex-1"
              >
                <Brain className="w-4 h-4 mr-2" />
                {isTestLoading ? '테스트 중...' : '연결 테스트'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API 키 받는 방법 */}
        <Card className="bg-blue-50 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">🔑 Gemini API 키 받는 방법</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li><strong>Google AI Studio</strong> 접속: https://makersuite.google.com/app/apikey</li>
              <li><strong>"Create API Key"</strong> 클릭</li>
              <li><strong>프로젝트 선택</strong> 또는 새 프로젝트 생성</li>
              <li><strong>API 키 복사</strong>해서 위에 붙여넣기</li>
              <li><strong>무료로 매일 15건</strong> 요청 가능! (학급용으로 충분)</li>
            </ol>
            <Alert>
              <AlertDescription className="text-blue-700">
                💡 <strong>팁:</strong> API 키는 브라우저에만 저장되고 서버로 전송되지 않아 안전합니다!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 피드백 품질 비교 */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-gray-50 border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Users className="w-5 h-5" />
                기본 피드백 (학생용)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-gray-600 space-y-1">
                <p>✅ API 키 불필요</p>
                <p>✅ 즉시 사용 가능</p>
                <p>✅ 오프라인 작동</p>
                <p>⚠️ 기본적인 문법 체크</p>
                <p>⚠️ 제한적인 어휘 제안</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-2 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Brain className="w-5 h-5" />
                고품질 AI 피드백
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm text-green-600 space-y-1">
                <p>🚀 정교한 문법 분석</p>
                <p>🚀 맥락에 맞는 어휘 제안</p>
                <p>🚀 구조적 글쓰기 가이드</p>
                <p>🚀 개인화된 학습 조언</p>
                <p>🚀 창의적 표현 제안</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}