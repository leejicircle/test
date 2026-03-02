# 실시간 채팅 (Pusher + Prisma)

## 개요
Pusher Channels를 활용한 실시간 채팅 기능입니다.
로그인한 사용자끼리 메시지를 주고받을 수 있으며, 브라우저 알림을 지원합니다.

## 왜 이 아키텍처를 선택했는가

### Pusher를 선택한 이유
- Next.js App Router에서 커스텀 서버 없이 WebSocket 기능 사용 가능
- 무료 플랜으로 하루 200,000 메시지, 동시 100명 접속 지원
- 클라이언트/서버 SDK가 잘 정비되어 설정이 간단
- Socket.IO는 별도 서버 프로세스가 필요하여 배포 복잡도 증가

### Prisma + SQLite를 선택한 이유
- 메시지를 영속적으로 저장하여 페이지 새로고침 시에도 이전 대화 유지
- SQLite는 별도 DB 서버 없이 파일 기반으로 로컬에서 즉시 실행 가능
- 추후 PostgreSQL로 마이그레이션이 schema만 변경하면 됨

### 브라우저 Notification API를 선택한 이유
- 별도 라이브러리 없이 브라우저 내장 기능으로 알림 구현
- 탭이 비활성 상태일 때만 알림을 보내 사용자 경험 최적화
- 사용자가 직접 알림 권한을 허용/거부할 수 있어 프라이버시 보호

### axios를 사용한 이유
- fetch보다 간결한 API (자동 JSON 파싱, 인터셉터 등)
- 요청/응답 타입 추론이 우수
- 에러 핸들링이 직관적

## 파일 구조

```
lib/prisma.ts          # Prisma 클라이언트 싱글톤
lib/pusher-server.ts   # Pusher 서버 인스턴스 (이벤트 발행)
lib/pusher-client.ts   # Pusher 클라이언트 인스턴스 (이벤트 구독)
app/chat/page.tsx      # 채팅 UI (클라이언트 컴포넌트)
app/api/chat/route.ts  # 메시지 CRUD API + Pusher 트리거
app/providers.tsx       # SessionProvider 래퍼
prisma/schema.prisma   # Message 모델 정의
prisma.config.ts       # Prisma DB URL 설정
```

## 데이터 흐름

```
메시지 전송:
1. 사용자가 메시지 입력 후 전송 버튼 클릭
2. axios.post("/api/chat") 호출
3. API Route에서 세션 확인 → Prisma로 DB 저장
4. pusherServer.trigger("chat", "new-message", message) 호출
5. Pusher가 "chat" 채널의 모든 구독자에게 메시지 브로드캐스트
6. 각 클라이언트의 channel.bind("new-message") 콜백 실행
7. React state 업데이트 → UI 반영

알림:
1. 새 메시지 수신 시 messages state 변경 감지
2. 마지막 메시지가 다른 사용자의 것인지 확인
3. 현재 탭이 비활성 상태이고 알림 권한이 허용된 경우
4. new Notification() 으로 브라우저 알림 표시
```
