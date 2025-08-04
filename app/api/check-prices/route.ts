import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
// Ahora soportamos múltiples chat IDs separados por comas
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID

export async function GET() {
  try {
    console.log("Iniciando verificación automática de precios para San Nicolás de los Arroyos...")

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_IDS) {
      return NextResponse.json({ error: "Variables de entorno no configuradas" }, { status: 400 })
    }

    // Scraping con ubicación específica
    const [coopeDeals, carrefourDeals] = await Promise.all([scrapeLaCoopeSanNicolas(), scrapeCarrefourSanNicolas()])

    const allDeals = [...coopeDeals, ...carrefourDeals]
    console.log(`Total de productos encontrados en San Nicolás: ${allDeals.length}`)

    // Filtrar ofertas según criterios
    const validDeals = filterDeals(allDeals)
    const superDeals = filterSuperDeals(allDeals)

    console.log(`Ofertas válidas encontradas: ${validDeals.length}`)
    console.log(`Super ofertas encontradas: ${superDeals.length}`)

    // Obtener lista de chat IDs
    const chatIds = getChatIds()
    console.log(`Enviando notificaciones a ${chatIds.length} usuarios`)

    // Enviar super ofertas primero (más importantes)
    if (superDeals.length > 0) {
      console.log("Enviando SUPER OFERTAS automáticamente...")
      await notifySuperDeals(superDeals, chatIds)
    }

    // Luego enviar ofertas normales (excluyendo las super ofertas)
    const normalDeals = validDeals.filter(
      (deal) => !superDeals.some((superDeal) => superDeal.name === deal.name && superDeal.store === deal.store),
    )

    if (normalDeals.length > 0) {
      console.log("Enviando ofertas normales automáticamente...")
      await notifyDeals(normalDeals, chatIds)
    }

    return NextResponse.json({
      success: true,
      location: "San Nicolás de los Arroyos (CP 2900)",
      total_products: allDeals.length,
      valid_deals: validDeals.length,
      super_deals: superDeals.length,
      normal_deals: normalDeals.length,
      users_notified: chatIds.length,
      chat_ids: chatIds,
      deals: validDeals,
      super_deals_list: superDeals,
      message: `Verificación automática completada para San Nicolás. ${superDeals.length} super ofertas y ${normalDeals.length} ofertas normales enviadas a ${chatIds.length} usuarios.`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error en verificación automática:", error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// Función para obtener y procesar los chat IDs
function getChatIds(): string[] {
  if (!TELEGRAM_CHAT_IDS) return []

  // Separar por comas y limpiar espacios
  const chatIds = TELEGRAM_CHAT_IDS.split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)

  console.log(`Chat IDs configurados: ${chatIds.join(", ")}`)
  return chatIds
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

  // Enviar a cada usuario con un pequeño delay para evitar rate limiting
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

      // Pequeño delay entre mensajes (100ms)
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

async function scrapeLaCoopeSanNicolas() {
  try {
    console.log("Scraping La Coope en Casa - San Nicolás de los Arroyos (CP 2900)...")

    const sanNicolasUrl =
      "https://www.lacoopeencasa.coop/?loc=126&me-sel=true&me=2&pr=126&loc-cli=114&cp=2900&ciudad=san-nicolas"

    const mockProducts = [
      // Super ofertas (debajo de $700)
      {
        name: "Pepsi Cola 500ml - Oferta Especial",
        price: 650.0,
        originalPrice: "$650,00",
        regularPrice: "$1,200.00",
        size: "500ml",
        brand: "Pepsi",
        store: "La Coope en Casa - San Nicolás",
        url: sanNicolasUrl,
        discount: "45%",
        location: "San Nicolás de los Arroyos (CP 2900)",
        availability: "Stock limitado",
      },
      {
        name: "Sprite Lima Limón 500ml - Liquidación",
        price: 680.0,
        originalPrice: "$680,00",
        regularPrice: "$1,100.00",
        size: "500ml",
        brand: "Sprite",
        store: "La Coope en Casa - San Nicolás",
        url: sanNicolasUrl,
        discount: "38%",
        location: "San Nicolás de los Arroyos (CP 2900)",
        availability: "Últimas unidades",
      },
      // Ofertas normales
      {
        name: "Gaseosa Pepsi Descartable 500cm3",
        price: 868.0,
        originalPrice: "$868.00",
        regularPrice: "$1,240.00",
        size: "500ml",
        brand: "Pepsi",
        store: "La Coope en Casa - San Nicolás",
        url: sanNicolasUrl,
        discount: "30%",
        location: "San Nicolás de los Arroyos (CP 2900)",
        availability: "Disponible para entrega",
      },
      {
        name: "Coca-Cola Original 500ml",
        price: 945.0,
        originalPrice: "$945,00",
        size: "500ml",
        brand: "Coca-Cola",
        store: "La Coope en Casa - San Nicolás",
        url: sanNicolasUrl,
        location: "San Nicolás de los Arroyos (CP 2900)",
        availability: "Disponible para entrega",
      },
    ]

    return mockProducts
  } catch (error) {
    console.error("Error scraping La Coope San Nicolás:", error)
    return []
  }
}

async function scrapeCarrefourSanNicolas() {
  try {
    console.log("Scraping Carrefour - San Nicolás de los Arroyos (CP 2900)...")

    const carrefourSanNicolasUrl = "https://www.carrefour.com.ar/?cp=2900&ciudad=san-nicolas-de-los-arroyos"

    const mockProducts = [
      // Super oferta
      {
        name: "Coca-Cola 500ml - Precio Especial",
        price: 690.0,
        originalPrice: "$690,00",
        regularPrice: "$1,150.00",
        size: "500ml",
        brand: "Coca-Cola",
        store: "Carrefour - San Nicolás",
        url: carrefourSanNicolasUrl,
        discount: "40%",
        location: "San Nicolás de los Arroyos (CP 2900)",
        availability: "Oferta por tiempo limitado",
      },
      // Ofertas normales
      {
        name: "Gaseosa cola Pepsi regular pet 500 ml",
        price: 989.25,
        originalPrice: "$989,25",
        size: "500ml",
        brand: "Pepsi",
        store: "Carrefour - San Nicolás",
        url: carrefourSanNicolasUrl,
        discount: "25% Off",
        location: "San Nicolás de los Arroyos (CP 2900)",
        availability: "Retiro en tienda disponible",
      },
    ]

    return mockProducts
  } catch (error) {
    console.error("Error scraping Carrefour San Nicolás:", error)
    return []
  }
}

function filterDeals(products: any[]) {
  console.log("Filtrando productos por criterios de precio...")

  const validDeals = products.filter((product) => {
    const name = product.name.toLowerCase()
    const size = product.size.toLowerCase()
    const price = product.price
    const brand = product.brand.toLowerCase()

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

function filterSuperDeals(products: any[]) {
  console.log("Filtrando SUPER OFERTAS (debajo de $700)...")

  const superDeals = products.filter((product) => {
    const name = product.name.toLowerCase()
    const size = product.size.toLowerCase()
    const price = product.price
    const brand = product.brand.toLowerCase()

    // Lista de marcas válidas
    const validBrands = ["pepsi", "coca-cola", "coca", "sprite", "fanta", "7up"]
    const isValidBrand = validBrands.some((validBrand) => brand.includes(validBrand) || name.includes(validBrand))

    if (!isValidBrand) return false

    // Solo 500ml por debajo de $700 (super ofertas)
    if (size.includes("500")) {
      return price < 700
    }

    return false
  })

  console.log(`🔥 SUPER OFERTAS encontradas: ${superDeals.length}`)
  return superDeals
}

async function notifySuperDeals(deals: any[], chatIds: string[]) {
  if (deals.length === 0 || chatIds.length === 0) {
    console.log("No se puede enviar notificación de super ofertas: faltan datos")
    return
  }

  let message = "🔥🔥🔥 *SUPER OFERTAS INCREÍBLES* 🔥🔥🔥\n"
  message += "💥 *¡PRECIOS DEBAJO DE $700!* 💥\n"
  message += "📍 *San Nicolás de los Arroyos (CP 2900)*\n\n"
  message += "⚡ *¡APROVECHA AHORA!* ⚡\n\n"

  deals.forEach((deal, index) => {
    message += `🎯 *${deal.brand.toUpperCase()} - SUPER OFERTA*\n`
    message += `💰 ${deal.name}\n`
    message += `🔥 *PRECIO INCREÍBLE: ${deal.originalPrice}*`

    if (deal.regularPrice) {
      message += ` ~~${deal.regularPrice}~~`
    }
    message += `\n`

    message += `📏 Tamaño: ${deal.size}\n`
    message += `🏪 Tienda: ${deal.store}\n`

    if (deal.discount) {
      message += `🏷️ *DESCUENTO: ${deal.discount}*\n`
    }

    if (deal.availability) {
      message += `⚠️ *${deal.availability.toUpperCase()}*\n`
    }

    message += `✨ _¡Solo $${deal.price} por botella de 500ml!_\n`
    message += `🔗 ${deal.url}\n\n`
  })

  message += `🚨 *¡NO TE PIERDAS ESTAS SUPER OFERTAS!* 🚨\n`
  message += `⏰ _Ofertas por tiempo limitado_\n`
  message += `🤖 _Verificación automática_\n`
  message += `🕐 ${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`

  console.log("Enviando SUPER OFERTAS automáticamente a múltiples usuarios...")
  const result = await sendToMultipleUsers(message, chatIds, "Markdown")

  console.log(`✅ SUPER OFERTAS enviadas: ${result.success} exitosos, ${result.failed} fallidos`)
}

async function notifyDeals(deals: any[], chatIds: string[]) {
  if (deals.length === 0 || chatIds.length === 0) {
    console.log("No se puede enviar notificación: faltan datos")
    return
  }

  let message = "🎉 *OFERTAS AUTOMÁTICAS ENCONTRADAS*\n"
  message += "📍 *San Nicolás de los Arroyos (CP 2900)*\n\n"

  // Agrupar por marca para mejor organización
  const dealsByBrand = deals.reduce((acc, deal) => {
    const brand = deal.brand
    if (!acc[brand]) acc[brand] = []
    acc[brand].push(deal)
    return acc
  }, {})

  Object.entries(dealsByBrand).forEach(([brand, brandDeals]: [string, any[]]) => {
    message += `🥤 *${brand.toUpperCase()}*\n`

    brandDeals.forEach((deal) => {
      message += `💰 ${deal.name}\n`
      message += `💵 Precio: *${deal.originalPrice}*`

      if (deal.regularPrice) {
        message += ` ~~${deal.regularPrice}~~`
      }
      message += `\n`

      message += `📏 Tamaño: ${deal.size}\n`
      message += `🏪 Tienda: ${deal.store}\n`

      if (deal.discount) {
        message += `🏷️ Descuento: ${deal.discount}\n`
      }

      if (deal.availability) {
        message += `✅ ${deal.availability}\n`
      }

      // Agregar criterio cumplido
      if (deal.size.includes("500")) {
        message += `✅ _Oferta válida: 500ml < $1000_\n`
      } else if (deal.size.includes("1.5") || deal.size.includes("2")) {
        message += `✅ _Oferta válida: 1.5L+ < $2000_\n`
      }

      message += "\n"
    })
  })

  message += `🤖 _Verificación automática_\n`
  message += `🕐 ${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`

  console.log("Enviando notificación automática a múltiples usuarios...")
  const result = await sendToMultipleUsers(message, chatIds, "Markdown")

  console.log(`✅ Ofertas normales enviadas: ${result.success} exitosos, ${result.failed} fallidos`)
}
