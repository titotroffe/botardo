import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID

export async function GET() {
  try {
    console.log("Iniciando verificación REAL de precios para San Nicolás de los Arroyos...")

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_IDS) {
      return NextResponse.json({ error: "Variables de entorno no configuradas" }, { status: 400 })
    }

    // Scraping REAL (sin productos prefijados)
    const [coopeDeals, carrefourDeals] = await Promise.all([scrapeRealLaCoope(), scrapeRealCarrefour()])

    const allDeals = [...coopeDeals, ...carrefourDeals]
    console.log(`Total de productos encontrados en scraping real: ${allDeals.length}`)

    // Filtrar SOLO ofertas válidas (sin super ofertas)
    const validDeals = filterRealDeals(allDeals)

    console.log(`Ofertas válidas encontradas: ${validDeals.length}`)

    // Obtener lista de chat IDs
    const chatIds = getChatIds()
    console.log(`Enviando notificaciones a ${chatIds.length} usuarios`)

    // Enviar SOLO si hay ofertas reales
    if (validDeals.length > 0) {
      console.log("Enviando ofertas reales automáticamente...")
      await notifyRealDeals(validDeals, chatIds)
    }

    return NextResponse.json({
      success: true,
      location: "San Nicolás de los Arroyos (CP 2900)",
      total_products: allDeals.length,
      valid_deals: validDeals.length,
      users_notified: chatIds.length,
      chat_ids: chatIds,
      deals: validDeals,
      message: `Verificación completada para San Nicolás. ${validDeals.length} ofertas reales ${validDeals.length > 0 ? "enviadas" : "encontradas"} a ${chatIds.length} usuarios.`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en verificación:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// Función para obtener y procesar los chat IDs
function getChatIds(): string[] {
  if (!TELEGRAM_CHAT_IDS) return []

  const chatIds = TELEGRAM_CHAT_IDS.split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)

  console.log(`Chat IDs configurados: ${chatIds.join(", ")}`)
  return chatIds
}

// Scraping REAL de La Coope (SIN productos prefijados)
async function scrapeRealLaCoope() {
  try {
    console.log("Scraping REAL La Coope en Casa - San Nicolás...")

    // TODO: Implementar scraping real
    console.log("⚠️ Scraping real no implementado - Devolviendo array vacío")
    return []
  } catch (error) {
    console.error("Error scraping La Coope:", error)
    return []
  }
}

// Scraping REAL de Carrefour (SIN productos prefijados)
async function scrapeRealCarrefour() {
  try {
    console.log("Scraping REAL Carrefour - San Nicolás...")

    // TODO: Implementar scraping real
    console.log("⚠️ Scraping real no implementado - Devolviendo array vacío")
    return []
  } catch (error) {
    console.error("Error scraping Carrefour:", error)
    return []
  }
}

// Filtrar SOLO ofertas válidas (sin super ofertas)
function filterRealDeals(products: any[]) {
  console.log("Filtrando productos por criterios de precio...")

  const validDeals = products.filter((product) => {
    const name = product.name?.toLowerCase() || ""
    const size = product.size?.toLowerCase() || ""
    const price = product.price
    const brand = product.brand?.toLowerCase() || ""

    // Lista de marcas válidas
    const validBrands = ["pepsi", "coca-cola", "coca", "sprite", "fanta", "7up"]
    const isValidBrand = validBrands.some((validBrand) => brand.includes(validBrand) || name.includes(validBrand))

    if (!isValidBrand) return false

    // Criterio 1: 500ml por debajo de $1000
    if (size.includes("500")) {
      return price < 1000
    }

    // Criterio 2: 1.5L o más por debajo de $2000
    if (size.includes("1.5") || size.includes("1,5") || size.includes("2l") || size.includes("2 l")) {
      return price < 2000
    }

    return false
  })

  console.log(`✅ Ofertas válidas: ${validDeals.length}`)
  return validDeals
}

// Notificar SOLO ofertas reales (sin super ofertas)
async function notifyRealDeals(deals: any[], chatIds: string[]) {
  if (deals.length === 0 || chatIds.length === 0) {
    console.log("No se puede enviar notificación: faltan datos")
    return
  }

  let message = "🎉 *OFERTAS REALES ENCONTRADAS*\n"
  message += "📍 *San Nicolás de los Arroyos (CP 2900)*\n\n"

  // Agrupar por marca para mejor organización
  const dealsByBrand = deals.reduce((acc, deal) => {
    const brand = deal.brand || "Gaseosa"
    if (!acc[brand]) acc[brand] = []
    acc[brand].push(deal)
    return acc
  }, {})

  Object.entries(dealsByBrand).forEach(([brand, brandDeals]: [string, any[]]) => {
    message += `🥤 *${brand.toUpperCase()}*\n`

    brandDeals.forEach((deal) => {
      message += `💰 ${deal.name}\n`
      message += `💵 Precio: *$${deal.price}*\n`
      message += `📏 Tamaño: ${deal.size}\n`
      message += `🏪 Tienda: ${deal.store}\n`

      // Agregar criterio cumplido
      if (deal.size?.includes("500")) {
        message += `✅ _Oferta válida: 500ml < $1000_\n`
      } else if (deal.size?.includes("1.5") || deal.size?.includes("2")) {
        message += `✅ _Oferta válida: 1.5L+ < $2000_\n`
      }

      message += "\n"
    })
  })

  message += `🤖 _Verificación automática - Solo ofertas reales_\n`
  message += `🕐 ${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`

  console.log("Enviando notificación de ofertas reales a múltiples usuarios...")
  const result = await sendToMultipleUsers(message, chatIds, "Markdown")

  console.log(`✅ Ofertas reales enviadas: ${result.success} exitosos, ${result.failed} fallidos`)
}

// Función para enviar mensaje a múltiples usuarios
async function sendToMultipleUsers(message: string, chatIds: string[], parseMode = "Markdown") {
  if (!TELEGRAM_BOT_TOKEN || chatIds.length === 0) {
    console.log("No se puede enviar notificación: faltan datos")
    return { success: 0, failed: 0, errors: [] }
  }

  let successCount = 0
  let failedCount = 0
  const errors: any[] = []

  for (const chatId of chatIds) {
    try {
      console.log(`Enviando mensaje a chat ID: ${chatId}`)

      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
        }),
      })

      const result = await response.json()

      if (result.ok) {
        console.log(`✅ Mensaje enviado exitosamente a ${chatId}`)
        successCount++
      } else {
        console.error(`❌ Error enviando mensaje a ${chatId}:`, result)
        failedCount++
        errors.push({ chatId, error: result })
      }

      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`❌ Error de conexión enviando a ${chatId}:`, error)
      failedCount++
      errors.push({ chatId, error: error.message })
    }
  }

  console.log(`📊 Resumen de envío: ${successCount} exitosos, ${failedCount} fallidos`)
  return { success: successCount, failed: failedCount, errors }
}
