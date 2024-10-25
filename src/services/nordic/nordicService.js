const puppeteer = require('puppeteer')
require('dotenv').config()

const getTriggiz = async () => {
	const browser = await puppeteer.launch({ headless: true })
	const page = await browser.newPage()

	try {
		await page.goto(process.env.LOGIN_URL, {
			waitUntil: 'networkidle2' // Wait until all network requests are finished
		})

		const email = process.env.NORDIC_WELLNESS_LOGIN_EMAIL
		const password = process.env.NORDIC_WELLNESS_LOGIN_PASSWORD

		await page.evaluate(
			(email, password) => {
				document.querySelector('input[id="UserName"]').value = email
				document.querySelector('input[id="Password"]').value = password
			},
			email,
			password
		)

		await Promise.all([
			page.$eval('button[type="submit"]', (form) => form.click()),
			page.waitForNavigation({ waitUntil: 'networkidle2' })
		])

		const maxValue = await page.$eval(
			'.independent-section .content-wrapper .drop-chart .drops-text',
			(el) => el.textContent
		)
		const minValue = await page.$eval(
			'.independent-section .content-wrapper .drop-chart .sub-text',
			(el) => el.textContent
		)

		return { minValue, maxValue } // Return values here
	} catch (error) {
		console.error('Error during login with Puppeteer:', error)
		return { minValue: null, maxValue: null } // Return null values if there's an error
	} finally {
		await browser.close() // Ensure the browser closes in all scenarios
	}
}

module.exports = getTriggiz
