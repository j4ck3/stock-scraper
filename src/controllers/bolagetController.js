const express = require('express');
const router = express.Router();
const getProduct = require('../services//bolaget/bolagetService');

router.get('/getstores', async (req, res) => {
    try {
        const storesList = await getProduct(req.query.target, req.query.area);

        if (storesList) 
            res.status(200).json({ storesList });
        else {
            res.status(404).json({ message: 'Could not get the stores.' });
        }
     
        
    } catch (err) {
        console.error('Error checking stock:', err);
        res.status(500).json({ message: '500: An error occurred while checking the product' });
    }
});

module.exports = router;