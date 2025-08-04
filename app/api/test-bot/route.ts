import { NextResponse } from "next/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_IDS = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID

export async function GET() {
  try {
    console.log("TELEGRAM_BOT_TOKEN exists:", !!process.env.TELEGRAM_BOT_TOKEN)
    console.log("TELEGRAM_CHAT_IDS exists:", !!TELEGRAM_CHAT_IDS)

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_IDS) {
      return NextResponse.json(
        {
          error: "Faltan variables de entorno TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_IDS",
          debug: {
            hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
            hasChatIds: !!TELEGRAM_CHAT_IDS,
            tokenLength: process.env.TELEGRAM_BOT_TOKEN?.length || 0,
            chatIds: TELEGRAM_CHAT_IDS,
          },
        },
        { status: 400 },
      )
    }

    // Obtener lista de chat IDs
    const chatIds = TELEGRAM_CHAT_IDS.split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0)

    console.log(`Enviando mensaje de prueba a ${chatIds.length} usuarios:`, chatIds)

    let successCount = 0
    let failedCount = 0
    const results: any[] = []

    // Enviar mensaje de prueba a cada usuario
    for (const chatId of chatIds) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🤖 *Bot de Monitoreo Activado*\n\n✅ Configuración correcta para usuario: \`${chatId}\`\n🔍 Listo para monitorear ofertas de Pepsi y Coca-Cola\n\n📊 *Usuarios configurados:* ${chatIds.length}\n🕐 ${new Date().toLocaleString("es-AR")}`,
            parse_mode: "Markdown",
          }),
        })

        const result = await response.json()

        if (result.ok) {
          console.log(`✅ Mensaje enviado exitosamente a ${chatId}`)
          successCount++
          results.push({ chatId, status: "success", result })
        } else {
          console.error(`❌ Error enviando mensaje a ${chatId}:`, result)
          failedCount++
          results.push({ chatId, status: "error", error: result })
        }

        // Pequeño delay entre mensajes
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ Error de conexión para ${chatId}:`, error)
        failedCount++
        results.push({ chatId, status: "error", error: error.message })
      }
    }

    return NextResponse.json({
      success: successCount > 0,
      message: `Mensajes enviados: ${successCount} exitosos, ${failedCount} fallidos`,
      total_users: chatIds.length,
      successful_sends: successCount,
      failed_sends: failedCount,
      chat_ids: chatIds,
      detailed_results: results,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
