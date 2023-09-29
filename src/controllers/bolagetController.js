const express = require('express');
const router = express.Router();
const getStores = require('../services/bolaget/bolagetService');

router.get('/getstores', async (req, res) => {
    try {
        const data = await getStores(req.query.target, req.query.area);

        if (data) 
            res.status(200).json({ data });
        else {
            res.status(404).json({ message: 'Could not get the stores.' });
        }
     
    } catch (err) {
        console.error('Error checking stock:', err);
        res.status(500).json({ message: '500: An error occurred while checking the product' });
    }
});

module.exports = router;