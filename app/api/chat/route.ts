/**
 * api/chat/route.ts - 채팅 메시지 API
 *
 * GET: 최근 메시지 50개를 시간순으로 조회합니다.
 * POST: 새 메시지를 DB에 저장하고, Pusher를 통해 실시간으로 브로드캐스트합니다.
 *
 * 모든 요청은 인증된 사용자만 가능합니다.
 */

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";
import { NextResponse } from "next/server";

/**
 * GET /api/chat
 * 최근 메시지 50개를 시간순(오래된 것부터)으로 반환합니다.
 */
export async function GET() {
  const session = await auth();

  /* 미인증 사용자 차단 */
  if (!session?.user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  /* DB에서 최근 50개 메시지 조회 (오래된 것부터 정렬) */
  const messages = await prisma.message.findMany({
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json(messages);
}

/**
 * POST /api/chat
 * 새 메시지를 저장하고 Pusher로 실시간 브로드캐스트합니다.
 *
 * 요청 본문: { content: string }
 * 응답: 저장된 메시지 객체
 */
export async function POST(req: Request) {
  const session = await auth();

  /* 미인증 사용자 차단 */
  if (!session?.user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { content } = await req.json();

  /* 빈 메시지 차단 */
  if (!content?.trim()) {
    return NextResponse.json({ error: "메시지를 입력하세요" }, { status: 400 });
  }

  /* DB에 메시지 저장 */
  const message = await prisma.message.create({
    data: {
      content: content.trim(),
      userName: session.user.name || "익명",
      userEmail: session.user.email || "",
      userImage: session.user.image || null,
    },
  });

  /**
   * Pusher를 통해 "chat" 채널의 "new-message" 이벤트로 브로드캐스트.
   * 이 채널을 구독 중인 모든 클라이언트가 즉시 메시지를 수신합니다.
   */
  await pusherServer.trigger("chat", "new-message", message);

  return NextResponse.json(message);
}
