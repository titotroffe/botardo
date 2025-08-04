"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Bot,
  Search,
  Bell,
  TrendingDown,
  TestTube,
  RefreshCw,
  MapPin,
  Users,
  Monitor,
  AlertTriangle,
} from "lucide-react"
import { useState } from "react"

export default function Home() {
  const [isChecking, setIsChecking] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const testBot = async () => {
    try {
      const response = await fetch("/api/test-bot")
      const result = await response.json()

      if (result.success) {
        alert(
          `✅ Bot funcionando correctamente!\n\n📊 Mensajes enviados a ${result.total_users} usuarios:\n• ${result.successful_sends} exitosos\n• ${result.failed_sends} fallidos\n\nRevisa Telegram.`,
        )
      } else {
        alert("❌ Error: " + result.error)
        console.error("Error details:", result)
      }
    } catch (error) {
      alert("❌ Error de conexión")
      console.error(error)
    }
  }

  const testMonitor = async () => {
    try {
      const response = await fetch("/api/test-monitor")
      const result = await response.json()

      if (result.success) {
        alert(
          `✅ Monitor funcionando!\n\n🔧 Configuración:\n• Bot Token: ${result.environment.has_bot_token ? "✅" : "❌"}\n• Chat IDs: ${result.environment.has_chat_ids ? "✅" : "❌"}\n• Usuarios: ${result.environment.chat_ids_count}`,
        )
      } else {
        alert("❌ Error en monitor: " + result.error)
      }
    } catch (error) {
      alert("❌ Error de conexión con monitor")
      console.error(error)
    }
  }

  const testOffers = async () => {
    try {
      const response = await fetch("/api/test-offers")
      const result = await response.json()

      if (result.success) {
        alert(
          `🧪 Test de ofertas ejecutado!\n\n📊 Ofertas de prueba: ${result.test_offers}\n🔥 Super ofertas: ${result.super_deals}\n🎉 Ofertas normales: ${result.normal_deals}\n📤 Mensajes enviados: ${result.messages_sent}\n\n⚠️ Este es solo un test - Revisa Telegram`,
        )
      } else {
        alert("❌ Error en test: " + result.error)
      }
    } catch (error) {
      alert("❌ Error de conexión")
      console.error(error)
    }
  }

  const checkPrices = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/monitor")
      const result = await response.json()

      setLastResult(result)

      if (result.success) {
        let message = `✅ Monitoreo REAL completado para San Nicolás.\n`
        message += `📊 ${result.result?.total_products || 0} productos encontrados en scraping\n`

        if (result.result?.offers_found > 0) {
          message += `🎉 ${result.result.offers_found} ofertas REALES encontradas!\n`
          message += `📤 ${result.result.notifications_sent} notificaciones enviadas\n`
          message += `\n¡Revisa Telegram!`
        } else {
          message += `\nℹ️ No se encontraron ofertas válidas en este momento.\n(Esto es normal - solo envía cuando hay ofertas reales)`
        }

        alert(message)
      } else {
        alert("❌ Error: " + result.error)
      }
    } catch (error) {
      alert("❌ Error de conexión")
      console.error(error)
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Bot className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Bot Monitor de Precios</h1>
          </div>
          <p className="text-gray-600">Monitoreo automático REAL de gaseosas en San Nicolás de los Arroyos</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">San Nicolás de los Arroyos - CP 2900</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-600">Solo ofertas reales</span>
            </div>
          </div>
        </div>

        {/* Aviso importante */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Sistema Corregido - Solo Ofertas Reales
            </CardTitle>
            <CardDescription>El bot ahora solo envía notificaciones cuando encuentra ofertas reales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-orange-700">
                  <strong>Scraping real:</strong> El bot busca productos reales en las tiendas
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-orange-700">
                  <strong>Sin ofertas falsas:</strong> No envía productos por defecto
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-orange-700">
                  <strong>Solo cuando encuentra:</strong> Notificaciones únicamente con ofertas reales
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">ℹ️</span>
                <span className="text-sm text-orange-700">
                  <strong>Normal no recibir mensajes:</strong> Si no hay ofertas, no se envía nada
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* URLs para UptimeRobot */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Monitor className="h-5 w-5" />
              URLs para UptimeRobot
            </CardTitle>
            <CardDescription>Usa estas URLs para configurar el monitoreo automático</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-100 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🎯 URL Principal (Solo ofertas reales):</h4>
                <code className="text-sm bg-white p-2 rounded border block">
                  https://v0-telegram-price-bot.vercel.app/api/monitor
                </code>
                <p className="text-xs text-green-700 mt-1">✅ Solo envía cuando encuentra ofertas reales</p>
              </div>

              <div className="bg-blue-100 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🧪 URL de Test (Con ofertas de ejemplo):</h4>
                <code className="text-sm bg-white p-2 rounded border block">
                  https://v0-telegram-price-bot.vercel.app/api/test-offers
                </code>
                <p className="text-xs text-blue-700 mt-1">⚠️ Solo para probar - Envía ofertas de ejemplo</p>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚙️ Configuración UptimeRobot:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>
                    • <strong>URL:</strong> /api/monitor (para ofertas reales)
                  </li>
                  <li>
                    • <strong>Interval:</strong> 30 minutes
                  </li>
                  <li>
                    • <strong>Resultado esperado:</strong> Muchas veces "Sin ofertas" (normal)
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botones de prueba */}
        <div className="flex gap-4 justify-center mb-8 flex-wrap">
          <Button onClick={testBot} className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Probar Bot
          </Button>
          <Button onClick={testMonitor} variant="outline" className="flex items-center gap-2 bg-transparent">
            <Monitor className="h-4 w-4" />
            Probar Monitor
          </Button>
          <Button onClick={testOffers} variant="outline" className="flex items-center gap-2 bg-yellow-100">
            <TestTube className="h-4 w-4" />
            Test con Ofertas
          </Button>
          <Button
            onClick={checkPrices}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
            disabled={isChecking}
          >
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {isChecking ? "Monitoreando..." : "Monitoreo Real"}
          </Button>
        </div>

        {/* Resultado de la última verificación */}
        {lastResult && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Último Monitoreo Real
              </CardTitle>
              <CardDescription>San Nicolás de los Arroyos (CP 2900) - Solo ofertas reales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{lastResult.result?.total_products || 0}</div>
                  <div className="text-sm text-gray-500">Productos Scrapeados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{lastResult.result?.offers_found || 0}</div>
                  <div className="text-sm text-gray-500">Ofertas Reales</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{lastResult.result?.notifications_sent || 0}</div>
                  <div className="text-sm text-gray-500">Notificaciones Enviadas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {lastResult.result?.offers_found > 0 ? "✅" : "⏸️"}
                  </div>
                  <div className="text-sm text-gray-500">Estado</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Resultado:</strong> {lastResult.result?.message || lastResult.message}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {lastResult.result?.offers_found === 0
                    ? "✅ Normal - El bot solo envía cuando encuentra ofertas reales"
                    : "🎉 Ofertas reales encontradas y enviadas"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Criterios de Alerta
              </CardTitle>
              <CardDescription>Solo se envían ofertas que cumplan estos criterios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>🔥 Super Ofertas 500ml</span>
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
                  {"< $700"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Ofertas 500ml</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  {"< $1000"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Solo productos reales</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  Scraping
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Fuentes de Datos
              </CardTitle>
              <CardDescription>Sitios web monitoreados en tiempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>🏪 La Coope en Casa</span>
                <Badge variant="secondary">Scraping Real</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>🏪 Carrefour</span>
                <Badge variant="secondary">Scraping Real</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>📍 Ubicación</span>
                <Badge variant="outline">San Nicolás CP 2900</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">✅ Sistema Corregido:</h3>
          <div className="text-sm text-green-700 space-y-1">
            <div>
              • 🔍 <strong>Scraping real:</strong> Busca productos reales en las tiendas online
            </div>
            <div>
              • 🚫 <strong>Sin ofertas falsas:</strong> No envía productos por defecto
            </div>
            <div>
              • 📤 <strong>Solo cuando encuentra:</strong> Notificaciones únicamente con ofertas reales
            </div>
            <div>
              • ⏸️ <strong>Silencio es normal:</strong> Si no hay ofertas, no molesta con mensajes
            </div>
            <div>
              • 🎯 <strong>UptimeRobot listo:</strong> Usa /api/monitor para monitoreo automático
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
