require('dotenv').config()
const schedule = require('node-schedule')
const getTriggizService = require('./services/nordic/nordicService')
const express = require('express')
const app = express()
app.use(express.json())
const mainController = require('./controllers/mainController')
const bolagetController = require('./controllers/bolagetController')
const mController = require('./controllers/mController')
const TelegramBot = require('node-telegram-bot-api')
app.use('/api', mainController)
app.use('/api/bolaget', bolagetController)
app.use('/api/m', mController)

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHANNELID = process.env.TELEGRAM_CHANNELID

const sendTelegramNotification = async (message, p0) => {
	try {
		const bot = new TelegramBot(BOT_TOKEN)
		await bot.sendMessage(CHANNELID, message, p0)
	} catch (error) {
		console.error('Error sending message:', error)
	}
}

try {
  //every 30 minutes during the hours of 13:00 to 20:00, every day of the week.
	const job = schedule.scheduleJob('*/30 13-20 * * *', async () => {
		const result = await getTriggizService()

		const message = `${result.maxValue} triggz och kan hämta ut en ....`
		const notifyPattern = /^(5|[6-9]|[1-9]\d+)?0{3}0$/
		if (notifyPattern.test(result.maxValue.toString())) {
			await sendTelegramNotification(message, { parse_mode: 'Html' })
		}
    
		//await sendTelegramNotification(message, { parse_mode: 'Html' })
	})
} catch (err) {
	console.error('Failed to execute job:', err)
}

const PORT = 5000
app.listen(PORT, () => {
	console.log(`Listening on ${PORT}`)
})
