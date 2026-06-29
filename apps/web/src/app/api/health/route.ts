import { NextResponse } from "next/server";

interface HealthResponse {
  status: "ok" | "degraded" | "error";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

export async function GET() {
  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version ?? "0.1.0",
    environment: process.env.NODE_ENV ?? "development",
  };
  return NextResponse.json(response, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
