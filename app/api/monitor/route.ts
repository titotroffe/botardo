import { NextResponse } from "next/server"

// Endpoint simplificado para UptimeRobot - Solo ofertas reales
export async function GET() {
  try {
    console.log("🤖 Monitor endpoint ejecutado")

    // Verificar variables de entorno
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID

    if (!TELEGRAM_BOT_TOKEN) {
      return NextResponse.json(
        {
          success: false,
          error: "TELEGRAM_BOT_TOKEN no configurado",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    if (!TELEGRAM_CHAT_IDS) {
      return NextResponse.json(
        {
          success: false,
          error: "TELEGRAM_CHAT_IDS no configurado",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      )
    }

    // Obtener chat IDs
    const chatIds = TELEGRAM_CHAT_IDS.split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0)

    console.log(`👥 Chat IDs configurados: ${chatIds.length}`)

    // Por ahora, solo verificar configuración (sin scraping real)
    // TODO: Implementar scraping real más adelante

    return NextResponse.json({
      success: true,
      message: "Monitor funcionando - Sin ofertas reales encontradas",
      location: "San Nicolás de los Arroyos (CP 2900)",
      users_configured: chatIds.length,
      result: {
        total_products: 0,
        super_deals: 0,
        normal_deals: 0,
        offers_found: 0,
        notifications_sent: 0,
        message: "Scraping real no implementado - Sin ofertas falsas",
      },
      timestamp: new Date().toISOString(),
      note: "Endpoint funcionando correctamente - Solo envía cuando hay ofertas reales",
    })
  } catch (error) {
    console.error("❌ Error en monitor:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del monitor",
        details: error?.message || "Error desconocido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// También permitir POST para webhooks
export async function POST() {
  return GET()
}
