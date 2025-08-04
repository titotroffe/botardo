import { NextResponse } from "next/server"

// Endpoint simple para verificar que la API funciona
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
    endpoints: {
      monitor: "/api/monitor",
      test_bot: "/api/test-bot",
      test_monitor: "/api/test-monitor",
      health: "/api/health",
    },
  })
}
