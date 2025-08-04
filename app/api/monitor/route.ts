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

    // Ejecutar scraping REAL (sin productos prefijados)
    const result = await executeRealScraping(TELEGRAM_BOT_TOKEN, chatIds)

    return NextResponse.json({
      success: true,
      message: result.offers_found > 0 ? "Ofertas reales encontradas y enviadas" : "Sin ofertas reales encontradas",
      location: "San Nicolás de los Arroyos (CP 2900)",
      users_configured: chatIds.length,
      result: result,
      timestamp: new Date().toISOString(),
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

export async function POST() {
  return GET()
}

// Función de scraping REAL - Sin productos prefijados
async function executeRealScraping(botToken: string, chatIds: string[]) {
  try {
    console.log("🔍 Iniciando scraping REAL - Sin productos prefijados")

    // Scraping real de ambos sitios (por ahora devuelve vacío hasta implementar)
    const [coopeProducts, carrefourProducts] = await Promise.all([
      scrapeRealLaCoopeSanNicolas(),
      scrapeRealCarrefourSanNicolas(),
    ])

    const allProducts = [...coopeProducts, ...carrefourProducts]
    console.log(`📊 Productos encontrados en scraping real: ${allProducts.length}`)

    // Si no hay productos del scraping, no enviar nada
    if (allProducts.length === 0) {
      console.log("ℹ️ No se encontraron productos en el scraping - Sin notificaciones")
      return {
        total_products: 0,
        offers_found: 0,
        notifications_sent: 0,
        message: "Sin productos encontrados en scraping real",
      }
    }

    // Filtrar SOLO ofertas válidas (sin categorías de "super ofertas")
    const validOffers = allProducts.filter((product) => {
      const price = product.price
      const size = product.size?.toLowerCase() || ""
      const name = product.name?.toLowerCase() || ""
      const brand = product.brand?.toLowerCase() || ""

      // Verificar que es una marca válida
      const validBrands = ["pepsi", "coca-cola", "coca", "sprite", "fanta", "7up"]
      const isValidBrand = validBrands.some((validBrand) => brand.includes(validBrand) || name.includes(validBrand))

      if (!isValidBrand) return false

      // SOLO criterio: 500ml por debajo de $1000
      if (size.includes("500")) {
        return price < 1000
      }

      // 1.5L+ por debajo de $2000
      if (size.includes("1.5") || size.includes("1,5") || size.includes("2l") || size.includes("2 l")) {
        return price < 2000
      }

      return false
    })

    console.log(`🎉 Ofertas válidas encontradas: ${validOffers.length}`)

    let notificationsSent = 0

    // Enviar SOLO si hay ofertas reales
    if (validOffers.length > 0) {
      const result = await sendRealOffers(validOffers, chatIds, botToken)
      notificationsSent = result.sent
      console.log(`📤 Ofertas reales enviadas: ${result.sent}`)
    } else {
      console.log("ℹ️ No se encontraron ofertas válidas - Sin notificaciones")
    }

    return {
      total_products: allProducts.length,
      offers_found: validOffers.length,
      notifications_sent: notificationsSent,
      message:
        validOffers.length > 0
          ? `${validOffers.length} ofertas reales encontradas y enviadas`
          : "Sin ofertas válidas encontradas",
    }
  } catch (error) {
    console.error("❌ Error en executeRealScraping:", error)
    throw error
  }
}

// Scraping REAL de La Coope (SIN productos prefijados)
async function scrapeRealLaCoopeSanNicolas() {
  try {
    console.log("🏪 Scraping REAL La Coope en Casa - San Nicolás...")

    // TODO: Implementar scraping real con Puppeteer
    // Por ahora devuelve array vacío para no enviar ofertas falsas
    
    console.log("⚠️ Scraping real pendiente de implementar - Devolviendo array vacío")
    return []
  } catch (error) {
    console.error("❌ Error scraping La Coope:", error)
    return []
  }
}

// Scraping REAL de Carrefour (SIN productos prefijados)
async function scrapeRealCarrefourSanNicolas() {
  try {
    console.log("🏪 Scraping REAL Carrefour - San Nicolás...")

    // TODO: Implementar scraping real con Puppeteer
    // Por ahora devuelve array vacío para no enviar ofertas falsas
    
    console.log("⚠️ Scraping real pendiente de implementar - Devolviendo array vacío")
    return []
  } catch (error) {
    console.error("❌ Error scraping Carrefour:", error)
    return []
  }
}

// Enviar SOLO ofertas reales (sin categorías de super ofertas)
async function sendRealOffers(offers: any[], chatIds: string[], botToken: string) {
  if (offers.length === 0) return { sent: 0 }

  let message = "🎉 *OFERTAS REALES ENCONTRADAS*\n"
  message += "📍 *San Nicolás de los Arroyos (CP 2900)*\n\n"

  // Agrupar por tienda para mejor organización
  const offersByStore = offers.reduce((acc, offer) => {
    const store = offer.store || "Tienda desconocida"
    if (!acc[store]) acc[store] = []
    acc[store].push(offer)
    return acc
  }, {})

  Object.entries(offersByStore).forEach(([store, storeOffers]: [string, any[]]) => {
    message += `🏪 *${store.toUpperCase()}*\n`

    storeOffers.forEach((offer) => {
      message += `🥤 *${offer.brand?.toUpperCase() || "GASEOSA"}*\n`
      message += `💰 ${offer.name}\n`
      message += `💵 Precio: *$${offer.price}*\n`
      message += `📏 Tamaño: ${offer.size || "N/A"}\n`

      // Mostrar qué criterio cumple
      if (offer.size?.includes("500")) {
        message += `✅ _Oferta válida: 500ml < $1000_\n`
      } else if (offer.size?.includes("1.5") || offer.size?.includes("2")) {
        message += `✅ _Oferta válida: 1.5L+ < $2000_\n`
      }

      message += "\n"
    })
  })

  message += `🤖 _Scraping automático - Solo ofertas reales_\n`
  message += `📍 _San Nicolás de los Arroyos (CP 2900)_\n`
  message += `🕐 ${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`

  return await sendToUsers(message, chatIds, botToken)
}

// Función para enviar mensajes
async function sendToUsers(message: string, chatIds: string[], botToken: string) {
  let sent = 0

  for (const chatId of chatIds) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: "Markdown",
        }),
      })

      const result = await response.json()

      if (result.ok) {
        sent++
        console.log(`✅ Mensaje enviado a ${chatId}`)
      } else {
        console.error(`❌ Error enviando a ${chatId}:`, result)
      }

      // Delay entre mensajes
      await new Promise((resolve) => setTimeout(resolve, 200))
    } catch (error) {
      console.error(`❌ Error de conexión para ${chatId}:`, error)
    }
  }

  return { sent }
}
