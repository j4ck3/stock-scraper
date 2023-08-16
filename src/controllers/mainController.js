const express = require('express');
const router = express.Router();
const check = require('../services/scrapeService');

router.get('/check', async (req, res) => {
    try {
        const product = await check(req.body.url);

        if (product.stock == 'i lager') 
            res.status(200).json({ product });

        res.status(200).json({ product} );
        
    } catch (err) {
        console.error('Error checking stock:', err);
        res.status(500).json({ message: 'An error occurred while checking the product' });
    }
});

module.exports = router;