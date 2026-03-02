/**
 * lib/prisma.ts - Prisma 클라이언트 싱글톤
 *
 * 개발 환경에서 Hot Module Reload(HMR) 시 Prisma 클라이언트가
 * 중복 생성되는 것을 방지하기 위한 싱글톤 패턴입니다.
 * globalThis에 클라이언트를 캐시하여 재사용합니다.
 *
 * Prisma 7에서는 드라이버 어댑터가 필수이므로
 * @prisma/adapter-better-sqlite3를 사용합니다.
 */

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/* SQLite 드라이버 어댑터 생성 - prisma.config.ts와 동일한 DB 경로 사용 */
const adapter = new PrismaBetterSqlite3({
  url: `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
});

/* 기존 클라이언트가 있으면 재사용, 없으면 새로 생성 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

/* 프로덕션이 아닌 환경에서만 글로벌에 캐시 */
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
