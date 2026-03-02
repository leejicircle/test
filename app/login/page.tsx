/**
 * login/page.tsx - OAuth 로그인 페이지
 *
 * Google과 Naver 소셜 로그인 버튼을 제공하는 페이지입니다.
 * NextAuth의 `signIn` 서버 액션을 사용하여 OAuth 플로우를 시작합니다.
 * Designer 에이전트의 디자인 명세를 따릅니다:
 * - 중앙 정렬 카드 레이아웃, max-w-sm
 * - 각 프로바이더 공식 브랜드 색상 사용
 * - 반응형 및 다크 모드 호환
 *
 * 서버 컴포넌트입니다 — 로그인 버튼은 NextAuth의 `signIn` 함수를
 * 사용하는 폼 액션으로 구성되어 클라이언트 측 JavaScript가 불필요합니다.
 */

import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 font-sans dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        {/* 로그인 카드 */}
        <div className="rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-900">
          {/* 헤더 영역 - 환영 메시지 */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              환영합니다
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              계속하려면 로그인하세요
            </p>
          </div>

          {/* OAuth 프로바이더 버튼 영역 */}
          <div className="space-y-3">
            {/*
             * Google 로그인 버튼
             * 서버 액션 폼을 사용하여 NextAuth의 signIn("google")을 호출합니다.
             * redirectTo로 인증 후 홈 페이지로 이동하도록 설정합니다.
             * Google "G" 로고 SVG는 Google 로그인 브랜드 가이드라인에 따른
             * 공식 4색 버전을 사용합니다.
             */}
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:shadow dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                {/* Google "G" 로고 - 공식 4색 버전 */}
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google로 계속하기
              </button>
            </form>

            {/* OAuth 옵션 사이 시각적 구분선 */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-zinc-400 dark:bg-zinc-900">
                  또는
                </span>
              </div>
            </div>

            {/*
             * Naver 로그인 버튼
             * 네이버 공식 브랜드 그린(#03C75A)을 사용합니다.
             * "N" 로고는 간소화된 네이버 워드마크 SVG입니다.
             */}
            <form
              action={async () => {
                "use server";
                await signIn("naver", { redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="cursor-pointer flex w-full items-center justify-center gap-3 rounded-xl bg-[#03C75A] px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#02b351] hover:shadow"
              >
                {/* 네이버 "N" 로고 */}
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="white">
                  <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
                </svg>
                Naver로 계속하기
              </button>
            </form>
          </div>

          {/* 약관 안내 푸터 텍스트 */}
          <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하게
            됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
