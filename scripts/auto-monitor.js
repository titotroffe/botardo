// Script para monitoreo automático continuo
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

// Configuración para San Nicolás de los Arroyos
const SAN_NICOLAS_CONFIG = {
  codigoPostal: "2900",
  ciudad: "San Nicolás de los Arroyos",
  provincia: "Buenos Aires",
}

async function monitoreoAutomatico() {
  console.log(`🤖 Iniciando monitoreo automático para ${SAN_NICOLAS_CONFIG.ciudad}...`)
  console.log(`📍 Código Postal: ${SAN_NICOLAS_CONFIG.codigoPostal}`)

  try {
    // Hacer request al endpoint de verificación
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://tu-dominio.vercel.app"

    const response = await fetch(`${baseUrl}/api/check-prices`)
    const result = await response.json()

    if (result.success) {
      console.log(`✅ Verificación completada: ${result.valid_deals} ofertas encontradas`)

      if (result.valid_deals === 0) {
        console.log("ℹ️ No hay ofertas en este momento")
      } else {
        console.log(`🎉 ${result.valid_deals} ofertas enviadas automáticamente`)
      }
    } else {
      console.error("❌ Error en verificación:", result.error)
    }
  } catch (error) {
    console.error("❌ Error en monitoreo automático:", error)

    // Enviar notificación de error
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: `⚠️ *Error en monitoreo automático*\n\n📍 San Nicolás de los Arroyos\n🕐 ${new Date().toLocaleString("es-AR")}\n\n_El bot intentará nuevamente en la próxima verificación._`,
            parse_mode: "Markdown",
          }),
        })
      } catch (notifyError) {
        console.error("Error enviando notificación de error:", notifyError)
      }
    }
  }
}

async function enviarNotificacionInicio() {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log("⚠️ Variables de entorno no configuradas")
    return
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: `🤖 *Bot de Monitoreo Iniciado*\n\n📍 *Ubicación:* ${SAN_NICOLAS_CONFIG.ciudad}\n📮 *CP:* ${SAN_NICOLAS_CONFIG.codigoPostal}\n\n🔍 *Monitoreando:*\n• La Coope en Casa\n• Carrefour\n\n⏰ *Frecuencia:* Cada 30 minutos\n\n✅ *Criterios:*\n• 500ml < $1000\n• 1.5L+ < $2000\n\n🕐 Iniciado: ${new Date().toLocaleString("es-AR")}`,
        parse_mode: "Markdown",
      }),
    })

    console.log("✅ Notificación de inicio enviada")
  } catch (error) {
    console.error("Error enviando notificación de inicio:", error)
  }
}

// Función principal
async function main() {
  console.log("🚀 Iniciando sistema de monitoreo automático...")

  // Enviar notificación de inicio
  await enviarNotificacionInicio()

  // Ejecutar primera verificación
  await monitoreoAutomatico()

  // Programar verificaciones cada 30 minutos (1800000 ms)
  setInterval(
    async () => {
      console.log("\n" + "=".repeat(50))
      console.log("🔄 Ejecutando verificación programada...")
      await monitoreoAutomatico()
    },
    30 * 60 * 1000,
  ) // 30 minutos

  console.log("✅ Sistema de monitoreo automático configurado")
  console.log("⏰ Próxima verificación en 30 minutos")
}

// Manejar cierre del proceso
process.on("SIGINT", async () => {
  console.log("\n🛑 Deteniendo monitoreo automático...")

  if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
    try {
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: `🛑 *Bot de Monitoreo Detenido*\n\n📍 San Nicolás de los Arroyos\n🕐 ${new Date().toLocaleString("es-AR")}\n\n_El monitoreo automático ha sido pausado._`,
          parse_mode: "Markdown",
        }),
      })
    } catch (error) {
      console.error("Error enviando notificación de cierre:", error)
    }
  }

  process.exit(0)
})

// Ejecutar
main().catch(console.error)
