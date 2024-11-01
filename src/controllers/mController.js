const express = require('express')
const router = express.Router()
const getProductsFromSearch = require('../services/matsmartService')

router.get('/getproducts', async (req, res) => {
	try {
		const data = await getProductsFromSearch(req.query.url, req.query.area)

		if (data) res.status(200).json({ data })
		else {
			res.status(404).json({ message: 'No drinks' })
		}
	} catch (err) {
		console.error('Error:', err)
		res.status(500).json({
			message: 'An error occurred while getting products',
		})
	}
})

module.exports = router
