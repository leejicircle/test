/**
 * middleware.ts - 라우트 보호 미들웨어
 *
 * 이 미들웨어는 매칭된 모든 요청에서 페이지 렌더링 전에 실행됩니다.
 * NextAuth의 `auth` 래퍼를 사용하여 사용자의 활성 세션을 확인합니다.
 * 인증되지 않은 사용자가 보호된 라우트에 접근하면 `/login`으로 리다이렉트됩니다.
 *
 * `matcher` 설정은 공개 에셋, API 라우트, 로그인 페이지를 제외하여
 * 무한 리다이렉트 루프를 방지합니다.
 */

export { auth as middleware } from "@/auth";

export const config = {
  /**
   * 아래 경로를 제외한 모든 라우트에 매칭:
   * - /api (인증 엔드포인트를 포함한 API 라우트)
   * - /_next (Next.js 내부 파일: 정적 파일, HMR 등)
   * - /login (로그인 페이지 자체 - 공개 접근 필수)
   * - 정적 파일 (favicon, SVG, 이미지)
   */
  matcher: ["/((?!api|_next|login|favicon.ico|.*\\.svg$).*)"],
};
