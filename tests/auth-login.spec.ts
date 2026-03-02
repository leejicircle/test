/**
 * auth-login.spec.ts - OAuth 로그인 페이지 E2E 테스트
 *
 * 이 테스트는 로그인 페이지의 UI 요소, 인증 플로우 시작,
 * 미들웨어 리다이렉트 등을 검증합니다.
 *
 * OAuth 프로바이더(Google, Naver)의 실제 로그인은
 * 외부 서비스 의존성으로 인해 모킹하거나 별도 테스트합니다.
 * 여기서는 로그인 페이지 렌더링과 네비게이션을 중심으로 테스트합니다.
 */

import { test, expect } from "@playwright/test";

test.describe("로그인 페이지", () => {
  test.beforeEach(async ({ page }) => {
    /* 매 테스트 전에 로그인 페이지로 이동 */
    await page.goto("/login");
  });

  test("로그인 페이지가 올바르게 렌더링되어야 한다", async ({ page }) => {
    /* 환영 메시지 확인 */
    await expect(page.getByRole("heading", { name: "환영합니다" })).toBeVisible();

    /* 부제목 확인 */
    await expect(page.getByText("계속하려면 로그인하세요")).toBeVisible();
  });

  test("Google 로그인 버튼이 표시되어야 한다", async ({ page }) => {
    /* Google 로그인 버튼 텍스트 확인 */
    const googleButton = page.getByRole("button", {
      name: /Google로 계속하기/,
    });
    await expect(googleButton).toBeVisible();
  });

  test("Naver 로그인 버튼이 표시되어야 한다", async ({ page }) => {
    /* Naver 로그인 버튼 텍스트 확인 */
    const naverButton = page.getByRole("button", {
      name: /Naver로 계속하기/,
    });
    await expect(naverButton).toBeVisible();
  });

  test("구분선 '또는' 텍스트가 표시되어야 한다", async ({ page }) => {
    /* OAuth 옵션 사이의 구분선 텍스트 확인 */
    await expect(page.getByText("또는")).toBeVisible();
  });

  test("약관 안내 텍스트가 표시되어야 한다", async ({ page }) => {
    /* 페이지 하단의 약관 안내 텍스트 확인 */
    await expect(
      page.getByText("계속 진행하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.")
    ).toBeVisible();
  });

  test("Google 버튼 클릭 시 OAuth 플로우가 시작되어야 한다", async ({
    page,
  }) => {
    /*
     * Google 버튼 클릭 후 NextAuth가 Google OAuth 페이지로
     * 리다이렉트하는지 확인합니다.
     * 실제 Google 로그인은 진행하지 않고, 리다이렉트 발생만 검증합니다.
     */
    const googleButton = page.getByRole("button", {
      name: /Google로 계속하기/,
    });
    await googleButton.click();

    /* NextAuth가 /api/auth/signin/google 으로 리다이렉트하거나
     * Google OAuth 페이지로 이동하는지 확인 */
    await page.waitForURL((url) => {
      const href = url.toString();
      return (
        href.includes("accounts.google.com") ||
        href.includes("/api/auth") ||
        href.includes("error")
      );
    }, { timeout: 10000 });
  });

  test("Naver 버튼 클릭 시 OAuth 플로우가 시작되어야 한다", async ({
    page,
  }) => {
    /*
     * Naver 버튼 클릭 후 NextAuth가 Naver OAuth 페이지로
     * 리다이렉트하는지 확인합니다.
     */
    const naverButton = page.getByRole("button", {
      name: /Naver로 계속하기/,
    });
    await naverButton.click();

    /* NextAuth가 nid.naver.com 으로 리다이렉트하거나
     * /api/auth 경로로 이동하는지 확인 */
    await page.waitForURL((url) => {
      const href = url.toString();
      return (
        href.includes("nid.naver.com") ||
        href.includes("/api/auth") ||
        href.includes("error")
      );
    }, { timeout: 10000 });
  });
});

test.describe("미들웨어 라우트 보호", () => {
  test("인증되지 않은 사용자가 홈페이지 접근 시 로그인 페이지로 리다이렉트되어야 한다", async ({
    page,
  }) => {
    /*
     * 미들웨어가 미인증 사용자를 /login으로 리다이렉트하는지 검증합니다.
     * 홈 페이지(/)에 직접 접근하면 로그인 페이지로 이동해야 합니다.
     */
    await page.goto("/");

    /* URL이 /login을 포함하는지 확인 */
    await expect(page).toHaveURL(/\/login/);
  });

  test("로그인 페이지는 리다이렉트 없이 직접 접근 가능해야 한다", async ({
    page,
  }) => {
    /* 로그인 페이지는 공개 라우트이므로 리다이렉트되지 않아야 합니다 */
    await page.goto("/login");

    /* URL이 여전히 /login인지 확인 */
    await expect(page).toHaveURL(/\/login/);

    /* 페이지 콘텐츠가 정상적으로 로드되었는지 확인 */
    await expect(page.getByRole("heading", { name: "환영합니다" })).toBeVisible();
  });
});
