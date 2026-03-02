# OAuth 로그인 (Google & Naver)

## 개요
Google과 Naver OAuth를 통한 소셜 로그인 기능입니다.
NextAuth.js v5를 사용하며, JWT 기반 세션 관리와 App Router 서버 컴포넌트를 활용합니다.

## 왜 이 아키텍처를 선택했는가

### NextAuth.js v5 (Auth.js)를 선택한 이유
- Next.js App Router와 네이티브 통합이 가능합니다 (서버 컴포넌트, 서버 액션)
- Google은 빌트인 프로바이더로 지원되어 설정이 간단합니다
- JWT 전략을 사용하면 데이터베이스 없이도 세션 관리가 가능합니다
- CSRF 보호, httpOnly 쿠키 등 보안 기능이 내장되어 있습니다

### 네이버 커스텀 프로바이더를 만든 이유
- NextAuth v5에 네이버 빌트인 프로바이더가 없습니다
- 네이버 OAuth API는 프로필 데이터를 `response` 객체 안에 중첩하여 반환하므로 커스텀 `profile()` 콜백이 필요합니다
- OAuth 2.0 표준을 따르므로 `type: "oauth"` 제네릭 설정으로 구현이 가능합니다

### 서버 액션으로 로그인을 처리하는 이유
- 클라이언트 JavaScript 없이 폼 제출로 OAuth 플로우를 시작할 수 있습니다
- `"use server"` 지시문으로 서버 사이드에서 안전하게 실행됩니다
- 추가적인 API 엔드포인트가 불필요합니다

### JWT 세션 (데이터베이스 없음)을 선택한 이유
- 초기 구현에서 사용자 데이터 영속화가 불필요합니다
- 배포 복잡도를 최소화합니다 (DB 설정, 마이그레이션 불필요)
- 추후 필요시 Prisma + PostgreSQL 어댑터로 마이그레이션이 가능합니다

## 파일 구조

```
auth.ts                                  # NextAuth 핵심 설정 (프로바이더, 콜백)
middleware.ts                            # 라우트 보호 (미인증시 /login으로 리다이렉트)
app/api/auth/[...nextauth]/route.ts      # 인증 API 캐치올 핸들러
app/login/page.tsx                       # OAuth 버튼이 있는 로그인 페이지
app/page.tsx                             # 홈 페이지 (보호됨, 사용자 정보 표시)
next.config.ts                           # OAuth 아바타용 이미지 도메인 설정
.env.local                               # OAuth 인증 정보 (커밋되지 않음)
```

## 데이터 흐름

```
1. 사용자가 /login 방문
2. "Google로 계속하기" 또는 "Naver로 계속하기" 클릭
3. 서버 액션이 signIn("google"|"naver") 호출
4. 브라우저가 프로바이더의 동의 화면으로 리다이렉트
5. 사용자가 승인 → 프로바이더가 /api/auth/callback/:provider 로 리다이렉트
6. NextAuth가 인가 코드를 토큰으로 교환하고 프로필 정보 조회
7. 사용자 데이터로 JWT 생성, httpOnly 쿠키에 저장
8. 사용자가 / (홈 페이지)로 리다이렉트
9. middleware.ts가 매 요청마다 JWT 확인
10. auth()가 서버 컴포넌트에서 세션 읽기
```

## OAuth 프로바이더 설정 방법

### Google OAuth
1. https://console.cloud.google.com/ 에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리다이렉트 URI에 `http://localhost:3000/api/auth/callback/google` 추가
4. `.env.local`에 Client ID와 Client Secret 입력

### Naver OAuth
1. https://developers.naver.com/ 에서 애플리케이션 등록
2. API 권한에서 '네이버 로그인' 선택 (이름, 이메일, 프로필 이미지)
3. Callback URL에 `http://localhost:3000/api/auth/callback/naver` 추가
4. `.env.local`에 Client ID와 Client Secret 입력
