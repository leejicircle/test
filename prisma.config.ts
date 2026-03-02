/**
 * prisma.config.ts - Prisma 설정 파일
 *
 * Prisma 7에서는 데이터베이스 URL을 이 파일에서 설정합니다.
 * SQLite 파일 기반 DB를 사용하여 로컬에서 바로 실행 가능합니다.
 */
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    /* SQLite DB 파일 경로 - prisma 디렉토리 내에 생성됩니다 */
    url: `file:${path.join(__dirname, "prisma", "dev.db")}`,
  },
});
