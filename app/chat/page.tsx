"use client";

/**
 * chat/page.tsx - 실시간 채팅 페이지
 *
 * Pusher를 통해 실시간 메시지를 주고받는 채팅 인터페이스입니다.
 * - 페이지 로드 시 최근 메시지 50개를 DB에서 불러옵니다
 * - Pusher 채널을 구독하여 새 메시지를 실시간 수신합니다
 * - 브라우저 Notification API로 새 메시지 알림을 보냅니다
 * - 반응형 + 다크모드 지원
 */

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { pusherClient } from "@/lib/pusher-client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

/** 메시지 타입 정의 */
interface Message {
  id: string;
  content: string;
  userName: string;
  userEmail: string;
  userImage: string | null;
  createdAt: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  /**
   * 초기 메시지 로드 + Pusher 구독 설정
   * 컴포넌트 마운트 시 한 번만 실행됩니다.
   */
  useEffect(() => {
    /* axios로 기존 메시지 로드 */
    axios.get<Message[]>("/api/chat").then(({ data }) => {
      if (Array.isArray(data)) setMessages(data);
    });

    /* Pusher "chat" 채널 구독 */
    const channel = pusherClient.subscribe("chat");

    /* "new-message" 이벤트 수신 시 메시지 목록에 추가 */
    channel.bind("new-message", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    /* 브라우저 알림 권한 요청 */
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === "default") {
        Notification.requestPermission().then(setNotificationPermission);
      }
    }

    /* 클린업: 컴포넌트 언마운트 시 구독 해제 */
    return () => {
      channel.unbind_all();
      pusherClient.unsubscribe("chat");
    };
  }, []);

  /**
   * 새 메시지 수신 시 스크롤 + 알림 처리
   * messages 배열이 변경될 때마다 실행됩니다.
   */
  useEffect(() => {
    /* 자동 스크롤: 항상 최신 메시지가 보이도록 */
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    /* 마지막 메시지가 다른 사용자의 것이면 브라우저 알림 전송 */
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (
        lastMsg.userEmail !== session?.user?.email &&
        notificationPermission === "granted" &&
        document.hidden // 탭이 비활성 상태일 때만 알림
      ) {
        new Notification(`${lastMsg.userName}`, {
          body: lastMsg.content,
          icon: lastMsg.userImage || undefined,
        });
      }
    }
  }, [messages, session?.user?.email, notificationPermission]);

  /**
   * 메시지 전송 핸들러
   * axios로 POST 요청을 보내고, 성공 시 입력창을 초기화합니다.
   */
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      await axios.post("/api/chat", { content: input });
      setInput("");
    } finally {
      setSending(false);
    }
  };

  /**
   * 타임스탬프 포맷팅 함수
   * ISO 문자열을 "오후 3:42" 형식으로 변환합니다.
   */
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-screen flex-col bg-zinc-50 font-sans dark:bg-zinc-950">
      {/* 상단 네비게이션 바 */}
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            &larr; 홈
          </Link>
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            실시간 채팅
          </h1>
        </div>
        {/* 알림 상태 표시 */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span
            className={`h-2 w-2 rounded-full ${
              notificationPermission === "granted"
                ? "bg-green-500"
                : "bg-zinc-300"
            }`}
          />
          {notificationPermission === "granted" ? "알림 켜짐" : "알림 꺼짐"}
        </div>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-400">
              아직 메시지가 없습니다. 첫 메시지를 보내보세요!
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            {messages.map((msg) => {
              /* 현재 사용자의 메시지인지 판별 */
              const isMe = msg.userEmail === session?.user?.email;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex max-w-[75%] gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    {/* 발신자 아바타 */}
                    {msg.userImage ? (
                      <Image
                        src={msg.userImage}
                        alt={msg.userName}
                        width={32}
                        height={32}
                        className="h-8 w-8 shrink-0 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                        {msg.userName[0]}
                      </div>
                    )}

                    {/* 메시지 버블 */}
                    <div>
                      {/* 발신자 이름 + 시간 */}
                      <div
                        className={`mb-1 flex items-center gap-2 text-xs text-zinc-400 ${
                          isMe ? "justify-end" : ""
                        }`}
                      >
                        <span className="font-medium">{msg.userName}</span>
                        <span>{formatTime(msg.createdAt)}</span>
                      </div>

                      {/* 메시지 내용 */}
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm ${
                          isMe
                            ? "bg-blue-600 text-white"
                            : "bg-white text-zinc-800 shadow-sm dark:bg-zinc-800 dark:text-zinc-200"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* 자동 스크롤을 위한 앵커 */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 메시지 입력 영역 */}
      <form
        onSubmit={sendMessage}
        className="border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
          >
            전송
          </button>
        </div>
      </form>
    </div>
  );
}
