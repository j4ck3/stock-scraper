require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
const schedule = require('node-schedule')
const getTriggiz = require('./services/triggizService')
const TelegramBot = require('node-telegram-bot-api')

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

const executeJob = async () => {
	try {
		const result = await getTriggiz()

		const triggizNumber = result.triggiz.replace(/\D/g, '')

		const notifyPattern = /^(5|[6-9]|[1-9]\d+)?0{3}0$/
		const triggizValueIsRewardThreshold = notifyPattern.test(
			triggizNumber.toString()
		)

		const message = `✅ ${result.triggiz}
🚀 ${result.milestone}
📌 ${triggizValueIsRewardThreshold}`

		await sendTelegramNotification(message, { parse_mode: 'Html' })
	} catch (err) {
		console.error('Failed to execute job:', err)
	}
}

// Schedule the job to run every day at 20:00
const job = schedule.scheduleJob('0 20 * * *', async () => {
	await executeJob()
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`Listening on ${PORT}`)
})
