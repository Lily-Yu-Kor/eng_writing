'use client';

import { Button } from '@/components/ui/button';
import { Sparkles, BookOpen, PenTool, List } from 'lucide-react';
import React from 'react';
import Link from 'next/link';

export default function Home() {

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Main Content */}
      <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="flex flex-col p-5 md:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <BookOpen className="w-12 h-12 text-blue-600" />
            <div>
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter !leading-tight text-left text-gray-800">
                초등학생 영어
                <br /> 글쓰기 도우미
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                재미있게 영어 글쓰기를 배워보세요! ✨
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 w-fit rounded-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
            >
              <Link href="/write">
                <PenTool className="w-5 h-5" />
                글쓰기 시작하기
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 w-fit rounded-full px-4 py-3 border-2 border-green-300 hover:bg-green-50"
            >
              <Link href="/essays">
                <List className="w-4 h-4" />
                내 글 모음
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 w-fit rounded-full px-4 py-3 border-2 border-blue-300 hover:bg-blue-50"
            >
              <a href="#features">
                <Sparkles className="w-4 h-4" />
                기능 알아보기
              </a>
            </Button>
          </div>
          <Section />
        </div>
      </div>

    </div>
  );
}

function Section() {
  const features = [
    { icon: '✍️', label: '쉬운 글쓰기 화면' },
    { icon: '🤖', label: 'AI 피드백 시스템' },
    { icon: '📝', label: '문법/표현 개선' },
    { icon: '📚', label: '글 저장 및 관리' },
    { icon: '💾', label: '자동 저장 기능' },
    { icon: '🌟', label: '초등학생 맞춤' },
  ];

  return (
    <div id="features" className="flex flex-col py-5 md:py-8 space-y-4">
      <p className="font-bold text-xl text-gray-800">🌟 주요 기능</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-blue-100">
            <span className="text-2xl">{feature.icon}</span>
            <span className="font-medium text-gray-700">{feature.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-800">
          💡 <strong>목표:</strong> 초등학교 6학년 학생들이 재미있게 영어 글쓰기를 배우고 자신감을 기를 수 있도록 도와드려요!
        </p>
      </div>
    </div>
  );
}

