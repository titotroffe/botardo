"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, Settings, Users, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

export default function SetupPage() {
  const [botToken, setBotToken] = useState("")
  const [chatIds, setChatIds] = useState<string[]>([""])
  const [step, setStep] = useState(1)

  const addChatId = () => {
    setChatIds([...chatIds, ""])
  }

  const removeChatId = (index: number) => {
    if (chatIds.length > 1) {
      setChatIds(chatIds.filter((_, i) => i !== index))
    }
  }

  const updateChatId = (index: number, value: string) => {
    const newChatIds = [...chatIds]
    newChatIds[index] = value
    setChatIds(newChatIds)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Copiado al portapapeles!")
  }

  const getValidChatIds = () => chatIds.filter((id) => id.trim().length > 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Settings className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Configuración del Bot</h1>
          </div>
          <p className="text-gray-600">Configura tu bot para enviar notificaciones a múltiples usuarios</p>
        </div>

        <div className="space-y-6">
          {/* Paso 1: Crear Bot */}
          <Card className={step === 1 ? "ring-2 ring-blue-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  1
                </span>
                Crear Bot en Telegram
              </CardTitle>
              <CardDescription>Crea tu bot usando BotFather</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">1. Abre Telegram y busca @BotFather</p>
                <p className="text-sm text-gray-600">2. Envía el comando /newbot</p>
                <p className="text-sm text-gray-600">3. Sigue las instrucciones para crear tu bot</p>
                <p className="text-sm text-gray-600">4. Copia el token que te proporciona</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bot-token">Token del Bot</Label>
                <div className="flex gap-2">
                  <Input
                    id="bot-token"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(`TELEGRAM_BOT_TOKEN=${botToken}`)}
                    disabled={!botToken}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={() => setStep(2)} disabled={!botToken} className="w-full">
                Continuar al Paso 2
              </Button>
            </CardContent>
          </Card>

          {/* Paso 2: Obtener Chat IDs */}
          <Card className={step === 2 ? "ring-2 ring-blue-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  2
                </span>
                <Users className="h-5 w-5" />
                Obtener Chat IDs de Usuarios
              </CardTitle>
              <CardDescription>Agrega los Chat IDs de todas las personas que recibirán notificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>
                  Cada persona debe obtener su Chat ID individualmente. Puedes agregar tantos usuarios como quieras.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <p className="text-sm text-gray-600 font-medium">Cómo obtener el Chat ID:</p>
                <ol className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>1. Cada persona busca tu bot en Telegram</li>
                  <li>2. Envía cualquier mensaje (ej: "Hola")</li>
                  <li>3. Visita esta URL en tu navegador:</li>
                </ol>
                <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
                  {botToken
                    ? `https://api.telegram.org/bot${botToken}/getUpdates`
                    : "https://api.telegram.org/bot[TU_TOKEN]/getUpdates"}
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      botToken
                        ? `https://api.telegram.org/bot${botToken}/getUpdates`
                        : "https://api.telegram.org/bot[TU_TOKEN]/getUpdates",
                      "_blank",
                    )
                  }
                  disabled={!botToken}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir URL para obtener Chat IDs
                </Button>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-2">Alternativa: Usando @userinfobot</p>
                <ol className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>1. Cada persona busca @userinfobot en Telegram</li>
                  <li>2. Envía /start</li>
                  <li>3. Te dará su Chat ID directamente</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Chat IDs de Usuarios</Label>
                  <Button onClick={addChatId} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Usuario
                  </Button>
                </div>

                {chatIds.map((chatId, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input
                        placeholder={`Chat ID Usuario ${index + 1} (ej: 123456789)`}
                        value={chatId}
                        onChange={(e) => updateChatId(index, e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(chatId)}
                      disabled={!chatId.trim()}
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {chatIds.length > 1 && (
                      <Button
                        variant="outline"
                        onClick={() => removeChatId(index)}
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Usuarios configurados:</strong> {getValidChatIds().length}
                  </p>
                  {getValidChatIds().length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">Chat IDs: {getValidChatIds().join(", ")}</p>
                  )}
                </div>
              </div>

              <Button onClick={() => setStep(3)} disabled={getValidChatIds().length === 0} className="w-full">
                Continuar al Paso 3 ({getValidChatIds().length} usuarios)
              </Button>
            </CardContent>
          </Card>

          {/* Paso 3: Configurar Variables */}
          <Card className={step === 3 ? "ring-2 ring-blue-500" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  3
                </span>
                Configurar Variables de Entorno
              </CardTitle>
              <CardDescription>Configura las variables para {getValidChatIds().length} usuarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertDescription>Copia estas variables y configúralas en tu entorno de desarrollo:</AlertDescription>
              </Alert>

              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                <div>TELEGRAM_BOT_TOKEN={botToken || "[TU_TOKEN]"}</div>
                <div>TELEGRAM_CHAT_IDS={getValidChatIds().join(",") || "[CHAT_ID_1,CHAT_ID_2,CHAT_ID_3]"}</div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Para desarrollo local:</p>
                <ol className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>1. Crea un archivo .env.local en la raíz del proyecto</li>
                  <li>2. Pega las variables de arriba</li>
                  <li>3. Reinicia el servidor de desarrollo</li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">Para Vercel:</p>
                <ol className="text-sm text-gray-600 ml-4 space-y-1">
                  <li>1. Ve a tu proyecto en Vercel Dashboard</li>
                  <li>2. Settings → Environment Variables</li>
                  <li>3. Agrega ambas variables</li>
                  <li>4. Redeploy el proyecto</li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Los Chat IDs deben estar separados por comas sin espacios.
                </p>
                <p className="text-xs text-yellow-700 mt-1">Ejemplo: 123456789,987654321,555666777</p>
              </div>

              <Button
                onClick={() =>
                  copyToClipboard(`TELEGRAM_BOT_TOKEN=${botToken}\nTELEGRAM_CHAT_IDS=${getValidChatIds().join(",")}`)
                }
                disabled={!botToken || getValidChatIds().length === 0}
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copiar Variables de Entorno
              </Button>
            </CardContent>
          </Card>
        </div>

        {step === 3 && botToken && getValidChatIds().length > 0 && (
          <div className="mt-6 text-center">
            <Button onClick={() => (window.location.href = "/")} size="lg" className="bg-green-600 hover:bg-green-700">
              ✅ Configuración Completa - Ir al Dashboard ({getValidChatIds().length} usuarios)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
