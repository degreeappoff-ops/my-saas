import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "success",
    message: "Hello Saïd 👋 — ton backend Next.js fonctionne parfaitement !",
    timestamp: new Date().toISOString(),
  });
}
