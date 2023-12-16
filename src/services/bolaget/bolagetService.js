const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const { executablePath } = require('puppeteer')

const getDrink = async (url, area) => {
	const browser = await puppeteer.launch({
		headless: false,
		executablePath: executablePath()
	})
	const page = await browser.newPage()

	// set age + cookies consent cookie
	const ageCookieValue = '{"state":{"verified":true},"version":0}'
	await page.setCookie({
		name: 'systembolaget.age',
		value: ageCookieValue,
		domain: '.systembolaget.se'
	})
	const consentCookieValue =
		'{"state":{"consentTypes":["useful","profiling","mandatory","statistical"]},"version":0}'
	await page.setCookie({
		name: 'systembolaget.consent',
		value: consentCookieValue,
		domain: '.systembolaget.se'
	})

	await page.goto(url, {
		waitUntil: 'domcontentloaded'
	})

	//find & click the available stores button
	try {
		const button = await page.waitForSelector('.css-11pwr62')
		button.click()
	} catch {
		console.error(`available stores button not found`)
		browser.close()
		return
	}

	try {
		await page.waitForSelector('.css-uxm6qc')
		await page.waitForSelector('.css-1yyr77e')
	} catch (e) {
		console.error('could not find selectors for stores')
		browser.close()
	}

	// get the price and stocks of all the stores
	try {
		const result = await page.evaluate(() => {
			const buttons = Array.from(
				document.querySelectorAll('button.css-1yyr77e')
			)
			const processData = (button) => {
				const paragraphs = Array.from(button.querySelectorAll('p'))
				return {
					address:
						paragraphs[2].textContent.toLowerCase().trim() ||
						'no address',
					city:
						paragraphs[0].textContent.toLowerCase().trim() || 'no city',
					amount: paragraphs[1].textContent.trim() || 'no amount'
				}
			}
			const data = buttons.map(processData)

			//then get the price
			const elements = document.getElementsByClassName('css-1ss6sno')
			const price = elements[0].innerText

			return {
				price: price,
				stores: data
			}
		})

		//filter stores on area
		if (result) {
			const filteredStores = result.stores.filter((store) => {
				const addressParts = store.address.split(',')
				return (
					addressParts.length === 2 &&
					addressParts[1].trim().toLowerCase() === area.toLowerCase()
				)
			})
			return {
				success: true,
				price: result.price,
				stores: filteredStores
			}
		} else {
			console.error('result is null')
			return { success: true, stores: [] }
		}
	} catch (e) {
		console.error(e.message, 'could not get store data')
		return { success: false, error: e.message }
	} finally {
		browser.close()
	}
}

module.exports = getDrink
