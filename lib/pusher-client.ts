/**
 * lib/pusher-client.ts - Pusher 클라이언트 인스턴스
 *
 * 브라우저에서 Pusher 채널을 구독하고 실시간 이벤트를 수신할 때 사용합니다.
 * NEXT_PUBLIC_ 접두사가 붙은 환경변수만 클라이언트에서 접근 가능합니다.
 * (Key와 Cluster만 노출 - 보안상 안전, Secret은 서버에서만 사용)
 */

import PusherClient from "pusher-js";

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  }
);
