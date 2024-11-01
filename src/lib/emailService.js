const nodemailer = require('nodemailer')
const GMAIL_EMAIL = process.env.GMAIL_EMAIL
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD

const sendEmail = async (product) => {
	const parsedUrl = new URL(product.url)
	const pathnameParts = parsedUrl.pathname.split('/')
	const desiredValue = pathnameParts[pathnameParts.length - 1].replaceAll(
		'-',
		' '
	)

	const html = `
        <h2>NU FINNS ${desiredValue} TILLGÄNGLIG</h2>
        <a href=${product.url}>KLICKA HÄR FÖR ATT KOMMA TILL KÖPSIDAN.</a>
    `

	try {
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: GMAIL_EMAIL,
				pass: GMAIL_PASSWORD,
			},
		})

		const info = await transporter.sendMail({
			from: `StockScraper <${GMAIL_EMAIL}>`,
			to: GMAIL_EMAIL,
			subject: `${desiredValue} FINNS NU TILLGÄNGLIG`,
			html: html,
		})

		console.log('Email sent successfully ' + info.messageId)
	} catch (err) {
		console.error('Failed to send the mail:', err)
	}
}

module.exports = sendEmail
