"use client";

/**
 * providers.tsx - 클라이언트 컨텍스트 프로바이더
 *
 * NextAuth의 SessionProvider를 감싸는 클라이언트 컴포넌트입니다.
 * 루트 레이아웃은 서버 컴포넌트이므로, 클라이언트 전용 프로바이더를
 * 별도 파일로 분리하여 사용합니다.
 * 이를 통해 useSession() 훅을 하위 컴포넌트에서 사용할 수 있습니다.
 */

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
