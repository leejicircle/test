import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * 외부 이미지 허용 설정
   * OAuth 프로바이더에서 제공하는 프로필 이미지를 사용하기 위해
   * 해당 도메인을 허용합니다.
   * - Google 프로필 이미지: lh3.googleusercontent.com
   * - 네이버 프로필 이미지: phinf.pstatic.net, ssl.pstatic.net
   */
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "phinf.pstatic.net" },
      { protocol: "https", hostname: "ssl.pstatic.net" },
    ],
  },
};

export default nextConfig;
