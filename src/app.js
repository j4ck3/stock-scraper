require('dotenv').config()
const express = require('express')
const app = express()
app.use(express.json())
const schedule = require('node-schedule')
const getTriggiz = require('./services/triggizService')
const TelegramBot = require('node-telegram-bot-api')

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHANNELID = process.env.TELEGRAM_CHANNELID

const sendTelegramNotification = async (message) => {
	try {
		const bot = new TelegramBot(BOT_TOKEN)
		await bot.sendMessage(CHANNELID, message, { parse_mode: 'Html' })
	} catch (error) {
		console.error('Error sending message:', error)
	}
}

async function checkTriggizStatus() {
	try {
		const result = await getTriggiz()

		const triggizNumber = result.triggiz.replace(/\D/g, '')

		const notifyPattern = /^(?:[1-9]\d*)000$/
		const triggizValueIsRewardThreshold = notifyPattern.test(triggizNumber)
		if (!triggizValueIsRewardThreshold) return

		const message = `✅ ${result.triggiz}
🚀 ${result.milestone}
📌 ${triggizValueIsRewardThreshold}`

		await sendTelegramNotification(message)
	} catch (error) {
		console.error('Error in checkTriggizStatus:', error)
	}
}

const executeJob = async () => {
	try {
		await checkTriggizStatus()
	} catch (err) {
		console.error('Failed to execute job:', err)
	}
}

;(async () => {
	try {
		if (process.env.NODE_ENV === 'production') {
			console.log('Running in production mode')
			await checkTriggizStatus()
		}
	} catch (error) {
		console.error('Error executing job:', error)
	}
})()

// Schedule the job to run every day at 12:00
const job = schedule.scheduleJob('0 12 * * *', async () => {
	await executeJob()
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
	console.log(`Listening on ${PORT}`)
})
