import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 Test DB: Starting connection test...");
    
    // Test 1: Simple connection
    console.log("📌 Attempting to count users...");
    const users = await prisma.user.findMany().catch(e => {
      console.error("❌ Error counting users:", e);
      throw e;
    });
    
    console.log("📌 Attempting to fetch pro profiles...");
    const pros = await prisma.proProfile.findMany().catch(e => {
      console.error("❌ Error fetching pros:", e);
      throw e;
    });

    console.log("✅ DB connection successful!");
    return NextResponse.json({
      status: "success",
      usersCount: users.length,
      prosCount: pros.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Full error:", error);
    
    return NextResponse.json(
      {
        status: "error",
        message: error?.message || "Unknown error",
        code: error?.code || null,
        details: error?.toString ? error.toString() : "No details",
      },
      { status: 500 }
    );
  }
}
