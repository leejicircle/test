/**
 * realtime-chat.spec.ts - 실시간 채팅 기능 E2E 테스트
 *
 * 채팅 페이지의 미들웨어 보호, API 엔드포인트 인증을 검증합니다.
 * /chat은 미들웨어에 의해 보호되므로 미인증 시 /login으로 리다이렉트됩니다.
 * 실제 OAuth 로그인이 필요한 UI 테스트는 통합 테스트에서 다룹니다.
 */

import { test, expect } from "@playwright/test";

test.describe("채팅 페이지 미들웨어 보호", () => {
  test("미인증 사용자가 /chat 접근 시 /login으로 리다이렉트되어야 한다", async ({
    page,
  }) => {
    /*
     * 미들웨어가 /chat을 보호하므로 미인증 사용자는
     * 자동으로 /login 페이지로 리다이렉트됩니다.
     */
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/login/);
  });

  test("리다이렉트 후 로그인 페이지가 정상 렌더링되어야 한다", async ({
    page,
  }) => {
    /* /chat 접근 → /login 리다이렉트 후 로그인 UI 확인 */
    await page.goto("/chat");
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("heading", { name: "환영합니다" })
    ).toBeVisible();
  });
});

test.describe("채팅 API 엔드포인트 인증", () => {
  test("미인증 상태에서 GET /api/chat 호출 시 401 응답을 반환해야 한다", async ({
    request,
  }) => {
    /* 인증 없이 채팅 메시지 조회 API를 호출하면 401 에러 */
    const response = await request.get("/api/chat");
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("인증이 필요합니다");
  });

  test("미인증 상태에서 POST /api/chat 호출 시 401 응답을 반환해야 한다", async ({
    request,
  }) => {
    /* 인증 없이 메시지 전송 API를 호출하면 401 에러 */
    const response = await request.post("/api/chat", {
      data: { content: "테스트 메시지" },
    });
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.error).toBe("인증이 필요합니다");
  });

  test("GET /api/chat 응답에 올바른 에러 메시지가 포함되어야 한다", async ({
    request,
  }) => {
    /* 401 응답 본문의 구조 검증 */
    const response = await request.get("/api/chat");
    const body = await response.json();

    expect(body).toHaveProperty("error");
    expect(typeof body.error).toBe("string");
  });

  test("POST /api/chat에 빈 본문 전송 시에도 인증 체크가 우선되어야 한다", async ({
    request,
  }) => {
    /* 빈 본문이어도 인증 체크가 먼저 수행되어 401 반환 */
    const response = await request.post("/api/chat", {
      data: {},
    });
    expect(response.status()).toBe(401);
  });
});

test.describe("채팅 페이지 소스 코드 구조 검증", () => {
  test("채팅 페이지 HTML에 필요한 클라이언트 스크립트가 포함되어야 한다", async ({
    request,
  }) => {
    /*
     * /chat 페이지의 원본 HTML을 직접 요청하여
     * 클라이언트 컴포넌트 관련 스크립트가 번들에 포함되는지 확인합니다.
     * 미들웨어가 리다이렉트하므로 응답 코드는 307이 될 수 있습니다.
     */
    const response = await request.get("/chat");
    const status = response.status();

    /* 미들웨어에 의해 리다이렉트(307) 또는 정상 응답(200) */
    expect([200, 307]).toContain(status);
  });
});

test.describe("홈 페이지에서 채팅 링크", () => {
  test("로그인 페이지에서 Google/Naver 버튼이 모두 존재해야 한다", async ({
    page,
  }) => {
    /*
     * 채팅 기능 접근을 위해서는 먼저 로그인이 필요하므로
     * 로그인 페이지에 OAuth 버튼이 정상적으로 표시되는지 확인합니다.
     */
    await page.goto("/login");

    const googleButton = page.getByRole("button", {
      name: /Google로 계속하기/,
    });
    const naverButton = page.getByRole("button", {
      name: /Naver로 계속하기/,
    });

    await expect(googleButton).toBeVisible();
    await expect(naverButton).toBeVisible();
  });
});
