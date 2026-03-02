# My App - 실시간 채팅 애플리케이션

Google/Naver OAuth 로그인과 Pusher 기반 실시간 채팅을 지원하는 웹 애플리케이션입니다.

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 언어 | TypeScript (strict) |
| UI | React 19 + Tailwind CSS v4 |
| 인증 | NextAuth.js v5 (Google, Naver OAuth) |
| 실시간 통신 | Pusher Channels (WebSocket) |
| 데이터베이스 | Prisma 7 + SQLite |
| HTTP 클라이언트 | axios |
| 테스트 | Playwright (E2E) |

## 주요 기능

### OAuth 로그인
- Google / Naver 소셜 로그인
- 미들웨어 기반 라우트 보호 (미인증 시 `/login` 리다이렉트)
- 프로필 표시 (아바타, 이름, 이메일, 프로바이더 배지)

### 실시간 채팅
- Pusher Channels를 통한 실시간 메시지 송수신
- SQLite 데이터베이스에 메시지 영속 저장 (최근 50개 표시)
- 브라우저 Notification API로 비활성 탭 알림
- 반응형 UI + 다크모드 지원

## 프로젝트 구조

```
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth API 핸들러
│   │   └── chat/route.ts                # 채팅 메시지 API (GET/POST)
│   ├── chat/page.tsx                    # 실시간 채팅 페이지
│   ├── login/page.tsx                   # OAuth 로그인 페이지
│   ├── page.tsx                         # 홈 페이지 (보호된 라우트)
│   ├── layout.tsx                       # 루트 레이아웃
│   └── providers.tsx                    # SessionProvider 래퍼
├── lib/
│   ├── prisma.ts                        # Prisma 클라이언트 싱글톤
│   ├── pusher-server.ts                 # Pusher 서버 인스턴스
│   └── pusher-client.ts                 # Pusher 클라이언트 인스턴스
├── prisma/
│   ├── schema.prisma                    # Message 모델 정의
│   └── migrations/                      # DB 마이그레이션
├── tests/
│   ├── auth-login.spec.ts               # OAuth 로그인 E2E 테스트 (9개)
│   └── realtime-chat.spec.ts            # 채팅 E2E 테스트 (8개)
├── docs/features/
│   ├── oauth-login.md                   # OAuth 아키텍처 문서
│   └── realtime-chat.md                 # 채팅 아키텍처 문서
├── auth.ts                              # NextAuth v5 설정
├── middleware.ts                        # 라우트 보호 미들웨어
├── prisma.config.ts                     # Prisma 7 설정 (DB URL)
└── playwright.config.ts                 # E2E 테스트 설정
```

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력합니다.

```env
# NextAuth
AUTH_SECRET="openssl rand -base64 32 로 생성"

# Google OAuth (https://console.cloud.google.com)
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret

# Naver OAuth (https://developers.naver.com)
AUTH_NAVER_ID=your-naver-client-id
AUTH_NAVER_SECRET=your-naver-client-secret

# Pusher (https://pusher.com)
NEXT_PUBLIC_PUSHER_KEY=your-pusher-key
NEXT_PUBLIC_PUSHER_CLUSTER=ap3
PUSHER_APP_ID=your-pusher-app-id
PUSHER_SECRET=your-pusher-secret
```

### 3. 데이터베이스 초기화

```bash
npx prisma migrate dev
```

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## OAuth 콜백 URL 설정

각 OAuth 프로바이더 콘솔에서 아래 콜백 URL을 등록해야 합니다.

| 프로바이더 | 콜백 URL |
|-----------|----------|
| Google | `http://localhost:3000/api/auth/callback/google` |
| Naver | `http://localhost:3000/api/auth/callback/naver` |

## 테스트

```bash
# E2E 테스트 실행 (Playwright)
npx playwright test

# 특정 테스트 파일 실행
npx playwright test tests/auth-login.spec.ts
npx playwright test tests/realtime-chat.spec.ts
```

## 브랜치 전략

| 브랜치 | 용도 |
|--------|------|
| `main` | 프로덕션 최종본 |
| `dev` | 개발 통합 브랜치 |
| `feature/*` | 기능별 개발 브랜치 → `dev`로 PR |
