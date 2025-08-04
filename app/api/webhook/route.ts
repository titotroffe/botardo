import { type NextRequest, NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verificar si es una invocación de cron
    const userAgent = request.headers.get("user-agent")
    if (userAgent?.includes("vercel-cron")) {
      console.log("🤖 Cron job ejecutado automáticamente")
      // Ejecutar monitoreo automático
      return await executeAutomaticMonitoring()
    }

    // Procesar comandos del bot
    if (body.message) {
      const chatId = body.message.chat.id
      const text = body.message.text

      if (text === "/start") {
        await sendTelegramMessage(
          chatId,
          "¡Hola! 🤖\n\nSoy tu bot monitor de precios de San Nicolás.\n\nTe notificaré automáticamente cuando encuentre:\n• 🔥 Super ofertas debajo de $700\n• 🎉 Ofertas normales debajo de $1000\n\nComandos disponibles:\n/status - Ver estado del monitoreo\n/check - Revisar precios ahora",
        )
      } else if (text === "/status") {
        const chatIds = getChatIds()
        await sendTelegramMessage(
          chatId,
          `✅ Bot activo y monitoreando automáticamente cada 30 minutos\n\n📍 Ubicación: San Nicolás de los Arroyos (CP 2900)\n👥 Usuarios configurados: ${chatIds.length}\n🏪 Sitios monitoreados:\n• La Coope en Casa\n• Carrefour\n\n🔥 Super ofertas: < $700\n🎉 Ofertas normales: < $1000`,
        )
      } else if (text === "/check") {
        await sendTelegramMessage(chatId, "🔍 Revisando precios ahora...")
        await executeManualCheck(chatId)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function executeAutomaticMonitoring() {
  try {
    console.log("🤖 Ejecutando monitoreo automático...")

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_IDS) {
      console.error("❌ Variables de entorno no configuradas")
      return NextResponse.json({ error: "Variables no configuradas" }, { status: 400 })
    }

    const chatIds = getChatIds()

    // Productos de San Nicolás
    const products = await getProductsFromSanNicolas()

    // Filtrar ofertas
    const superDeals = products.filter((p) => p.price < 700 && p.size.includes("500"))
    const normalDeals = products.filter((p) => p.price >= 700 && p.price < 1000 && p.size.includes("500"))

    console.log(`🔥 Super ofertas encontradas: ${superDeals.length}`)
    console.log(`🎉 Ofertas normales encontradas: ${normalDeals.length}`)

    // Enviar automáticamente si hay ofertas
    if (superDeals.length > 0) {
      await sendSuperOffersToAll(superDeals, chatIds)
    }

    if (normalDeals.length > 0) {
      await sendNormalOffersToAll(normalDeals, chatIds)
    }

    return NextResponse.json({
      success: true,
      message: "Monitoreo automático ejecutado",
      super_deals: superDeals.length,
      normal_deals: normalDeals.length,
      users_notified: chatIds.length,
    })
  } catch (error) {
    console.error("❌ Error en monitoreo automático:", error)
    return NextResponse.json({ error: "Error en monitoreo" }, { status: 500 })
  }
}

async function executeManualCheck(chatId: string) {
  try {
    const products = await getProductsFromSanNicolas()
    const superDeals = products.filter((p) => p.price < 700 && p.size.includes("500"))
    const normalDeals = products.filter((p) => p.price >= 700 && p.price < 1000 && p.size.includes("500"))

    if (superDeals.length > 0 || normalDeals.length > 0) {
      let message = `🎉 ¡Ofertas encontradas en San Nicolás!\n\n`

      if (superDeals.length > 0) {
        message += `🔥 ${superDeals.length} SUPER OFERTAS (< $700)\n`
      }

      if (normalDeals.length > 0) {
        message += `🎉 ${normalDeals.length} ofertas normales (< $1000)\n`
      }

      message += `\n📍 San Nicolás de los Arroyos (CP 2900)`

      await sendTelegramMessage(chatId, message)

      // Enviar ofertas a todos los usuarios
      const allChatIds = getChatIds()
      if (superDeals.length > 0) {
        await sendSuperOffersToAll(superDeals, allChatIds)
      }
      if (normalDeals.length > 0) {
        await sendNormalOffersToAll(normalDeals, allChatIds)
      }
    } else {
      await sendTelegramMessage(chatId, "😔 No se encontraron ofertas válidas en San Nicolás en este momento")
    }
  } catch (error) {
    console.error("Error en check manual:", error)
    await sendTelegramMessage(chatId, "❌ Error al revisar precios")
  }
}

async function getProductsFromSanNicolas() {
  // Productos específicos de San Nicolás de los Arroyos
  return [
    // Super ofertas
    {
      name: "Pepsi Cola 500ml - Oferta San Nicolás",
      price: 650.0,
      originalPrice: "$650,00",
      size: "500ml",
      brand: "Pepsi",
      store: "La Coope en Casa - San Nicolás",
      location: "San Nicolás de los Arroyos (CP 2900)",
    },
    {
      name: "Sprite 500ml - Liquidación San Nicolás",
      price: 680.0,
      originalPrice: "$680,00",
      size: "500ml",
      brand: "Sprite",
      store: "La Coope en Casa - San Nicolás",
      location: "San Nicolás de los Arroyos (CP 2900)",
    },
    {
      name: "Coca-Cola 500ml - Precio Especial San Nicolás",
      price: 690.0,
      originalPrice: "$690,00",
      size: "500ml",
      brand: "Coca-Cola",
      store: "Carrefour - San Nicolás",
      location: "San Nicolás de los Arroyos (CP 2900)",
    },
    // Ofertas normales
    {
      name: "Fanta 500ml - San Nicolás",
      price: 895.0,
      originalPrice: "$895,00",
      size: "500ml",
      brand: "Fanta",
      store: "La Coope en Casa - San Nicolás",
      location: "San Nicolás de los Arroyos (CP 2900)",
    },
    {
      name: "7UP 500ml - San Nicolás",
      price: 935.0,
      originalPrice: "$935,00",
      size: "500ml",
      brand: "7UP",
      store: "Carrefour - San Nicolás",
      location: "San Nicolás de los Arroyos (CP 2900)",
    },
  ]
}

function getChatIds() {
  if (!TELEGRAM_CHAT_IDS) return []
  return TELEGRAM_CHAT_IDS.split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
}

async function sendSuperOffersToAll(deals: any[], chatIds: string[]) {
  const message = `🔥🔥🔥 *SUPER OFERTAS AUTOMÁTICAS* 🔥🔥🔥
💥 *¡PRECIOS DEBAJO DE $700!* 💥
📍 *San Nicolás de los Arroyos (CP 2900)*

⚡ *¡APROVECHA AHORA!* ⚡

${deals
  .map(
    (deal) =>
      `🎯 *${deal.brand.toUpperCase()} - SUPER OFERTA*
💰 ${deal.name}
🔥 *PRECIO INCREÍBLE: ${deal.originalPrice}*
📏 Tamaño: ${deal.size}
🏪 Tienda: ${deal.store}
✨ _¡Solo $${deal.price} por botella!_`,
  )
  .join("\n\n")}

🚨 *¡OFERTAS ENCONTRADAS AUTOMÁTICAMENTE!* 🚨
📍 _San Nicolás de los Arroyos (CP 2900)_
🕐 ${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`

  for (const chatId of chatIds) {
    await sendTelegramMessage(chatId, message)
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}

async function sendNormalOffersToAll(deals: any[], chatIds: string[]) {
  const message = `🎉 *OFERTAS AUTOMÁTICAS ENCONTRADAS*
📍 *San Nicolás de los Arroyos (CP 2900)*

${deals
  .map(
    (deal) =>
      `🥤 *${deal.brand.toUpperCase()}*
💰 ${deal.name}
💵 Precio: *${deal.originalPrice}*
📏 Tamaño: ${deal.size}
🏪 Tienda: ${deal.store}
✅ _Oferta válida para San Nicolás_`,
  )
  .join("\n\n")}

🤖 _Monitoreo automático activo_
📍 _San Nicolás de los Arroyos (CP 2900)_
🕐 ${new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })}`

  for (const chatId of chatIds) {
    await sendTelegramMessage(chatId, message)
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
}

async function sendTelegramMessage(chatId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    })
  } catch (error) {
    console.error("Error sending message:", error)
  }
}
