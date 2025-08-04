// Script de scraping real usando Puppeteer
import puppeteer from "puppeteer"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

async function scrapeLaCoopeReal() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

    console.log("Navegando a La Coope en Casa...")
    await page.goto("https://www.lacoopeencasa.coop/?loc=126&me-sel=true&me=2&pr=126&loc-cli=114", {
      waitUntil: "networkidle2",
      timeout: 30000,
    })

    // Esperar a que carguen los productos
    await page.waitForSelector(".product-item, .producto, [data-product]", { timeout: 10000 })

    // Extraer productos de Pepsi y Coca-Cola
    const products = await page.evaluate(() => {
      const productElements = document.querySelectorAll(".product-item, .producto, [data-product], .card-product")
      const products = []

      productElements.forEach((element) => {
        const nameElement = element.querySelector(".product-name, .nombre, h3, .title, [data-name]")
        const priceElement = element.querySelector(".price, .precio, .cost, [data-price]")

        if (nameElement && priceElement) {
          const name = nameElement.textContent.trim()
          const priceText = priceElement.textContent.trim()

          // Buscar productos de Pepsi o Coca-Cola
          if (name.toLowerCase().includes("pepsi") || name.toLowerCase().includes("coca")) {
            // Extraer precio numérico
            const priceMatch = priceText.match(/[\d.,]+/)
            if (priceMatch) {
              const price = Number.parseFloat(priceMatch[0].replace(",", "."))

              products.push({
                name: name,
                price: price,
                priceText: priceText,
                store: "La Coope en Casa",
              })
            }
          }
        }
      })

      return products
    })

    console.log(`Encontrados ${products.length} productos en La Coope`)
    return products
  } catch (error) {
    console.error("Error scraping La Coope:", error)
    return []
  } finally {
    await browser.close()
  }
}

async function scrapeCarrefourReal() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    const page = await browser.newPage()
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

    console.log("Navegando a Carrefour...")

    // Buscar Pepsi
    await page.goto("https://www.carrefour.com.ar/pepsi", {
      waitUntil: "networkidle2",
      timeout: 30000,
    })

    await page.waitForSelector('.product-card, .vtex-product-summary, [data-testid="product-summary"]', {
      timeout: 10000,
    })

    const pepsiProducts = await page.evaluate(() => {
      const productElements = document.querySelectorAll(
        '.product-card, .vtex-product-summary, [data-testid="product-summary"]',
      )
      const products = []

      productElements.forEach((element) => {
        const nameElement = element.querySelector(".product-name, h3, .vtex-product-summary-2-x-productBrand")
        const priceElement = element.querySelector('.price, .vtex-product-price, [data-testid="price"]')

        if (nameElement && priceElement) {
          const name = nameElement.textContent.trim()
          const priceText = priceElement.textContent.trim()

          const priceMatch = priceText.match(/[\d.,]+/)
          if (priceMatch) {
            const price = Number.parseFloat(priceMatch[0].replace(",", "."))

            products.push({
              name: name,
              price: price,
              priceText: priceText,
              store: "Carrefour",
            })
          }
        }
      })

      return products
    })

    // Buscar Coca-Cola
    await page.goto("https://www.carrefour.com.ar/coca-cola", {
      waitUntil: "networkidle2",
      timeout: 30000,
    })

    const cocaProducts = await page.evaluate(() => {
      const productElements = document.querySelectorAll(
        '.product-card, .vtex-product-summary, [data-testid="product-summary"]',
      )
      const products = []

      productElements.forEach((element) => {
        const nameElement = element.querySelector(".product-name, h3, .vtex-product-summary-2-x-productBrand")
        const priceElement = element.querySelector('.price, .vtex-product-price, [data-testid="price"]')

        if (nameElement && priceElement) {
          const name = nameElement.textContent.trim()
          const priceText = priceElement.textContent.trim()

          const priceMatch = priceText.match(/[\d.,]+/)
          if (priceMatch) {
            const price = Number.parseFloat(priceMatch[0].replace(",", "."))

            products.push({
              name: name,
              price: price,
              priceText: priceText,
              store: "Carrefour",
            })
          }
        }
      })

      return products
    })

    const allProducts = [...pepsiProducts, ...cocaProducts]
    console.log(`Encontrados ${allProducts.length} productos en Carrefour`)
    return allProducts
  } catch (error) {
    console.error("Error scraping Carrefour:", error)
    return []
  } finally {
    await browser.close()
  }
}

function filterDeals(products) {
  return products.filter((product) => {
    const name = product.name.toLowerCase()
    const price = product.price

    // Detectar tamaño del producto
    if (name.includes("500") || name.includes("500cc") || name.includes("500ml")) {
      return price < 1000
    }

    if (name.includes("1.5") || name.includes("1,5") || name.includes("2l") || name.includes("2 l")) {
      return price < 2000
    }

    return false
  })
}

async function sendTelegramNotification(deals) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID || deals.length === 0) return

  let message = "🎉 <b>¡Ofertas encontradas!</b>\n\n"

  deals.forEach((deal) => {
    message += `💰 <b>${deal.name}</b>\n`
    message += `💵 Precio: ${deal.priceText}\n`
    message += `🏪 Tienda: ${deal.store}\n\n`
  })

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    })

    if (response.ok) {
      console.log("Notificación enviada exitosamente")
    } else {
      console.error("Error enviando notificación:", await response.text())
    }
  } catch (error) {
    console.error("Error enviando notificación:", error)
  }
}

async function main() {
  console.log("Iniciando monitoreo de precios...")

  try {
    // Scraping de ambos sitios
    const [coopeProducts, carrefourProducts] = await Promise.all([scrapeLaCoopeReal(), scrapeCarrefourReal()])

    const allProducts = [...coopeProducts, ...carrefourProducts]
    console.log(`Total de productos encontrados: ${allProducts.length}`)

    // Filtrar ofertas
    const deals = filterDeals(allProducts)
    console.log(`Ofertas encontradas: ${deals.length}`)

    if (deals.length > 0) {
      console.log("Ofertas:", deals)
      await sendTelegramNotification(deals)
    } else {
      console.log("No se encontraron ofertas")
    }
  } catch (error) {
    console.error("Error en el monitoreo:", error)
  }
}

// Ejecutar el script
main()

// Programar ejecución cada 30 minutos
setInterval(main, 30 * 60 * 1000)
