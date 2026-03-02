/**
 * lib/pusher-server.ts - Pusher 서버 인스턴스
 *
 * 서버 측(API Route)에서 Pusher에 이벤트를 트리거할 때 사용합니다.
 * 메시지 전송 시 이 인스턴스를 통해 채널에 이벤트를 발행하면,
 * 해당 채널을 구독 중인 모든 클라이언트가 실시간으로 수신합니다.
 */

import Pusher from "pusher";

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true, // HTTPS 통신 강제
});
