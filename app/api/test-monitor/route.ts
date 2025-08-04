import { NextResponse } from "next/server"

// Endpoint simple para probar que funciona
export async function GET() {
  try {
    console.log("🧪 Test monitor ejecutado")

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID

    return NextResponse.json({
      success: true,
      message: "Test monitor funcionando correctamente",
      environment: {
        has_bot_token: !!TELEGRAM_BOT_TOKEN,
        has_chat_ids: !!TELEGRAM_CHAT_IDS,
        bot_token_length: TELEGRAM_BOT_TOKEN?.length || 0,
        chat_ids_count: TELEGRAM_CHAT_IDS ? TELEGRAM_CHAT_IDS.split(",").length : 0,
      },
      timestamp: new Date().toISOString(),
      node_env: process.env.NODE_ENV,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
