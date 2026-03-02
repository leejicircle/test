import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright 테스트 설정 파일
 *
 * 로컬 개발 서버(Next.js)를 자동으로 시작하고
 * Chromium 브라우저에서 E2E 테스트를 실행합니다.
 */
export default defineConfig({
  testDir: './tests',
  /* 파일 내 테스트를 병렬로 실행 */
  fullyParallel: true,
  /* CI 환경에서 test.only가 남아있으면 빌드 실패 */
  forbidOnly: !!process.env.CI,
  /* CI에서만 재시도 */
  retries: process.env.CI ? 2 : 0,
  /* CI에서는 워커 1개로 제한 */
  workers: process.env.CI ? 1 : undefined,
  /* HTML 리포터 사용 */
  reporter: 'html',
  /* 모든 프로젝트에 공유되는 설정 */
  use: {
    /* 테스트에서 사용할 기본 URL */
    baseURL: 'http://localhost:3100',
    /* 실패 재시도 시 트레이스 수집 */
    trace: 'on-first-retry',
  },

  /* Chromium 브라우저에서만 테스트 (빠른 피드백을 위해) */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 테스트 시작 전 로컬 개발 서버 자동 실행 */
  webServer: {
    command: 'npx next dev --port 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
  },
});
