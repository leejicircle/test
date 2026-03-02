/**
 * [...nextauth]/route.ts - NextAuth.js API 라우트 핸들러
 *
 * 이 캐치올(catch-all) API 라우트는 모든 인증 관련 요청을 처리합니다:
 * - GET /api/auth/signin       → 커스텀 로그인 페이지로 리다이렉트
 * - POST /api/auth/signin/:id  → 지정된 프로바이더의 OAuth 플로우 시작
 * - GET /api/auth/callback/:id → 프로바이더로부터 OAuth 콜백 처리
 * - POST /api/auth/signout     → 세션 삭제 및 로그아웃
 * - GET /api/auth/session      → 현재 세션 데이터 반환
 * - GET /api/auth/csrf         → CSRF 토큰 반환
 *
 * auth.ts의 `handlers` 객체가 GET과 POST 핸들러를 모두 제공합니다.
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;
