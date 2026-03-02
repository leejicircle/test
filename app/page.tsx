/**
 * page.tsx - 홈 페이지 (보호된 라우트)
 *
 * 미들웨어에 의해 보호되는 메인 랜딩 페이지입니다.
 * 인증된 사용자만 이 페이지에 접근할 수 있습니다.
 * 사용자의 프로필 정보(이름, 아바타, 프로바이더)를 표시하고
 * 로그아웃 버튼을 제공합니다.
 *
 * 서버 컴포넌트로서 `auth()` 함수를 사용하여
 * 서버 측에서 세션을 읽습니다.
 */

import { auth, signOut } from "@/auth";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  /* 서버에서 현재 사용자 세션 조회 */
  const session = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-lg flex-col items-center gap-8 px-6 py-16">
        {session?.user ? (
          <>
            {/* 사용자 프로필 영역 - 아바타, 이름, 이메일, 프로바이더 표시 */}
            <div className="flex flex-col items-center gap-4">
              {/* OAuth 프로바이더에서 제공한 사용자 아바타 */}
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "사용자 아바타"}
                  width={80}
                  height={80}
                  className="rounded-full border-2 border-zinc-200 dark:border-zinc-700"
                />
              )}

              {/* 사용자 표시 이름 */}
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {session.user.name}님, 환영합니다
              </h1>

              {/* 사용자 이메일 주소 */}
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {session.user.email}
              </p>

              {/*
               * 프로바이더 배지 - 어떤 OAuth 프로바이더로 인증했는지 표시합니다.
               * 프로바이더 이름은 auth.ts의 JWT 콜백을 통해 세션에 추가됩니다.
               * 해당 프로바이더에 맞는 브랜드 색상으로 표시합니다.
               */}
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {(session.user as { provider?: string }).provider === "naver"
                  ? "Naver"
                  : "Google"}
                로 로그인됨
              </span>
            </div>

            {/* 채팅 페이지 바로가기 */}
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              실시간 채팅 시작하기
            </Link>

            {/*
             * 로그아웃 버튼
             * 서버 액션 폼을 사용하여 NextAuth의 signOut 함수를 호출합니다.
             * 로그아웃 후 사용자는 로그인 페이지로 리다이렉트됩니다.
             */}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="rounded-xl border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 hover:shadow dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
              >
                로그아웃
              </button>
            </form>
          </>
        ) : (
          /*
           * 비인증 상태 폴백
           * 일반적으로 미들웨어가 /login으로 리다이렉트하지만,
           * 세션 확인이 조용히 실패하는 엣지 케이스를 처리합니다.
           */
          <div className="text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              로그인되지 않았습니다.
            </p>
            <a
              href="/login"
              className="mt-4 inline-block rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              로그인 페이지로 이동
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
