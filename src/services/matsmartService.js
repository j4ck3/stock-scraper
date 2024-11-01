const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const { executablePath } = require('puppeteer')

const getProductsFromSearch = async (url, productName) => {
	const browser = await puppeteer.launch({
		headless: false,
		executablePath: executablePath(),
	})
	const page = await browser.newPage()

	await page.goto(url, {
		waitUntil: 'domcontentloaded',
	})

	try {
		await page.waitForTimeout(3000)
	} catch (e) {
		console.error('waitForSelector product-list or product-item: not found')
		browser.close()
	}
	// get the price and stocks of all the stores
	try {
		const result = await page.evaluate(() => {
			const productItems = Array.from(
				document.querySelectorAll('.product-item')
			)

			const processData = (productItem) => {
				const priceElement = productItem.querySelector(
					'.product-item-price p'
				)
				const priceText = priceElement
					? priceElement.textContent.trim()
					: 'Price not found'

				const nameElement = productItem.querySelector('.label')
				const productName = nameElement
					? nameElement.textContent.trim()
					: 'Name not found'

				const brandAndQuantityElement =
					productItem.querySelector('.brand-and-weight')
				const brandAndQuantity = brandAndQuantityElement
					? brandAndQuantityElement.textContent.trim()
					: 'Brand and weight not found'

				const imageElement = productItem.querySelector(
					'.product-grid-item-image-col img:nth-child(2)'
				)
				const imageUrl = imageElement
					? imageElement.getAttribute('src')
					: 'Image URL not found'

				return {
					name: productName,
					brandAndQuantity: brandAndQuantity,
					price: priceText,
					imageUrl: imageUrl,
				}
			}
			const data = productItems.map(processData)

			return {
				products: data,
			}
		})

		if (result) {
			return result
			//   const filteredStores = result.stores.filter((store) => {
			//     const addressParts = store.address.split(',');
			//     return addressParts.length === 2 && addressParts[1].trim().toLowerCase() === area.toLowerCase();
			//   });
			//   return {
			//     price: result.price,
			//     stores: filteredStores,
			//   };
		} else {
			console.error('result is null')
			return { message: 'result is null' }
		}
	} catch (e) {
		console.error(e.message, 'could not get store data')
	} finally {
		browser.close()
	}
}

module.exports = getProductsFromSearch
