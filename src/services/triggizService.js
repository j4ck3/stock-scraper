const puppeteer = require('puppeteer')
require('dotenv').config()

const getTriggiz = async () => {
	const isProduction = process.env.NODE_ENV === 'production'

	const executablePath = puppeteer.executablePath()

	const browser = await puppeteer.launch({
		headless: isProduction ? 'new' : false,
		executablePath: isProduction ? executablePath : undefined,
		args: isProduction ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
	})
	const page = await browser.newPage()

	try {
		await page.goto(process.env.LOGIN_URL, {
			waitUntil: 'networkidle2',
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
			page.waitForNavigation({ waitUntil: 'networkidle2' }),
		])

		const triggiz = await page.$eval(
			'.independent-section .content-wrapper .drop-chart .drops-text',
			(el) => el.textContent
		)
		const milestone = await page.$eval(
			'.independent-section .content-wrapper .drop-chart .sub-text',
			(el) => el.textContent
		)

		return { triggiz, milestone }
	} catch (error) {
		console.error('Error during login with Puppeteer:', error)
		return { minValue: null, maxValue: null }
	} finally {
		await browser.close()
	}
}

module.exports = getTriggiz
