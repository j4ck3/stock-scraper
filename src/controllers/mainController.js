const express = require('express')
const router = express.Router()
const check = require('../services/main/scrapeService')

router.get('/check', async (req, res) => {
	try {
		const product = await check(req.query.target)

		if (product) res.status(200).json({ product })
		else {
			res.status(404).json({ message: 'Could not find the product' })
		}
	} catch (err) {
		console.error('Error checking stock:', err)
		res.status(500).json({
			message: '500: An error occurred while checking the product',
		})
	}
})

module.exports = router
