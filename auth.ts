/**
 * auth.ts - NextAuth.js v5 핵심 설정 파일
 *
 * 이 파일은 인증 시스템의 중앙 설정 파일입니다.
 * OAuth 프로바이더(Google, Naver), 세션 전략(JWT),
 * 커스텀 페이지, 콜백 핸들러를 정의합니다.
 *
 * NextAuth v5는 App Router 통합을 위해 `auth()` 내보내기 패턴을 사용합니다.
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * 네이버 OAuth 프로바이더 설정
 *
 * NextAuth에는 네이버 빌트인 프로바이더가 없으므로,
 * 제네릭 OAuth 설정을 사용하여 수동으로 정의합니다.
 * 네이버 OAuth 2.0 API는 사용자 프로필 데이터를 `response` 객체 안에
 * 중첩하여 반환하므로, `profile` 콜백에서 이를 추출합니다.
 */
const Naver = {
  id: "naver",
  name: "Naver",
  type: "oauth" as const,
  authorization: {
    url: "https://nid.naver.com/oauth2.0/authorize",
    params: { response_type: "code" },
  },
  token: "https://nid.naver.com/oauth2.0/token",
  userinfo: "https://openapi.naver.com/v1/nid/me",
  clientId: process.env.AUTH_NAVER_ID,
  clientSecret: process.env.AUTH_NAVER_SECRET,
  /**
   * 네이버 API 응답 구조 변환
   * 네이버는 프로필 데이터를 `response` 객체로 감싸서 반환합니다:
   * { resultcode: "00", message: "success", response: { id, name, email, ... } }
   * 내부 `response`를 추출하여 NextAuth가 기대하는 형식으로 매핑합니다.
   */
  profile(profile: {
    response: {
      id: string;
      name: string;
      email: string;
      profile_image: string;
    };
  }) {
    return {
      id: profile.response.id,
      name: profile.response.name,
      email: profile.response.email,
      image: profile.response.profile_image,
    };
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  /**
   * OAuth 프로바이더 등록
   * Google: NextAuth 빌트인 프로바이더 사용 (자동 디스커버리)
   * Naver: 위에서 정의한 커스텀 OAuth 설정 사용
   */
  providers: [Google, Naver],

  /**
   * 커스텀 페이지 설정
   * NextAuth 기본 로그인 UI 대신 우리가 만든 `/login` 페이지로
   * 리다이렉트합니다.
   */
  pages: {
    signIn: "/login",
  },

  /**
   * 콜백 함수들
   * JWT와 세션 객체를 커스터마이즈하여 OAuth 프로바이더 이름을
   * 토큰/세션에 추가합니다. 이를 통해 UI에서 어떤 프로바이더로
   * 인증했는지 표시할 수 있습니다.
   */
  callbacks: {
    /**
     * authorized 콜백 - 미들웨어에서 사용됩니다.
     * 사용자의 인증 상태를 확인하여 보호된 라우트 접근을 제어합니다.
     * auth가 없으면 false를 반환하여 로그인 페이지로 리다이렉트합니다.
     */
    authorized({ auth }) {
      return !!auth;
    },

    /**
     * JWT 콜백 - JWT가 생성되거나 업데이트될 때 실행됩니다.
     * 최초 로그인 시 `account` 객체가 제공되며,
     * 프로바이더 이름을 토큰에 저장합니다.
     */
    jwt({ token, account }) {
      if (account) {
        token.provider = account.provider;
      }
      return token;
    },

    /**
     * 세션 콜백 - 세션이 확인될 때 실행됩니다.
     * JWT의 프로바이더 정보를 세션 객체에 복사하여
     * 클라이언트 측에서 접근할 수 있도록 합니다.
     */
    session({ session, token }) {
      if (session.user) {
        (session.user as { provider?: string }).provider =
          token.provider as string;
      }
      return session;
    },
  },
});
