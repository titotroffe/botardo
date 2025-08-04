import { NextResponse } from "next/server"

// Endpoint para probar con ofertas de ejemplo (solo para testing)
export async function GET() {
  try {
    console.log("🧪 Test con ofertas de ejemplo")

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_IDS) {
      return NextResponse.json(
        {
          success: false,
          error: "Variables de entorno no configuradas",
        },
        { status: 400 },
      )
    }

    const chatIds = TELEGRAM_CHAT_IDS.split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0)

    // Ofertas de ejemplo SOLO para testing
    const testOffers = [
      {
        name: "Pepsi Cola 500ml - Oferta Test",
        price: 650.0,
        size: "500ml",
        brand: "Pepsi",
        store: "La Coope en Casa - San Nicolás",
      },
      {
        name: "Coca-Cola 500ml - Test",
        price: 890.0,
        size: "500ml",
        brand: "Coca-Cola",
        store: "Carrefour - San Nicolás",
      },
    ]

    const superDeals = testOffers.filter((p) => p.price < 700)
    const normalDeals = testOffers.filter((p) => p.price >= 700 && p.price < 1000)

    let sent = 0

    if (superDeals.length > 0) {
      const message = `🧪 *TEST - SUPER OFERTAS*
📍 *San Nicolás de los Arroyos (CP 2900)*

${superDeals
  .map(
    (deal) => `🔥 ${deal.brand} - ${deal.name}
💵 Precio: $${deal.price}
🏪 ${deal.store}`,
  )
  .join("\n\n")}

⚠️ _Este es un mensaje de PRUEBA_
🕐 ${new Date().toLocaleString("es-AR")}`

      for (const chatId of chatIds) {
        try {
          await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: chatId,
              text: message,
              parse_mode: "Markdown",
            }),
          })
          sent++
          await new Promise((resolve) => setTimeout(resolve, 200))
        } catch (error) {
          console.error(`Error enviando a ${chatId}:`, error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Test de ofertas ejecutado",
      test_offers: testOffers.length,
      super_deals: superDeals.length,
      normal_deals: normalDeals.length,
      messages_sent: sent,
      note: "Este endpoint es solo para testing - /api/monitor es para producción",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Error desconocido",
      },
      { status: 500 },
    )
  }
}
