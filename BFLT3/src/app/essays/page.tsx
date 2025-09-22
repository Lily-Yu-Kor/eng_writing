'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { BookOpen, PenTool, Eye, Edit, Trash2, Plus, Clock, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// 글 데이터 타입 정의
type Essay = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  characterCount: number;
};

export default function EssaysPage() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [essayToDelete, setEssayToDelete] = useState<Essay | null>(null);
  const { toast } = useToast();

  // 로컬 스토리지에서 글 목록 불러오기
  useEffect(() => {
    const loadEssays = () => {
      try {
        const savedEssays = localStorage.getItem('bflt-essays');
        if (savedEssays) {
          const parsedEssays = JSON.parse(savedEssays).map((essay: any) => ({
            ...essay,
            createdAt: new Date(essay.createdAt),
            updatedAt: new Date(essay.updatedAt)
          }));
          setEssays(parsedEssays.sort((a: Essay, b: Essay) => b.updatedAt.getTime() - a.updatedAt.getTime()));
        }
      } catch (error) {
        console.error('글 목록을 불러오는데 실패했습니다:', error);
      }
    };

    loadEssays();
  }, []);

  // 글 상세 보기
  const handleViewEssay = (essay: Essay) => {
    setSelectedEssay(essay);
    setIsViewDialogOpen(true);
  };

  // 글 삭제
  const handleDeleteEssay = (essay: Essay) => {
    setEssayToDelete(essay);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (essayToDelete) {
      try {
        const updatedEssays = essays.filter(essay => essay.id !== essayToDelete.id);
        setEssays(updatedEssays);
        localStorage.setItem('bflt-essays', JSON.stringify(updatedEssays));

        toast({
          title: "삭제 완료! 🗑️",
          description: "글이 성공적으로 삭제되었어요.",
        });
      } catch (error) {
        toast({
          title: "삭제 실패",
          description: "다시 시도해주세요.",
          variant: "destructive"
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setEssayToDelete(null);
  };

  // 글의 간단한 미리보기 텍스트 생성
  const getPreviewText = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">나의 영어 글 모음</h1>
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-lg text-gray-600">
            지금까지 작성한 영어 글들을 확인하고 관리해보세요! 📚
          </p>

          <Link href="/write">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              새 글 작성하기
            </Button>
          </Link>
        </div>

        {/* 글 목록 */}
        {essays.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <PenTool className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600">아직 작성한 글이 없어요</h3>
                <p className="text-gray-500">첫 번째 영어 글을 작성해보세요!</p>
                <Link href="/write">
                  <Button
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-full"
                  >
                    <PenTool className="w-4 h-4 mr-2" />
                    글쓰기 시작하기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {essays.map((essay) => (
              <Card key={essay.id} className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-start justify-between">
                    <span className="line-clamp-2">{essay.title || '제목 없음'}</span>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {essay.characterCount}자
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{essay.updatedAt.toLocaleDateString()}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {getPreviewText(essay.content)}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleViewEssay(essay)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      보기
                    </Button>
                    <Link href={`/write?edit=${essay.id}`} className="flex-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-blue-200 hover:bg-blue-50"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        수정
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDeleteEssay(essay)}
                      size="sm"
                      variant="outline"
                      className="border-red-200 hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 글 상세 보기 모달 */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            {selectedEssay && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    {selectedEssay.title || '제목 없음'}
                  </DialogTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>작성일: {selectedEssay.createdAt.toLocaleString()}</span>
                    <span>수정일: {selectedEssay.updatedAt.toLocaleString()}</span>
                    <Badge variant="secondary">{selectedEssay.characterCount}자</Badge>
                  </div>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">내용</h4>
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                      {selectedEssay.content}
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <Link href={`/write?edit=${selectedEssay.id}`}>
                      <Button className="bg-blue-500 hover:bg-blue-600">
                        <Edit className="w-4 h-4 mr-2" />
                        수정하기
                      </Button>
                    </Link>
                    <Button
                      onClick={() => setIsViewDialogOpen(false)}
                      variant="outline"
                    >
                      닫기
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* 삭제 확인 모달 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="w-6 h-6 text-red-500" />
                글 삭제 확인
              </DialogTitle>
            </DialogHeader>

            {essayToDelete && (
              <div className="space-y-4">
                <Alert>
                  <AlertDescription>
                    <strong>"{essayToDelete.title || '제목 없음'}"</strong> 글을 정말로 삭제하시겠어요?
                    <br />
                    삭제된 글은 복구할 수 없어요.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-3 justify-end">
                  <Button
                    onClick={confirmDelete}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    삭제하기
                  </Button>
                  <Button
                    onClick={() => setIsDeleteDialogOpen(false)}
                    variant="outline"
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}