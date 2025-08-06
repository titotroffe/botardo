"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bot, Search, Bell, TrendingDown, TestTube, RefreshCw, MapPin, Users, Monitor, AlertTriangle, Clock } from 'lucide-react'
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
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">Solo ofertas reales</span>
            </div>
          </div>
        </div>

        {/* Aviso de cuenta Hobby */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <Clock className="h-5 w-5" />
              Cuenta Hobby - Monitoreo Diario
            </CardTitle>
            <CardDescription>Vercel Hobby permite solo 1 cron job por día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-orange-600">⏰</span>
                <span className="text-sm text-orange-700">
                  <strong>Frecuencia:</strong> Una vez por día a las 9:00 AM (Argentina)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">💡</span>
                <span className="text-sm text-orange-700">
                  <strong>Alternativa:</strong> Usa UptimeRobot (gratis) para monitoreo cada 30 minutos
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-600">✅</span>
                <span className="text-sm text-orange-700">
                  <strong>Ventaja:</strong> UptimeRobot es más confiable que cron jobs
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
              UptimeRobot (Recomendado) - Gratis
            </CardTitle>
            <CardDescription>Monitoreo cada 30 minutos sin limitaciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-green-100 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">🎯 URL para UptimeRobot:</h4>
              <code className="text-sm bg-white p-2 rounded border block">
                https://v0-telegram-price-bot.vercel.app/api/monitor
              </code>
              <p className="text-xs text-green-700 mt-1">✅ Sin productos prefijados - Solo scraping real</p>
            </div>

            <div className="bg-blue-100 p-4 rounded-lg mt-4">
              <h4 className="font-semibold text-blue-800 mb-2">⚙️ Configuración UptimeRobot:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• <strong>Monitor Type:</strong> HTTP(s)</li>
                <li>• <strong>URL:</strong> https://v0-telegram-price-bot.vercel.app/api/monitor</li>
                <li>• <strong>Monitoring Interval:</strong> 30 minutes</li>
                <li>• <strong>Timeout:</strong> 30 seconds</li>
                <li>• <strong>Gratis:</strong> Hasta 50 monitores</li>
              </ul>
            </div>

            <div className="bg-yellow-100 p-4 rounded-lg mt-4">
              <h4 className="font-semibold text-yellow-800 mb-2">🔗 Crear cuenta UptimeRobot:</h4>
              <p className="text-sm text-yellow-700 mb-2">
                1. Ve a <strong>uptimerobot.com</strong><br/>
                2. Crea cuenta gratuita<br/>
                3. Add New Monitor → HTTP(s)<br/>
                4. Pega la URL de arriba<br/>
                5. Set interval: 30 minutes
              </p>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                ✅ Más confiable que Vercel Cron Jobs
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vercel Cron Job (limitado) */}
        <Card className="mb-8 border-gray-200 bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <AlertTriangle className="h-5 w-5" />
              Vercel Cron Job (Limitado)
            </CardTitle>
            <CardDescription>Solo una vez por día en cuenta Hobby</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Frecuencia</span>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  1 vez por día
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Horario</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  9:00 AM (Argentina)
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Estado</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Configurado
                </Badge>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Limitación:</strong> Vercel Hobby solo permite 1 cron job por día. Para monitoreo más frecuente, usa UptimeRobot (gratis) o upgrade a Vercel Pro.
              </p>
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
          <Button
            onClick={checkPrices}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
            disabled={isChecking}
          >
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {isChecking ? "Monitoreando..." : "Monitoreo Manual"}
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
              <div className="grid md:grid-cols-3 gap-4">
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
                <span>Ofertas 500ml</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                  {'< $1000'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Botellas 1.5L+</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                  {'< $2000'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Solo productos reales</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                  Scraping
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Opciones de Monitoreo
              </CardTitle>
              <CardDescription>Diferentes formas de automatizar el bot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span>🤖 UptimeRobot</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Cada 30 min - Gratis
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>⏰ Vercel Cron</span>
                <Badge variant="outline" className="bg-orange-100 text-orange-800">
                  1 vez/día - Hobby
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>🔧 Manual</span>
                <Badge variant="outline">
                  Cuando quieras
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Recomendación:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>
              • 🎯 <strong>Usa UptimeRobot:</strong> Gratis, confiable, cada 30 minutos
            </div>
            <div>
              • ⏰ <strong>Vercel Cron:</strong> Solo 1 vez por día (limitación Hobby)
            </div>
            <div>
              • 🔧 <strong>Monitoreo manual:</strong> Usa el botón "Monitoreo Manual" cuando quieras
            </div>
            <div>
              • 📈 <strong>Para upgrade:</strong> Vercel Pro ($20/mes) permite cron jobs ilimitados
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
